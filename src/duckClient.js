export const KNOWN_MODELS = [
  { id: "Claude Haiku 5.5", label: "Claude Haiku 5.5 (free)" },
  { id: "Claude Sonnet 5.5", label: "Claude Sonnet 5.5 (paid)" },
];

export const UPSTREAM = {
  statusUrl: "https://duckduckgo.com/duckchat/v1/status",
  chatUrl: "https://duckduckgo.com/duckchat/v1/chat",
};

export function buildUpstreamBody({ model, messages }) {
  return {
    model,
    metadata: { toolChoice: { NewsSearch: false, VideosSearch: false } },
    messages,
    canUseTools: true,
  };
}

export async function sendUpstream({ model, messages }, env = process.env) {
  const hash = env.DUCK_X_VQD_HASH_1;
  const feVersion = env.DUCK_X_FE_VERSION;
  if (!hash || !feVersion) {
    const err = new Error(
      "Upstream mode needs DUCK_X_VQD_HASH_1 and DUCK_X_FE_VERSION supplied by you. " +
      "These are ephemeral session values, not a stable API key. See README.md."
    );
    err.code = "MISSING_UPSTREAM_HEADERS";
    throw err;
  }
  const res = await fetch(UPSTREAM.chatUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream",
      "x-vqd-hash-1": hash,
      "x-fe-version": feVersion,
    },
    body: JSON.stringify(buildUpstreamBody({ model, messages })),
  });
  return res;
}
