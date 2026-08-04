/*
  One place where errors are recorded.

  The split matters: users get a short, generic sentence plus a reference
  code, and never a message, stack, module path or bundle name. Full detail
  goes to the reporter.

  IMPORTANT: this is a static site with no backend, so "log server-side"
  cannot be satisfied here — detail currently goes to the browser console,
  which is the developer's own console, not a server. Wiring a real
  collector (Sentry, Logtail, a logging endpoint) means implementing
  `sendToCollector` below; nothing else has to change.
*/

const GENERIC_MESSAGE = 'Something went wrong on our side. Please try again.';

// short, non-guessable, easy to read out over WhatsApp
function makeReference() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function sendToCollector(payload) {
  // No collector configured. Deliberately a no-op rather than a fetch to a
  // placeholder URL, which would fail on every error and add noise.
  void payload;
}

/*
  Records an error and returns what is safe to put on screen.
  Never returns error.message — that can carry paths or internal detail.
*/
export function reportError(error, context = {}) {
  const reference = makeReference();

  const payload = {
    reference,
    at: new Date().toISOString(),
    where: context.where || 'unknown',
    name: error?.name,
    message: error?.message,
    stack: error?.stack,
    url: typeof location !== 'undefined' ? location.pathname : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...context,
  };

  // Full detail for whoever is debugging. import.meta.env.DEV is compiled out
  // of the production bundle, so the stack is never printed for visitors.
  if (import.meta.env.DEV) {
    console.error(`[hello-saathi] ${payload.where} (ref ${reference})`, payload);
  }

  try {
    sendToCollector(payload);
  } catch {
    // a failing reporter must never become the thing that breaks the page
  }

  return { reference, message: GENERIC_MESSAGE };
}

export { GENERIC_MESSAGE };
