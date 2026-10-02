"use strict";

// =====================================================================
// Four Bros HR check-iny – frontend (bez frameworku)
// =====================================================================

const DEFAULT_SETTINGS = {
  values: [
    { id: "v-vysledky", name: "Výsledky mluví za nás", description: "Práci dotahuje do konce, zajímá ho/ji reálný dopad a měřitelný výsledek, ne jen odvedená činnost." },
    { id: "v-data", name: "Data a vědecký přístup", description: "Rozhoduje se na základě dat, testuje hypotézy, ověřuje si fakta místo dojmů." },
    { id: "v-primost", name: "Osobní a přímý přístup", description: "Mluví narovinu, lidsky a bez zbytečné formálnosti – s kolegy i s klienty." },
    { id: "v-otevrenost", name: "Radikální otevřenost", description: "Otevřeně pojmenuje rizika, chyby i očekávání; sám/sama o zpětnou vazbu stojí a umí ji přijmout." },
    { id: "v-marketing", name: "Marketing nás baví", description: "Opravdový zájem o obor, zvídavost, chuť se učit a sledovat novinky." },
    { id: "v-vpred", name: "Posouváme se vpřed", description: "Iniciativa, růstové myšlení, přináší vlastní nápady a unikátní zkušenost z předchozí kariéry." },
    { id: "v-tym", name: "Tým a odpovědnost", description: "Spolehlivost, ownership za svou část, ochota pomoct týmu." },
  ],
  redFlags: [
    { id: "r-vina", name: "Svalování viny", description: "Vyhýbá se odpovědnosti, chyby připisuje ostatním nebo okolnostem." },
    { id: "r-feedback", name: "Odmítání zpětné vazby", description: "Reaguje defenzivně, zpětnou vazbu bagatelizuje nebo ignoruje." },
    { id: "r-netransparentnost", name: "Zamlčování problémů", description: "Netransparentnost, problémy nehlásí včas, něco zakrývá." },
    { id: "r-nezajem", name: "Nezájem o obor a práci", description: "Práce jen „za peníze“, žádná zvídavost ani vlastní iniciativa." },
    { id: "r-negativita", name: "Negativita vůči týmu / klientům", description: "Pomlouvání, cynismus, opakovaná kritika bez návrhu řešení." },
    { id: "r-ocekavani", name: "Nesoulad očekávání", description: "Jiná představa o roli, penězích, home office, kariérním růstu nebo tempu." },
    { id: "r-odchod", name: "Signály odchodu", description: "Zmínky o hledání jiné práce, nejistota, jestli zůstat." },
    { id: "r-pretizeni", name: "Přetížení / izolace", description: "Známky vyhoření, stresu, pocit osamění nebo nedostatku podpory." },
    { id: "r-spolehlivost", name: "Nespolehlivost", description: "Nedodržuje termíny, sliby nebo domluvená pravidla." },
  ],
  checkpoints: [
    { id: "c-14", day: 14, label: "Po 2 týdnech", focus: "První dojmy, onboarding, jestli realita odpovídá očekávání, co chybí." },
    { id: "c-30", day: 30, label: "Po 1 měsíci", focus: "Zapojení do týmu, pochopení role, první zkušenost s kulturou Four Bros." },
    { id: "c-60", day: 60, label: "Po 2 měsících", focus: "Samostatnost, výkon, práce se zpětnou vazbou, vztahy s klienty." },
    { id: "c-85", day: 85, label: "Před koncem zkušebky", focus: "Celkové zhodnocení, souznění s hodnotami, rozhodnutí o pokračování a další plány." },
  ],
};

const ONBOARDING_DAYS = 90;
const STATUS_LABEL = { green: "Souzní", orange: "Pozor", red: "Red flag", unknown: "Nezaznělo" };

const state = { db: null, aiReady: false, calMonth: null, analyzing: new Set(), status: null };

// ---------- pomocné funkce ----------

const $ = (sel, root = document) => root.querySelector(sel);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function todayIso() {
  return toIso(new Date());
}
function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseIso(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(iso, n) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}
function diffDays(a, b) {
  return Math.round((parseIso(b) - parseIso(a)) / 86400000);
}
function fmtDate(iso, opts = { day: "numeric", month: "numeric", year: "numeric" }) {
  return iso ? parseIso(iso).toLocaleDateString("cs-CZ", opts) : "";
}
function fmtDateTime(isoStr) {
  return new Date(isoStr).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function initials(name) {
  return name.split(/\s+/).filter((w) => /^\p{L}/u.test(w)).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}
function relDays(n) {
  if (n === 0) return "dnes";
  if (n === 1) return "zítra";
  if (n === -1) return "včera";
  if (n > 0) return `za ${n} ${n < 5 ? "dny" : "dní"}`;
  const a = -n;
  return `před ${a} ${a === 1 ? "dnem" : "dny"}`;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 3200);
}

// ---------- data ----------

function emptyDb() {
  return { version: 1, settings: structuredClone(DEFAULT_SETTINGS), people: [] };
}

// ---------- server ----------
// "core" = nastavení + lidé bez přepisů; každý přepis se ukládá zvlášť.

class LoginRequired extends Error {}

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && data.login) throw new LoginRequired();
  if (!res.ok) throw new Error(data.error || `Chyba serveru (${res.status})`);
  return data;
}

const written = { core: null, transcripts: new Map() };
const tKey = (pid, cpId) => `${pid}__${cpId}`;

function splitDb() {
  const core = { version: 1, settings: state.db.settings, people: structuredClone(state.db.people) };
  const transcripts = new Map();
  for (const p of core.people) {
    for (const [cpId, ci] of Object.entries(p.checkins || {})) {
      if (ci.transcript) transcripts.set(tKey(p.id, cpId), ci.transcript);
      delete ci.transcript;
    }
  }
  return { core, transcripts };
}

async function load() {
  state.status = await api("GET", "/api/status");
  state.aiReady = state.status.aiReady;
  if (state.status.authRequired && !state.status.loggedIn) throw new LoginRequired();
  const { core, transcripts } = await api("GET", "/api/data");
  const db = core ? { ...emptyDb(), ...core } : emptyDb();
  written.core = core ? JSON.stringify({ version: 1, settings: db.settings, people: db.people }) : null;
  written.transcripts = new Map(Object.entries(transcripts || {}));
  for (const [key, text] of written.transcripts) {
    const [pid, cpId] = key.split("__");
    const p = db.people.find((x) => x.id === pid);
    if (p) {
      p.checkins ||= {};
      p.checkins[cpId] ||= { date: null, done: true, transcript: "", analysis: null, manualStatus: null, notes: "" };
      p.checkins[cpId].transcript = text;
    }
  }
  state.db = db;
}

let saveTimer = null;
let saveChain = Promise.resolve();
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveChain = saveChain.then(flush).catch((err) => {
      if (err instanceof LoginRequired) return showLogin("Přihlášení vypršelo – přihlas se znovu. Poslední změna se neuložila.");
      toast("Uložení se nepovedlo: " + err.message);
    });
  }, 300);
}

// Posílá jen to, co se změnilo.
async function flush() {
  const { core, transcripts } = splitDb();
  for (const [key, text] of transcripts) {
    if (written.transcripts.get(key) === text) continue;
    await api("PUT", "/api/transcript", { key, text });
    written.transcripts.set(key, text);
  }
  const coreJson = JSON.stringify(core);
  if (coreJson !== written.core) {
    await api("PUT", "/api/data", { core });
    written.core = coreJson;
  }
  for (const key of [...written.transcripts.keys()]) {
    if (transcripts.has(key)) continue;
    await api("DELETE", `/api/transcript?key=${encodeURIComponent(key)}`);
    written.transcripts.delete(key);
  }
}

function showLogin(message = "") {
  document.querySelector("#nav").hidden = true;
  $("#app").innerHTML = `
    <div class="card" style="max-width:420px;margin:40px auto">
      <h1>Přihlášení</h1>
      <p class="muted">HR check-iny obsahují citlivé údaje, proto jsou zamčené heslem.</p>
      ${message ? `<div class="banner" style="margin-bottom:12px">${esc(message)}</div>` : ""}
      <form id="login-form" class="stack">
        <div><label for="login-password">Heslo</label><input id="login-password" type="password" autocomplete="current-password" required></div>
        <button class="btn">Přihlásit se</button>
        <p id="login-error" class="small" style="color:var(--red);margin:0" hidden></p>
      </form>
    </div>`;
  $("#login-password").focus();
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try {
      await api("POST", "/api/login", { password: $("#login-password").value });
      await start();
    } catch (err) {
      const errEl = $("#login-error");
      errEl.textContent = err.message;
      errEl.hidden = false;
      btn.disabled = false;
    }
  });
}

const settings = () => state.db.settings;
const findPerson = (id) => state.db.people.find((p) => p.id === id);

function getCheckin(person, cpId) {
  person.checkins ||= {};
  person.checkins[cpId] ||= { date: null, done: false, transcript: "", analysis: null, manualStatus: null, notes: "" };
  return person.checkins[cpId];
}

/** Datum check-inu: ručně nastavené, jinak den X od nástupu (víkend se posune na pondělí). */
function checkinDate(person, cp) {
  const manual = person.checkins?.[cp.id]?.date;
  if (manual) return manual;
  const iso = addDays(person.startDate, cp.day);
  const dow = parseIso(iso).getDay();
  return dow === 6 ? addDays(iso, 2) : dow === 0 ? addDays(iso, 1) : iso;
}

function checkinStatus(ci) {
  if (!ci) return null;
  return ci.manualStatus || ci.analysis?.overall || null;
}

function isDone(ci) {
  return Boolean(ci && (ci.done || ci.transcript || ci.analysis));
}

/** Všechny naplánované schůzky (pro přehled a kalendář). */
function allMeetings() {
  const out = [];
  for (const p of state.db.people) {
    if (p.archived) continue;
    for (const cp of settings().checkpoints) {
      const ci = p.checkins?.[cp.id];
      out.push({ person: p, cp, date: checkinDate(p, cp), ci, done: isDone(ci), status: checkinStatus(ci) });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Celkový semafor člověka = stav posledního vyhodnoceného check-inu. */
function personStatus(p) {
  const statuses = settings()
    .checkpoints.map((cp) => checkinStatus(p.checkins?.[cp.id]))
    .filter(Boolean);
  if (!statuses.length) return null;
  return statuses[statuses.length - 1];
}

function onboardingDay(p) {
  return diffDays(p.startDate, todayIso());
}

function nextMeeting(p) {
  return settings()
    .checkpoints.map((cp) => ({ cp, date: checkinDate(p, cp), ci: p.checkins?.[cp.id] }))
    .find((m) => !isDone(m.ci));
}

function redFlagCount(p) {
  return Object.values(p.checkins || {}).reduce(
    (n, ci) => n + (ci.analysis?.redFlags?.filter((f) => f.severity === "red").length || 0),
    0,
  );
}

// ---------- UI stavební kostky ----------

function light(status, cls = "") {
  return `<span class="light ${status || ""} ${cls}" title="${esc(STATUS_LABEL[status] || "Zatím bez hodnocení")}"></span>`;
}
function chip(status) {
  if (!status) return `<span class="chip">Bez hodnocení</span>`;
  return `<span class="chip ${status}">${light(status)} ${STATUS_LABEL[status]}</span>`;
}
function semafor(status) {
  return `<div class="semafor ${status || ""}" aria-label="${esc(STATUS_LABEL[status] || "Bez hodnocení")}"><span class="s-red"></span><span class="s-orange"></span><span class="s-green"></span></div>`;
}
function avatar(p, cls = "") {
  return `<div class="avatar ${cls}">${esc(initials(p.name))}</div>`;
}
function progress(p) {
  const pct = Math.max(0, Math.min(100, (onboardingDay(p) / ONBOARDING_DAYS) * 100));
  return `<div class="progress" title="Den ${onboardingDay(p)} z ${ONBOARDING_DAYS}"><div style="width:${pct}%"></div></div>`;
}
function dayLabel(p) {
  const d = onboardingDay(p);
  if (d < 0) return `nastupuje ${relDays(-d)}`;
  if (d > ONBOARDING_DAYS) return "adaptace dokončena";
  return `den ${d} z ${ONBOARDING_DAYS}`;
}
function dateBadge(iso, overdue) {
  const d = parseIso(iso);
  return `<div class="date-badge ${overdue ? "overdue" : ""}"><b>${d.getDate()}</b><small>${d.toLocaleDateString("cs-CZ", { month: "short" })}</small></div>`;
}

function emptyState(title, text, action = "") {
  return `<div class="card empty"><h2>${title}</h2><p>${text}</p>${action}</div>`;
}

// ---------- modal ----------

function openModal(html, onMount) {
  $("#modal-body").innerHTML = html;
  $("#modal").hidden = false;
  onMount?.($("#modal-body"));
  $("#modal-body").querySelector("input, textarea, select")?.focus();
}
function closeModal() {
  $("#modal").hidden = true;
  $("#modal-body").innerHTML = "";
}

function personForm(p = {}) {
  return `
    <h2>${p.id ? "Upravit člověka" : "Nový člověk"}</h2>
    <form id="person-form" class="stack">
      <div class="fields-2">
        <div><label for="f-name">Jméno a příjmení *</label><input id="f-name" name="name" required value="${esc(p.name)}"></div>
        <div><label for="f-start">Datum nástupu *</label><input id="f-start" name="startDate" type="date" required value="${esc(p.startDate || todayIso())}"></div>
        <div><label for="f-role">Pozice</label><input id="f-role" name="role" value="${esc(p.role)}" placeholder="např. PPC specialista"></div>
        <div><label for="f-team">Tým</label><input id="f-team" name="team" value="${esc(p.team)}" placeholder="např. Performance"></div>
        <div><label for="f-lead">Leader / buddy</label><input id="f-lead" name="lead" value="${esc(p.lead)}"></div>
        <div><label for="f-email">E-mail</label><input id="f-email" name="email" type="email" value="${esc(p.email)}"></div>
      </div>
      <div class="row between">
        <button type="button" class="btn secondary" data-action="close-modal">Zrušit</button>
        <button class="btn">${p.id ? "Uložit" : "Přidat"}</button>
      </div>
    </form>`;
}

function openPersonForm(existing) {
  openModal(personForm(existing), (root) => {
    $("#person-form", root).addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      if (existing) {
        Object.assign(existing, data);
      } else {
        const p = { id: uid(), ...data, checkins: {}, notes: [], createdAt: new Date().toISOString() };
        state.db.people.push(p);
        location.hash = `#/clovek/${p.id}`;
      }
      save();
      closeModal();
      render();
      toast(existing ? "Uloženo" : "Člověk přidán – schůzky jsou naplánované v kalendáři");
    });
  });
}

// =====================================================================
// Pohledy
// =====================================================================

function viewDashboard() {
  const people = state.db.people.filter((p) => !p.archived);
  if (!people.length) {
    return emptyState(
      "Vítej v HR check-inech 👋",
      "Přidej prvního nováčka. Appka mu podle data nástupu naplánuje check-iny na první 3 měsíce a pak ti z přepisů ukáže semafor.",
      `<div class="row" style="justify-content:center"><button class="btn" data-action="add-person">Přidat člověka</button><button class="btn secondary" data-action="load-demo">Vyzkoušet na ukázkových datech</button></div>`,
    );
  }
  const today = todayIso();
  const meetings = allMeetings();
  const overdue = meetings.filter((m) => !m.done && m.date < today);
  const upcoming = meetings.filter((m) => !m.done && m.date >= today && diffDays(today, m.date) <= 21);
  const inOnboarding = people.filter((p) => onboardingDay(p) <= ONBOARDING_DAYS);
  const weekCount = meetings.filter((m) => !m.done && m.date >= today && diffDays(today, m.date) < 7).length;
  const reds = people.filter((p) => personStatus(p) === "red");

  const meetingItem = (m) => `
    <li>
      ${dateBadge(m.date, m.date < today)}
      <div style="flex:1;min-width:0">
        <a href="#/clovek/${m.person.id}"><b>${esc(m.person.name)}</b></a>
        <div class="small muted">${esc(m.cp.label)} · ${relDays(diffDays(today, m.date))}</div>
      </div>
      ${m.date < today ? `<span class="chip red">Po termínu</span>` : ""}
    </li>`;

  const sorted = [...people].sort((a, b) => {
    const rank = { red: 0, orange: 1, green: 2 };
    return (rank[personStatus(a)] ?? 3) - (rank[personStatus(b)] ?? 3);
  });

  return `
    ${!state.aiReady ? `<div class="banner" style="margin-bottom:16px">Vyhodnocení přepisů je vypnuté – chybí <code>ANTHROPIC_API_KEY</code>. Lidi, kalendář i poznámky fungují normálně. Návod je v README.</div>` : ""}
    <div class="section-head"><h1>Ahoj, tady je přehled</h1><button class="btn" data-action="add-person">+ Přidat člověka</button></div>
    <div class="grid grid-4">
      <div class="card stat"><div class="stat-value">${inOnboarding.length}</div><div class="stat-label">lidí v adaptaci</div></div>
      <div class="card stat"><div class="stat-value">${weekCount}</div><div class="stat-label">check-inů tento týden</div></div>
      <div class="card stat ${overdue.length ? "alert" : ""}"><div class="stat-value">${overdue.length}</div><div class="stat-label">schůzek po termínu</div></div>
      <div class="card stat ${reds.length ? "alert" : ""}"><div class="stat-value">${reds.length}</div><div class="stat-label">lidí na červené</div></div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <h2>Nejbližší check-iny</h2>
        ${overdue.length + upcoming.length
          ? `<ul class="meeting-list">${[...overdue, ...upcoming].map(meetingItem).join("")}</ul>`
          : `<p class="muted">V příštích 3 týdnech nic naplánovaného. 🎉</p>`}
      </div>
      <div class="card">
        <h2>Semafor týmu</h2>
        <ul class="meeting-list">
          ${sorted.map((p) => `
            <li>
              ${avatar(p)}
              <div style="flex:1;min-width:0">
                <a href="#/clovek/${p.id}"><b>${esc(p.name)}</b></a>
                <div class="small muted">${esc(p.role || "")}${p.role ? " · " : ""}${dayLabel(p)}</div>
              </div>
              ${chip(personStatus(p))}
            </li>`).join("")}
        </ul>
      </div>
    </div>`;
}

function viewPeople() {
  const showArchived = sessionStorage.getItem("showArchived") === "1";
  const people = state.db.people
    .filter((p) => showArchived || !p.archived)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const today = todayIso();
  return `
    <div class="section-head">
      <h1>Lidé</h1>
      <div class="row">
        <label class="row small" style="margin:0;font-weight:500"><input type="checkbox" data-action="toggle-archived" ${showArchived ? "checked" : ""} style="width:auto"> zobrazit archiv</label>
        <button class="btn" data-action="add-person">+ Přidat člověka</button>
      </div>
    </div>
    ${people.length ? `
    <div class="card table-wrap">
      <table>
        <thead><tr><th>Jméno</th><th>Pozice / tým</th><th>Nástup</th><th style="min-width:140px">Adaptace</th><th>Další check-in</th><th>Semafor</th></tr></thead>
        <tbody>
          ${people.map((p) => {
            const next = nextMeeting(p);
            return `
            <tr class="clickable" data-href="#/clovek/${p.id}">
              <td><div class="row">${avatar(p)}<b>${esc(p.name)}</b>${p.archived ? `<span class="chip">archiv</span>` : ""}</div></td>
              <td>${esc(p.role || "–")}<div class="small muted">${esc(p.team || "")}</div></td>
              <td>${fmtDate(p.startDate)}</td>
              <td>${progress(p)}<div class="small muted">${dayLabel(p)}</div></td>
              <td>${next ? `${fmtDate(next.date)}<div class="small ${next.date < today ? "" : "muted"}" ${next.date < today ? 'style="color:var(--red)"' : ""}>${esc(next.cp.label)} · ${relDays(diffDays(today, next.date))}</div>` : `<span class="muted">vše hotovo</span>`}</td>
              <td>${chip(personStatus(p))}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>` : emptyState("Zatím tu nikdo není", "Přidej prvního nováčka.", `<button class="btn" data-action="add-person">Přidat člověka</button>`)}`;
}

function viewPerson(id) {
  const p = findPerson(id);
  if (!p) return emptyState("Člověk nenalezen", "Možná byl smazán.", `<a class="btn" href="#/lide">Zpět na seznam</a>`);
  const today = todayIso();
  const flags = redFlagCount(p);

  return `
    <p><a href="#/lide">← Lidé</a></p>
    <div class="card">
      <div class="row between" style="align-items:flex-start">
        <div class="row" style="align-items:flex-start;gap:16px">
          ${avatar(p, "lg")}
          <div>
            <h1 style="margin-bottom:2px">${esc(p.name)}</h1>
            <div class="muted">${esc([p.role, p.team].filter(Boolean).join(" · ") || "Pozice nevyplněna")}</div>
            <div class="small muted">Nástup ${fmtDate(p.startDate)}${p.lead ? ` · leader/buddy: ${esc(p.lead)}` : ""}${p.email ? ` · <a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ""}</div>
          </div>
        </div>
        <div class="row">
          ${semafor(personStatus(p))}
          <div>
            ${chip(personStatus(p))}
            <div class="small muted" style="margin-top:4px">${flags ? `${flags}× vážný red flag` : "bez vážných red flags"}</div>
          </div>
        </div>
      </div>
      <div style="margin-top:16px">${progress(p)}<div class="small muted" style="margin-top:4px">${dayLabel(p)}</div></div>
      <div class="row" style="margin-top:16px">
        <button class="btn secondary sm" data-action="edit-person" data-id="${p.id}">Upravit</button>
        <button class="btn secondary sm" data-action="archive-person" data-id="${p.id}">${p.archived ? "Vrátit z archivu" : "Archivovat"}</button>
        <button class="btn danger sm" data-action="delete-person" data-id="${p.id}">Smazat</button>
      </div>
    </div>

    <div class="section-head"><h2>Check-iny během adaptace</h2></div>
    <div class="timeline stack">
      ${settings().checkpoints.map((cp) => checkinCard(p, cp, today)).join("")}
    </div>

    <div class="section-head"><h2>Poznámky</h2></div>
    <div class="card stack">
      <form data-form="add-note" data-id="${p.id}" class="stack">
        <textarea name="text" placeholder="Co ti utkvělo? Postřehy z chodby, od leadera, domluvené kroky…" required></textarea>
        <div class="row between"><span class="small muted">Poznámky vidíš jen ty – ukládají se lokálně.</span><button class="btn">Přidat poznámku</button></div>
      </form>
      ${(p.notes || []).slice().reverse().map((n) => `
        <div class="note">
          <div class="note-meta"><span>${fmtDateTime(n.createdAt)}</span><button class="btn link small" data-action="delete-note" data-id="${p.id}" data-note="${n.id}">smazat</button></div>
          <p>${esc(n.text)}</p>
        </div>`).join("") || `<p class="muted">Zatím žádné poznámky.</p>`}
    </div>`;
}

function checkinCard(p, cp, today) {
  const ci = p.checkins?.[cp.id];
  const date = checkinDate(p, cp);
  const done = isDone(ci);
  const status = checkinStatus(ci);
  const key = `${p.id}:${cp.id}`;
  const busy = state.analyzing.has(key);
  const overdue = !done && date < today;

  return `
  <div class="card checkin ${status || ""}" id="ci-${cp.id}">
    <div class="checkin-head">
      <div>
        <h3>${esc(cp.label)} <span class="muted small" style="font-weight:400">· den ${cp.day}</span></h3>
        <div class="small muted">${esc(cp.focus || "")}</div>
      </div>
      <div class="row">
        ${overdue ? `<span class="chip red">Po termínu</span>` : done ? `<span class="chip blue">Proběhlo</span>` : `<span class="chip">${relDays(diffDays(today, date))}</span>`}
        ${chip(status)}
      </div>
    </div>

    <div class="fields-2" style="margin-top:14px">
      <div>
        <label>Datum schůzky</label>
        <input type="date" value="${date}" data-change="ci-date" data-id="${p.id}" data-cp="${cp.id}">
      </div>
      <div>
        <label>Ruční úprava semaforu</label>
        <select data-change="ci-manual" data-id="${p.id}" data-cp="${cp.id}">
          <option value="">${ci?.analysis ? `Podle analýzy (${STATUS_LABEL[ci.analysis.overall]})` : "— bez ruční úpravy —"}</option>
          ${["green", "orange", "red"].map((s) => `<option value="${s}" ${ci?.manualStatus === s ? "selected" : ""}>${STATUS_LABEL[s]}</option>`).join("")}
        </select>
      </div>
    </div>

    <div style="margin-top:14px">
      ${ci?.transcript
        ? `<details class="transcript"><summary>Přepis (${ci.transcript.length.toLocaleString("cs-CZ")} znaků)</summary><pre>${esc(ci.transcript)}</pre></details>
           <div class="row" style="margin-top:10px">
             <button class="btn aqua" data-action="analyze" data-id="${p.id}" data-cp="${cp.id}" ${busy || !state.aiReady ? "disabled" : ""}>${busy ? `<span class="spinner"></span> Analyzuju…` : ci.analysis ? "Analyzovat znovu" : "Vyhodnotit semafor"}</button>
             <button class="btn secondary sm" data-action="upload" data-id="${p.id}" data-cp="${cp.id}">Nahradit přepis</button>
             <button class="btn danger sm" data-action="remove-transcript" data-id="${p.id}" data-cp="${cp.id}">Smazat přepis</button>
           </div>
           ${!state.aiReady ? `<p class="small muted">Vyhodnocení je vypnuté – chybí ANTHROPIC_API_KEY (viz README).</p>` : ""}`
        : `<div class="dropzone" data-drop data-id="${p.id}" data-cp="${cp.id}">
             <p style="margin:0 0 10px">Přetáhni sem přepis (.txt, .md, .vtt, .srt) nebo</p>
             <div class="row" style="justify-content:center">
               <button class="btn secondary sm" data-action="upload" data-id="${p.id}" data-cp="${cp.id}">Vybrat soubor</button>
               <button class="btn secondary sm" data-action="paste" data-id="${p.id}" data-cp="${cp.id}">Vložit text</button>
               ${!done ? `<button class="btn link small" data-action="mark-done" data-id="${p.id}" data-cp="${cp.id}">jen označit jako proběhlé</button>` : ""}
             </div>
           </div>`}
    </div>

    ${ci?.analysis ? analysisBlock(ci.analysis) : ""}

    <div style="margin-top:14px">
      <label>Poznámky ke schůzce</label>
      <textarea data-change="ci-notes" data-id="${p.id}" data-cp="${cp.id}" placeholder="Domluvené kroky, co sledovat příště…">${esc(ci?.notes || "")}</textarea>
    </div>
  </div>`;
}

function analysisBlock(a) {
  const values = a.values || [];
  const flags = a.redFlags || [];
  return `
  <div class="analysis">
    <div class="analysis-top box">
      ${semafor(a.overall)}
      <div>
        <h4>${esc(a.headline)}</h4>
        <p style="margin:0">${esc(a.summary)}</p>
        <div class="small muted" style="margin-top:6px">Vyhodnoceno ${fmtDateTime(a.analyzedAt)} · AI návrh, finální slovo máš ty</div>
      </div>
    </div>
    <div class="grid grid-2">
      <div class="box">
        <h4>Hodnoty Four Bros</h4>
        <ul class="verdict-list">
          ${values.map((v) => `
            <li>${light(v.status === "unknown" ? "" : v.status)}
              <div><b>${esc(v.name)}</b> <span class="small muted">· ${STATUS_LABEL[v.status] || ""}</span>
                <div class="small">${esc(v.comment)}</div>
                ${v.evidence ? `<q>${esc(v.evidence)}</q>` : ""}
              </div></li>`).join("")}
        </ul>
      </div>
      <div class="box ${flags.some((f) => f.severity === "red") ? "red" : ""}">
        <h4>Red flags</h4>
        ${flags.length ? `<ul class="verdict-list">
          ${flags.map((f) => `
            <li>${light(f.severity)}
              <div><b>${esc(f.name)}</b>
                <div class="small">${esc(f.comment)}</div>
                ${f.evidence ? `<q>${esc(f.evidence)}</q>` : ""}
              </div></li>`).join("")}
        </ul>` : `<p class="small" style="margin:0">Žádné varovné signály se v přepisu neobjevily. ✅</p>`}
      </div>
    </div>
    <div class="grid grid-2">
      ${a.strengths?.length ? `<div class="box"><h4>Co funguje</h4><ul>${a.strengths.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
      ${a.followUpQuestions?.length ? `<div class="box"><h4>Otázky na příště</h4><ul>${a.followUpQuestions.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
    </div>
    ${a.recommendation ? `<div class="box"><h4>Doporučený další krok</h4><p style="margin:0">${esc(a.recommendation)}</p></div>` : ""}
  </div>`;
}

function viewCalendar() {
  const today = todayIso();
  const base = state.calMonth || today.slice(0, 7);
  const [y, m] = base.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const offset = (first.getDay() + 6) % 7; // pondělí = 0
  const start = new Date(y, m - 1, 1 - offset);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(toIso(d));
  }
  if (days.slice(35).every((d) => !d.startsWith(base))) days.length = 35;

  const byDate = {};
  for (const mt of allMeetings()) (byDate[mt.date] ||= []).push({ type: "meeting", ...mt });
  for (const p of state.db.people.filter((x) => !x.archived)) (byDate[p.startDate] ||= []).push({ type: "start", person: p });

  const monthName = first.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" });
  const dows = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

  return `
    <div class="section-head">
      <h1 style="text-transform:capitalize">${monthName}</h1>
      <div class="row">
        <button class="btn secondary sm" data-action="cal-move" data-delta="-1" aria-label="Předchozí měsíc">←</button>
        <button class="btn secondary sm" data-action="cal-today">Dnes</button>
        <button class="btn secondary sm" data-action="cal-move" data-delta="1" aria-label="Další měsíc">→</button>
        <button class="btn sm" data-action="export-ics" title="Stáhne všechny nedokončené check-iny jako .ics pro Google / Outlook kalendář">Export do kalendáře (.ics)</button>
      </div>
    </div>
    <div class="row small muted" style="margin-bottom:12px">
      <span class="cal-ev start" style="display:inline-block">nástup</span>
      <span class="cal-ev" style="display:inline-block">naplánováno</span>
      <span class="cal-ev overdue" style="display:inline-block">po termínu</span>
      <span class="cal-ev green" style="display:inline-block">souzní</span>
      <span class="cal-ev orange" style="display:inline-block">pozor</span>
      <span class="cal-ev red" style="display:inline-block">red flag</span>
    </div>
    <div class="cal">
      ${dows.map((d) => `<div class="cal-dow">${d}</div>`).join("")}
      ${days.map((d) => `
        <div class="cal-day ${d.startsWith(base) ? "" : "other"} ${d === today ? "today" : ""}">
          <div class="cal-num">${parseIso(d).getDate()}</div>
          ${(byDate[d] || []).map((ev) => ev.type === "start"
            ? `<a class="cal-ev start" href="#/clovek/${ev.person.id}" title="Nástup: ${esc(ev.person.name)}">🎉 ${esc(ev.person.name)}</a>`
            : `<a class="cal-ev ${ev.status || (!ev.done && ev.date < today ? "overdue" : "")}" href="#/clovek/${ev.person.id}" title="${esc(ev.person.name)} – ${esc(ev.cp.label)}">${esc(ev.person.name)} · ${esc(ev.cp.label)}</a>`,
          ).join("")}
        </div>`).join("")}
    </div>`;
}

function viewSettings() {
  const s = settings();
  const listEditor = (kind, items, placeholderName, placeholderDesc) => `
    <div class="edit-list" data-list="${kind}">
      ${items.map((it, i) => `
        <div class="item">
          <input value="${esc(it.name)}" data-edit="${kind}" data-i="${i}" data-key="name" placeholder="${placeholderName}">
          <textarea data-edit="${kind}" data-i="${i}" data-key="description" placeholder="${placeholderDesc}" style="min-height:44px">${esc(it.description)}</textarea>
          <button class="btn danger sm" data-action="remove-item" data-kind="${kind}" data-i="${i}" aria-label="Odebrat">✕</button>
        </div>`).join("")}
    </div>
    <button class="btn secondary sm" style="margin-top:10px" data-action="add-item" data-kind="${kind}">+ Přidat</button>`;

  return `
    <h1>Nastavení</h1>
    <p class="muted">Podle těchhle hodnot a signálů AI vyhodnocuje přepisy. Uprav je, aby přesně seděly na Four Bros – čím konkrétnější popis, tím přesnější semafor.</p>

    <div class="stack">
      <div class="card">
        <h2>Hodnoty a kultura Four Bros</h2>
        ${listEditor("values", s.values, "Hodnota", "Jak se projevuje v praxi")}
      </div>

      <div class="card">
        <h2>Red flags</h2>
        ${listEditor("redFlags", s.redFlags, "Varovný signál", "Jak ho poznat")}
      </div>

      <div class="card">
        <h2>Check-iny během adaptace</h2>
        <p class="small muted">Den = kolikátý den od nástupu se schůzka automaticky naplánuje. U konkrétního člověka jde datum posunout.</p>
        <div class="edit-list checkpoints">
          ${s.checkpoints.map((cp, i) => `
            <div class="item">
              <input type="number" min="1" max="365" value="${cp.day}" data-edit="checkpoints" data-i="${i}" data-key="day" aria-label="Den">
              <input value="${esc(cp.label)}" data-edit="checkpoints" data-i="${i}" data-key="label" placeholder="Název">
              <textarea data-edit="checkpoints" data-i="${i}" data-key="focus" placeholder="Na co se zaměřit" style="min-height:44px">${esc(cp.focus)}</textarea>
              <button class="btn danger sm" data-action="remove-item" data-kind="checkpoints" data-i="${i}" aria-label="Odebrat">✕</button>
            </div>`).join("")}
        </div>
        <button class="btn secondary sm" style="margin-top:10px" data-action="add-item" data-kind="checkpoints">+ Přidat check-in</button>
      </div>

      <div class="card">
        <h2>Data a záloha</h2>
        <p class="small muted">${state.status?.storage === "redis" ? "Data jsou uložená v databázi (Upstash Redis) a appka je zamčená heslem." : "Data jsou uložená ve složce <code>data/</code> na tomhle počítači."} Přepisy odcházejí k vyhodnocení do Claude API. Pravidelně si dělej zálohu.</p>
        <div class="row">
          <button class="btn secondary" data-action="export-json">Stáhnout zálohu (.json)</button>
          <button class="btn secondary" data-action="import-json">Nahrát zálohu</button>
          <button class="btn secondary" data-action="reset-settings">Obnovit výchozí hodnoty a red flags</button>
          <button class="btn danger" data-action="wipe">Smazat všechna data</button>
          ${state.status?.authRequired ? `<button class="btn secondary" data-action="logout">Odhlásit se</button>` : ""}
        </div>
      </div>
    </div>`;
}

// =====================================================================
// Router a render
// =====================================================================

function render() {
  const hash = location.hash || "#/prehled";
  const [, route, param] = hash.split("/");
  document.querySelectorAll("#nav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === route || (route === "clovek" && a.dataset.route === "lide"));
  });
  const app = $("#app");
  const scroll = window.scrollY;
  const sameView = render._last === hash;
  const views = { prehled: viewDashboard, lide: viewPeople, clovek: () => viewPerson(param), kalendar: viewCalendar, nastaveni: viewSettings };
  app.innerHTML = (views[route] || viewDashboard)();
  if (sameView) window.scrollTo(0, scroll);
  else window.scrollTo(0, 0);
  render._last = hash;
}

// ---------- přepisy ----------

function cleanTranscript(text, filename = "") {
  let t = text.replace(/\r\n?/g, "\n");
  if (/\.(vtt|srt)$/i.test(filename) || /^WEBVTT/.test(t)) {
    t = t
      .split("\n")
      .filter((line) => !/^WEBVTT/.test(line) && !/^\d+$/.test(line.trim()) && !/-->/.test(line) && !/^NOTE\b/.test(line))
      .join("\n")
      .replace(/<v\s+([^>]+)>/g, "$1: ")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/\n{2,}/g, "\n");
  }
  return t.trim();
}

function setTranscript(personId, cpId, text) {
  const p = findPerson(personId);
  const ci = getCheckin(p, cpId);
  ci.transcript = text;
  ci.done = true;
  save();
  render();
  toast("Přepis uložen" + (state.aiReady ? " – teď klikni na „Vyhodnotit semafor“" : ""));
}

async function readFileAsTranscript(file, personId, cpId) {
  if (/\.(docx?|pdf)$/i.test(file.name)) {
    toast("Word/PDF zatím neumím – ulož přepis jako .txt nebo text vlož přes „Vložit text“.");
    return;
  }
  const text = cleanTranscript(await file.text(), file.name);
  if (!text) return toast("Soubor je prázdný.");
  setTranscript(personId, cpId, text);
}

function pickFile(accept, cb) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.addEventListener("change", () => input.files[0] && cb(input.files[0]));
  input.click();
}

async function runAnalysis(personId, cpId) {
  const p = findPerson(personId);
  const cp = settings().checkpoints.find((c) => c.id === cpId);
  const ci = getCheckin(p, cpId);
  const key = `${personId}:${cpId}`;
  state.analyzing.add(key);
  render();
  try {
    const body = await api("POST", "/api/analyze", {
      person: { name: p.name, role: p.role, team: p.team, startDate: p.startDate },
      checkpoint: cp,
      settings: { values: settings().values, redFlags: settings().redFlags },
      transcript: ci.transcript,
    });
    ci.analysis = body.result;
    save();
    toast("Hotovo – semafor je vyhodnocený");
  } catch (err) {
    if (err instanceof LoginRequired) return showLogin("Přihlášení vypršelo – přihlas se znovu.");
    toast("Vyhodnocení selhalo: " + err.message);
  } finally {
    state.analyzing.delete(key);
    render();
  }
}

// ---------- export ----------

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function icsEscape(s) {
  return String(s).replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}

function exportIcs() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const events = allMeetings()
    .filter((m) => !m.done)
    .map((m) => {
      const d = m.date.replace(/-/g, "");
      const next = addDays(m.date, 1).replace(/-/g, "");
      return [
        "BEGIN:VEVENT",
        `UID:${m.person.id}-${m.cp.id}@fourbros-hr`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${next}`,
        `SUMMARY:${icsEscape(`HR check-in: ${m.person.name} – ${m.cp.label}`)}`,
        `DESCRIPTION:${icsEscape(m.cp.focus || "")}`,
        "END:VEVENT",
      ].join("\r\n");
    });
  if (!events.length) return toast("Žádné nadcházející check-iny k exportu.");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Four Bros//HR check-in//CS", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
  download("fourbros-hr-checkiny.ics", ics, "text/calendar");
}

// ---------- demo data ----------

function demoData() {
  const t = todayIso();
  const mk = (name, role, team, daysAgo, lead) => ({
    id: uid(), name, role, team, lead, email: "", startDate: addDays(t, -daysAgo), checkins: {}, notes: [], createdAt: new Date().toISOString(), demo: true,
  });
  const a = mk("Tereza Nová (ukázka)", "PPC specialistka", "Performance", 40, "Martin");
  const b = mk("Jakub Malý (ukázka)", "Copywriter", "Content", 70, "Lucie");
  const c = mk("Eva Svobodová (ukázka)", "Account manažerka", "Klienti", 5, "Petr");
  const allValues = (status) => DEFAULT_SETTINGS.values.map((v) => ({ name: v.name, status, evidence: "", comment: "" }));

  a.checkins["c-14"] = {
    date: null, done: true, manualStatus: null, notes: "Domluveno: víc času s Martinem na reporting.",
    transcript: "HR: Jak se ti zatím daří?\nTereza: Super, nejvíc mě baví, že tady se fakt všechno měří. Hned první týden jsem si udělala vlastní dashboard.\nHR: Co ti chybí?\nTereza: Asi víc zpětné vazby na kampaně, klidně tvrdé, chci se zlepšovat.",
    analysis: {
      overall: "green", headline: "Tereza velmi dobře souzní s kulturou – data, otevřenost, chuť růst.",
      summary: "Tereza mluví s nadšením o práci s daty a sama si řekla o tvrdší zpětnou vazbu. Projevuje iniciativu (vlastní dashboard). Žádné varovné signály.",
      values: allValues("unknown").map((v) => ({
        ...v,
        ...(v.name === "Data a vědecký přístup" && { status: "green", evidence: "nejvíc mě baví, že tady se fakt všechno měří", comment: "Přirozeně staví na datech." }),
        ...(v.name === "Radikální otevřenost" && { status: "green", evidence: "Asi víc zpětné vazby na kampaně, klidně tvrdé", comment: "Sama si o zpětnou vazbu říká." }),
        ...(v.name === "Posouváme se vpřed" && { status: "green", evidence: "Hned první týden jsem si udělala vlastní dashboard.", comment: "Iniciativa bez zadání." }),
      })),
      redFlags: [], strengths: ["Iniciativa", "Práce s daty", "Chce zpětnou vazbu"],
      followUpQuestions: ["Jak ti funguje spolupráce s Martinem?", "Na čem by ses chtěla do konce zkušebky nejvíc zlepšit?"],
      recommendation: "Zajistit pravidelnou zpětnou vazbu na kampaně (např. týdenní 15min review s Martinem).",
      analyzedAt: new Date().toISOString(), model: "ukázka",
    },
  };
  b.checkins["c-14"] = { date: null, done: true, transcript: "", analysis: null, manualStatus: "green", notes: "V pohodě, rychle se zapojil." };
  b.checkins["c-30"] = {
    date: null, done: true, manualStatus: null, notes: "",
    transcript: "HR: Jak hodnotíš první měsíc?\nJakub: Upřímně, čekal jsem víc home office. A ten feedback od klienta minule nebyl fér, za to mohl account, ne já.\nHR: A co tě baví?\nJakub: Psaní mě baví, to jo.",
    analysis: {
      overall: "orange", headline: "Jakub má rád psaní, ale objevuje se nesoulad očekávání a přehazování odpovědnosti.",
      summary: "Jakub má k obsahu pozitivní vztah, zmiňuje ale nenaplněné očekávání ohledně home office a odpovědnost za klientskou výtku přesouvá na kolegu. Zatím ne kritické, ale stojí za otevřený rozhovor.",
      values: allValues("unknown").map((v) => ({
        ...v,
        ...(v.name === "Marketing nás baví" && { status: "green", evidence: "Psaní mě baví, to jo.", comment: "Pozitivní vztah k práci." }),
        ...(v.name === "Tým a odpovědnost" && { status: "orange", evidence: "za to mohl account, ne já", comment: "Odpovědnost přenáší na kolegu." }),
      })),
      redFlags: [
        { name: "Nesoulad očekávání", severity: "orange", evidence: "čekal jsem víc home office", comment: "Vyjasnit pravidla a jestli je to pro něj zásadní." },
        { name: "Svalování viny", severity: "orange", evidence: "za to mohl account, ne já", comment: "Zatím jednorázové, sledovat." },
      ],
      strengths: ["Baví ho psaní"],
      followUpQuestions: ["Jak teď vnímáš pravidla home office?", "Co bys příště udělal jinak u té klientské výtky?"],
      recommendation: "Do 2 týdnů krátký rozhovor s Lucií o očekáváních (HO) a o tom, jak u nás pracujeme s chybami.",
      analyzedAt: new Date().toISOString(), model: "ukázka",
    },
  };
  b.notes.push({ id: uid(), createdAt: new Date().toISOString(), text: "Lucie říkala, že termíny drží, jen je víc ve stresu před deadlinem." });
  return [a, b, c];
}

// =====================================================================
// Události
// =====================================================================

function bindEvents() {
  window.addEventListener("hashchange", render);

  $("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
  });

  document.addEventListener("click", (e) => {
    const row = e.target.closest("tr[data-href]");
    if (row && !e.target.closest("a, button")) {
      location.hash = row.dataset.href;
      return;
    }
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const { action, id, cp } = el.dataset;
    const p = id ? findPerson(id) : null;

    switch (action) {
      case "close-modal": closeModal(); break;
      case "add-person": openPersonForm(); break;
      case "edit-person": openPersonForm(p); break;
      case "archive-person":
        p.archived = !p.archived; save(); render();
        toast(p.archived ? "Archivováno – zmizí z přehledu a kalendáře" : "Vráceno z archivu");
        break;
      case "delete-person":
        if (confirm(`Opravdu smazat ${p.name} včetně všech přepisů a poznámek? Nejde to vrátit.`)) {
          state.db.people = state.db.people.filter((x) => x.id !== id);
          save(); location.hash = "#/lide"; toast("Smazáno");
        }
        break;
      case "toggle-archived":
        sessionStorage.setItem("showArchived", el.checked ? "1" : "0"); render(); break;
      case "load-demo":
        state.db.people.push(...demoData()); save(); render(); toast("Ukázková data nahrána – smažeš je v detailu člověka");
        break;
      case "upload":
        pickFile(".txt,.md,.vtt,.srt,text/plain", (f) => readFileAsTranscript(f, id, cp));
        break;
      case "paste":
        openModal(`
          <h2>Vložit přepis</h2>
          <form id="paste-form" class="stack">
            <textarea name="text" style="min-height:260px" placeholder="Sem vlož text přepisu schůzky…" required></textarea>
            <div class="row between"><button type="button" class="btn secondary" data-action="close-modal">Zrušit</button><button class="btn">Uložit přepis</button></div>
          </form>`, (root) => {
          $("#paste-form", root).addEventListener("submit", (ev) => {
            ev.preventDefault();
            const text = cleanTranscript(new FormData(ev.target).get("text"));
            closeModal();
            if (text) setTranscript(id, cp, text);
          });
        });
        break;
      case "mark-done":
        getCheckin(p, cp).done = true; save(); render(); break;
      case "remove-transcript":
        if (confirm("Smazat přepis i jeho vyhodnocení?")) {
          Object.assign(getCheckin(p, cp), { transcript: "", analysis: null }); save(); render();
        }
        break;
      case "analyze": runAnalysis(id, cp); break;
      case "delete-note":
        p.notes = p.notes.filter((n) => n.id !== el.dataset.note); save(); render(); break;
      case "cal-move": {
        const [y, m] = (state.calMonth || todayIso().slice(0, 7)).split("-").map(Number);
        const d = new Date(y, m - 1 + Number(el.dataset.delta), 1);
        state.calMonth = toIso(d).slice(0, 7); render(); break;
      }
      case "cal-today": state.calMonth = null; render(); break;
      case "export-ics": exportIcs(); break;
      case "add-item": {
        const kind = el.dataset.kind;
        if (kind === "checkpoints") settings().checkpoints.push({ id: "c-" + uid(), day: 45, label: "Nový check-in", focus: "" });
        else settings()[kind].push({ id: uid(), name: "", description: "" });
        sortCheckpoints(); save(); render(); break;
      }
      case "remove-item": {
        const list = settings()[el.dataset.kind];
        const item = list[Number(el.dataset.i)];
        if (confirm(`Odebrat „${item.name || item.label || "položku"}“?`)) {
          list.splice(Number(el.dataset.i), 1); save(); render();
        }
        break;
      }
      case "reset-settings":
        if (confirm("Vrátit hodnoty a red flags na výchozí? Check-iny zůstanou.")) {
          settings().values = structuredClone(DEFAULT_SETTINGS.values);
          settings().redFlags = structuredClone(DEFAULT_SETTINGS.redFlags);
          save(); render();
        }
        break;
      case "export-json":
        download(`fourbros-hr-zaloha-${todayIso()}.json`, JSON.stringify(state.db, null, 2), "application/json");
        break;
      case "import-json":
        pickFile(".json,application/json", async (f) => {
          try {
            const db = JSON.parse(await f.text());
            if (!Array.isArray(db.people) || !db.settings) throw new Error("neplatný formát");
            if (!confirm("Nahrát zálohu? Současná data se přepíšou.")) return;
            state.db = db; save(); render(); toast("Záloha nahrána");
          } catch (err) {
            toast("Zálohu se nepodařilo načíst: " + err.message);
          }
        });
        break;
      case "logout":
        api("POST", "/api/logout").catch(() => {}).finally(() => location.reload());
        break;
      case "wipe":
        if (confirm("Opravdu smazat VŠECHNA data (lidi, přepisy, poznámky)? Nejdřív si stáhni zálohu.") && prompt("Pro potvrzení napiš SMAZAT") === "SMAZAT") {
          state.db = emptyDb(); save(); location.hash = "#/prehled"; render(); toast("Data smazána");
        }
        break;
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.change) {
      const p = findPerson(el.dataset.id);
      const ci = getCheckin(p, el.dataset.cp);
      if (el.dataset.change === "ci-date") ci.date = el.value || null;
      if (el.dataset.change === "ci-manual") ci.manualStatus = el.value || null;
      if (el.dataset.change === "ci-notes") { ci.notes = el.value; save(); toast("Poznámka uložena"); return; }
      save(); render();
      return;
    }
    if (el.dataset.edit) {
      const item = settings()[el.dataset.edit][Number(el.dataset.i)];
      item[el.dataset.key] = el.dataset.key === "day" ? Math.max(1, Number(el.value) || 1) : el.value;
      if (el.dataset.edit === "checkpoints" && el.dataset.key === "day") { sortCheckpoints(); render(); }
      save();
    }
  });

  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (form.dataset.form === "add-note") {
      e.preventDefault();
      const text = new FormData(form).get("text").trim();
      if (!text) return;
      const p = findPerson(form.dataset.id);
      (p.notes ||= []).push({ id: uid(), createdAt: new Date().toISOString(), text });
      save(); render(); toast("Poznámka přidána");
    }
  });

  // drag & drop přepisů
  document.addEventListener("dragover", (e) => {
    const dz = e.target.closest("[data-drop]");
    if (dz) { e.preventDefault(); dz.classList.add("over"); }
  });
  document.addEventListener("dragleave", (e) => e.target.closest?.("[data-drop]")?.classList.remove("over"));
  document.addEventListener("drop", (e) => {
    const dz = e.target.closest("[data-drop]");
    if (!dz) return;
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) readFileAsTranscript(file, dz.dataset.id, dz.dataset.cp);
  });
}

function sortCheckpoints() {
  settings().checkpoints.sort((a, b) => a.day - b.day);
}

// ---------- start ----------

async function start() {
  try {
    await load();
    document.querySelector("#nav").hidden = false;
    render();
  } catch (err) {
    if (err instanceof LoginRequired) return showLogin();
    $("#app").innerHTML = emptyState("Appka se nenačetla", esc(err.message));
  }
}

bindEvents();
start();
