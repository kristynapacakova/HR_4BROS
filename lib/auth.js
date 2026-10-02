// Jednoduché přihlášení jedním heslem (APP_PASSWORD).
// Po přihlášení dostane prohlížeč HttpOnly cookie s podpisem odvozeným z hesla,
// takže změna hesla na Vercelu odhlásí všechna zařízení.
import crypto from "node:crypto";
import { httpError } from "./http.js";

const COOKIE = "hr_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dní

const password = () => process.env.APP_PASSWORD || "";
const onVercel = () => Boolean(process.env.VERCEL);

/** Lokálně bez hesla appka funguje bez přihlášení; na Vercelu je heslo povinné. */
export function authRequired() {
  return Boolean(password()) || onVercel();
}

function sessionToken() {
  return crypto.createHmac("sha256", password()).update("fourbros-hr-session-v1").digest("base64url");
}

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return "";
}

export function isLoggedIn(request) {
  if (!authRequired()) return true;
  if (!password()) return false;
  return safeEqual(readCookie(request, COOKIE), sessionToken());
}

/** Vyhodí 401, pokud požadavek nemá platné přihlášení. */
export function requireAuth(request) {
  if (onVercel() && !password()) {
    throw httpError(503, "Na Vercelu chybí APP_PASSWORD. Přidej ho v Settings → Environment Variables a udělej Redeploy.");
  }
  if (!isLoggedIn(request)) {
    const err = httpError(401, "Přihlas se.");
    err.login = true;
    throw err;
  }
}

function cookie(value, maxAge, request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export async function login(request, given) {
  if (!password()) throw httpError(503, "Heslo není nastavené (APP_PASSWORD).");
  if (typeof given !== "string" || !safeEqual(given, password())) {
    await new Promise((r) => setTimeout(r, 800)); // zpomalí hádání hesla
    throw httpError(403, "Špatné heslo.");
  }
  return cookie(sessionToken(), MAX_AGE, request);
}

export function logoutCookie(request) {
  return cookie("", 0, request);
}
