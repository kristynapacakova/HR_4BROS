// Four Bros HR check-in – lokální server pro běh na vlastním počítači.
// Na Vercelu se nepoužívá: tam běží funkce ze složky api/ a statické soubory z public/.
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as routes from "./lib/routes.js";
import { storageKind } from "./lib/store.js";
import { aiReady } from "./lib/analyze.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(here, "public");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

const API = {
  "GET /api/status": routes.status,
  "POST /api/login": routes.postLogin,
  "POST /api/logout": routes.postLogout,
  "GET /api/data": routes.getData,
  "PUT /api/data": routes.putData,
  "PUT /api/transcript": routes.putTranscript,
  "DELETE /api/transcript": routes.deleteTranscript,
  "POST /api/analyze": routes.postAnalyze,
};

async function toRequest(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(`http://${req.headers.host || "localhost"}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });
}

async function sendResponse(res, response) {
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
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

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const handler = API[`${req.method} ${pathname}`];
  if (handler) return sendResponse(res, await handler(await toRequest(req)));
  if (pathname.startsWith("/api/")) {
    res.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Neznámý endpoint." }));
    return;
  }
  return serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Four Bros HR check-in běží na http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(`Úložiště: ${storageKind() === "redis" ? "Upstash Redis" : "složka data/"}`);
  if (!aiReady()) console.log("Pozor: chybí ANTHROPIC_API_KEY – vše funguje, jen vyhodnocení přepisů ne.");
});
