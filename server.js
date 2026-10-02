// Four Bros HR check-in – lokální server.
// Data drží v data/db.json (necommituje se), přepisy posílá k analýze do Claude API.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(here, "public");
const DATA_DIR = path.join(here, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const MODEL = "claude-opus-5-5";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

// ---------- úložiště ----------

async function readDb() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

async function writeDb(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

// ---------- analýza přepisu ----------

const aiReady = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

let client = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

const STATUS = { type: "string", enum: ["green", "orange", "red"] };

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "overall",
    "headline",
    "summary",
    "values",
    "redFlags",
    "strengths",
    "followUpQuestions",
    "recommendation",
  ],
  properties: {
    overall: STATUS,
    headline: { type: "string" },
    summary: { type: "string" },
    values: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "status", "evidence", "comment"],
        properties: {
          name: { type: "string" },
          status: { type: "string", enum: ["green", "orange", "red", "unknown"] },
          evidence: { type: "string" },
          comment: { type: "string" },
        },
      },
    },
    redFlags: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "severity", "evidence", "comment"],
        properties: {
          name: { type: "string" },
          severity: { type: "string", enum: ["orange", "red"] },
          evidence: { type: "string" },
          comment: { type: "string" },
        },
      },
    },
    strengths: { type: "array", items: { type: "string" } },
    followUpQuestions: { type: "array", items: { type: "string" } },
    recommendation: { type: "string" },
  },
};

const SYSTEM_PROMPT = `Jsi zkušená HR partnerka ve firmě Four Bros (brněnská marketingová agentura). Pomáháš HR vyhodnocovat adaptační check-iny nováčků během prvních 3 měsíců (zkušební doby).

Dostaneš přepis rozhovoru HR s nováčkem, firemní hodnoty a seznam varovných signálů (red flags). Tvým úkolem je férově posoudit, jak postoje a chování člověka souzní s kulturou Four Bros, a upozornit na rizika.

Pravidla:
- Opírej se jen o to, co v přepisu skutečně zaznělo. Ke každému hodnocení dej krátkou doslovnou citaci (evidence). Když k hodnotě nic nezaznělo, dej status "unknown" a evidence nech prázdnou.
- Semafor: "green" = jasně souzní, "orange" = nejasné / smíšené / stojí za doptání, "red" = jde proti hodnotě nebo je to vážný signál.
- Red flag uváděj jen tehdy, když ho přepis opravdu dokládá. Nevymýšlej. Rozlišuj běžnou nejistotu nováčka (normální v prvních týdnech) od skutečného varovného signálu.
- Zohledni fázi adaptace (týden 2 je jiný než měsíc 3) a zaměření daného check-inu.
- Nehodnoť osobnost ani chráněné charakteristiky (věk, zdraví, rodina, původ apod.) – jen pracovní postoje a chování.
- Celkový stav (overall): "red", pokud je aspoň jeden vážný red flag; "orange", pokud jsou nejasnosti nebo menší signály; jinak "green".
- headline: jedna krátká věta shrnutí. summary: 3–5 vět. recommendation: konkrétní další krok pro HR / leadera.
- followUpQuestions: 3–5 otázek na příští check-in, tykej.
- Piš česky, lidsky a přímo – tak, jak mluví Four Bros.`;

function buildUserPrompt({ person, checkpoint, settings, transcript }) {
  const values = settings.values
    .map((v) => `- ${v.name}: ${v.description}`)
    .join("\n");
  const flags = settings.redFlags
    .map((f) => `- ${f.name}: ${f.description}`)
    .join("\n");
  return `<kontext>
Jméno: ${person.name}
Pozice: ${person.role || "neuvedeno"}
Tým: ${person.team || "neuvedeno"}
Datum nástupu: ${person.startDate}
Check-in: ${checkpoint.label} (den ${checkpoint.day} od nástupu)
Zaměření check-inu: ${checkpoint.focus || "obecný adaptační rozhovor"}
</kontext>

<hodnoty_four_bros>
${values}
</hodnoty_four_bros>

<red_flags>
${flags}
</red_flags>

<prepis>
${transcript}
</prepis>

Vyhodnoť přepis. V poli "values" uveď každou hodnotu ze seznamu právě jednou (stejný název). V poli "redFlags" uveď jen ty signály, které přepis dokládá (můžeš přidat i signál mimo seznam, pokud je závažný).`;
}

async function analyze(payload) {
  const { person, checkpoint, settings, transcript } = payload || {};
  if (!person || !checkpoint || !settings || !transcript?.trim()) {
    throw httpError(400, "Chybí přepis nebo údaje o člověku / check-inu.");
  }
  if (!aiReady()) {
    throw httpError(401, "Chybí ANTHROPIC_API_KEY. Doplň ho do souboru .env a restartuj appku.");
  }

  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: ANALYSIS_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt({ person, checkpoint, settings, transcript }) },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw httpError(422, "Model analýzu odmítl. Zkontroluj, že přepis obsahuje jen pracovní rozhovor.");
  }
  if (response.stop_reason === "max_tokens") {
    throw httpError(502, "Odpověď modelu byla useknutá. Zkus to prosím znovu.");
  }

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw httpError(502, "Model nevrátil platný výsledek. Zkus to prosím znovu.");
  }
  return { ...result, model: response.model, analyzedAt: new Date().toISOString() };
}

// ---------- HTTP ----------

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readBody(req, limit = 10 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw httpError(413, "Soubor je moc velký.");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw httpError(400, "Neplatný JSON.");
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Nenalezeno");
  }
}

function apiErrorMessage(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return [401, "Neplatný nebo chybějící ANTHROPIC_API_KEY. Doplň ho do souboru .env a restartuj appku."];
  }
  if (err instanceof Anthropic.RateLimitError) {
    return [429, "Claude API je teď přetížené (rate limit). Zkus to za chvíli."];
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return [502, "Nepodařilo se spojit s Claude API. Zkontroluj připojení k internetu."];
  }
  if (err instanceof Anthropic.APIError) {
    return [502, `Chyba Claude API (${err.status}): ${err.message}`];
  }
  return [err.status || 500, err.message || "Neznámá chyba"];
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/data" && req.method === "GET") {
      return sendJson(res, 200, { db: await readDb() });
    }
    if (req.url === "/api/data" && req.method === "PUT") {
      const body = await readBody(req, 50 * 1024 * 1024);
      if (!body.db || !Array.isArray(body.db.people)) throw httpError(400, "Neplatná data.");
      await writeDb(body.db);
      return sendJson(res, 200, { ok: true });
    }
    if (req.url === "/api/status" && req.method === "GET") {
      return sendJson(res, 200, { aiReady: aiReady(), model: MODEL });
    }
    if (req.url === "/api/analyze" && req.method === "POST") {
      const result = await analyze(await readBody(req));
      return sendJson(res, 200, { result });
    }
    if (req.url.startsWith("/api/")) throw httpError(404, "Neznámý endpoint.");
    if (req.method !== "GET") throw httpError(405, "Metoda není povolená.");
    return serveStatic(req, res);
  } catch (err) {
    const [status, message] = apiErrorMessage(err);
    if (status >= 500) console.error(err);
    sendJson(res, status, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Four Bros HR check-in běží na http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  if (!aiReady()) {
    console.log("Pozor: chybí ANTHROPIC_API_KEY – vše funguje, jen analýza přepisů ne. Viz README.");
  }
});
