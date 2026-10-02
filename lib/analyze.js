// Vyhodnocení přepisu check-inu přes Claude API.
import Anthropic from "@anthropic-ai/sdk";
import { httpError } from "./http.js";

export const MODEL = "claude-opus-5-5";

export const aiReady = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

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

export async function analyze(payload) {
  const { person, checkpoint, settings, transcript } = payload || {};
  if (!person || !checkpoint || !settings || !transcript?.trim()) {
    throw httpError(400, "Chybí přepis nebo údaje o člověku / check-inu.");
  }
  if (!aiReady()) {
    throw httpError(503, "Chybí ANTHROPIC_API_KEY. Na Vercelu ho přidej v Settings → Environment Variables a udělej Redeploy, lokálně do souboru .env.");
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
