// API handlery ve tvaru Web Request → Response.
// Používají je Vercel funkce v api/ i lokální server.js.
import { json, readJson, errorResponse, httpError } from "./http.js";
import { authRequired, isLoggedIn, requireAuth, login, logoutCookie } from "./auth.js";
import { getStore, storageKind, validTranscriptKey } from "./store.js";
import { analyze, aiReady, MODEL } from "./analyze.js";

const MAX_TRANSCRIPT = 1_000_000; // znaků

function handle(fn) {
  return async (request) => {
    try {
      return await fn(request);
    } catch (err) {
      const res = errorResponse(err);
      if (err.login) return json(401, { error: err.message, login: true });
      return res;
    }
  };
}

export const status = handle(async (request) =>
  json(200, {
    authRequired: authRequired(),
    loggedIn: isLoggedIn(request),
    aiReady: aiReady(),
    storage: storageKind(),
    model: MODEL,
  }),
);

export const postLogin = handle(async (request) => {
  const { password } = await readJson(request);
  const setCookie = await login(request, password);
  return json(200, { ok: true }, { "Set-Cookie": setCookie });
});

export const postLogout = handle(async (request) => json(200, { ok: true }, { "Set-Cookie": logoutCookie(request) }));

export const getData = handle(async (request) => {
  requireAuth(request);
  return json(200, await getStore().getAll());
});

export const putData = handle(async (request) => {
  requireAuth(request);
  const { core } = await readJson(request);
  if (!core || typeof core !== "object" || !Array.isArray(core.people) || !core.settings) {
    throw httpError(400, "Neplatná data.");
  }
  await getStore().putCore(core);
  return json(200, { ok: true });
});

export const putTranscript = handle(async (request) => {
  requireAuth(request);
  const { key, text } = await readJson(request);
  validTranscriptKey(key);
  if (typeof text !== "string" || !text.trim()) throw httpError(400, "Prázdný přepis.");
  if (text.length > MAX_TRANSCRIPT) throw httpError(413, "Přepis je moc dlouhý.");
  await getStore().putTranscript(key, text);
  return json(200, { ok: true });
});

export const deleteTranscript = handle(async (request) => {
  requireAuth(request);
  const key = validTranscriptKey(new URL(request.url).searchParams.get("key"));
  await getStore().deleteTranscript(key);
  return json(200, { ok: true });
});

export const postAnalyze = handle(async (request) => {
  requireAuth(request);
  const result = await analyze(await readJson(request));
  return json(200, { result });
});
