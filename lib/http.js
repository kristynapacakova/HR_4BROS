// Sdílené pomůcky pro API handlery (Vercel funkce i lokální server).
import Anthropic from "@anthropic-ai/sdk";

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw httpError(400, "Neplatný JSON.");
  }
}

/** Převede výjimku na odpověď se srozumitelnou českou hláškou. */
export function errorResponse(err) {
  let status = err.status || 500;
  let message = err.message || "Neznámá chyba";
  if (err instanceof Anthropic.AuthenticationError) {
    [status, message] = [401, "Neplatný ANTHROPIC_API_KEY. Zkontroluj ho v nastavení Vercelu (Environment Variables)."];
  } else if (err instanceof Anthropic.RateLimitError) {
    [status, message] = [429, "Claude API je teď přetížené (rate limit). Zkus to za chvíli."];
  } else if (err instanceof Anthropic.APIConnectionError) {
    [status, message] = [502, "Nepodařilo se spojit s Claude API."];
  } else if (err instanceof Anthropic.APIError) {
    [status, message] = [502, `Chyba Claude API (${err.status}): ${err.message}`];
  }
  if (status >= 500) console.error(err);
  return json(status, { error: message });
}
