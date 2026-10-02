// Úložiště dat.
// Na Vercelu: Upstash Redis (přes REST, proměnné KV_REST_API_URL + KV_REST_API_TOKEN
// nebo UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN – obojí nastaví Vercel Marketplace).
// Lokálně bez Redisu: soubory ve složce data/.
//
// Data = "core" (nastavení + lidé bez přepisů) a zvlášť každý přepis,
// aby žádný požadavek nenarazil na limit velikosti.
import fs from "node:fs/promises";
import path from "node:path";
import { httpError } from "./http.js";

const PREFIX = "fourbros-hr";
const CORE_KEY = `${PREFIX}:core`;
const TKEYS_KEY = `${PREFIX}:transcript-keys`;
const tKey = (key) => `${PREFIX}:t:${key}`;

const TRANSCRIPT_KEY_RE = /^[A-Za-z0-9_-]{1,120}$/;

export function validTranscriptKey(key) {
  if (typeof key !== "string" || !TRANSCRIPT_KEY_RE.test(key)) throw httpError(400, "Neplatný klíč přepisu.");
  return key;
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function storageKind() {
  if (redisConfig()) return "redis";
  return process.env.VERCEL ? "missing" : "file";
}

// ---------- Redis (Upstash REST) ----------

async function redis(commands) {
  const { url, token } = redisConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw httpError(502, `Databáze neodpovídá (${res.status}).`);
  const out = await res.json();
  const failed = out.find((r) => r.error);
  if (failed) throw httpError(502, `Chyba databáze: ${failed.error}`);
  return out.map((r) => r.result);
}

const redisStore = {
  async getAll() {
    const [core, keys] = await redis([["GET", CORE_KEY], ["SMEMBERS", TKEYS_KEY]]);
    const transcripts = {};
    if (keys?.length) {
      const [values] = await redis([["MGET", ...keys.map(tKey)]]);
      keys.forEach((k, i) => {
        if (values[i]) transcripts[k] = values[i];
      });
    }
    return { core: core ? JSON.parse(core) : null, transcripts };
  },
  async putCore(core) {
    await redis([["SET", CORE_KEY, JSON.stringify(core)]]);
  },
  async putTranscript(key, text) {
    await redis([["SET", tKey(key), text], ["SADD", TKEYS_KEY, key]]);
  },
  async deleteTranscript(key) {
    await redis([["DEL", tKey(key)], ["SREM", TKEYS_KEY, key]]);
  },
};

// ---------- soubory (lokální vývoj) ----------

const DATA_DIR = path.join(process.cwd(), "data");
const T_DIR = path.join(DATA_DIR, "transcripts");

async function writeAtomic(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file + ".tmp", content, "utf8");
  await fs.rename(file + ".tmp", file);
}

const fileStore = {
  async getAll() {
    let core = null;
    try {
      core = JSON.parse(await fs.readFile(path.join(DATA_DIR, "core.json"), "utf8"));
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    const transcripts = {};
    let files = [];
    try {
      files = await fs.readdir(T_DIR);
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    for (const f of files.filter((f) => f.endsWith(".txt"))) {
      transcripts[f.slice(0, -4)] = await fs.readFile(path.join(T_DIR, f), "utf8");
    }
    return { core, transcripts };
  },
  async putCore(core) {
    await writeAtomic(path.join(DATA_DIR, "core.json"), JSON.stringify(core, null, 2));
  },
  async putTranscript(key, text) {
    await writeAtomic(path.join(T_DIR, `${key}.txt`), text);
  },
  async deleteTranscript(key) {
    await fs.rm(path.join(T_DIR, `${key}.txt`), { force: true });
  },
};

export function getStore() {
  const kind = storageKind();
  if (kind === "redis") return redisStore;
  if (kind === "file") return fileStore;
  throw httpError(
    503,
    "Appka nemá připojenou databázi. Na Vercelu otevři projekt → Storage → Upstash (Redis) → Connect a pak udělej Redeploy.",
  );
}
