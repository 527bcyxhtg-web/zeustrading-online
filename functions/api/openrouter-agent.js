const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "arcee-ai/trinity-large-thinking:free";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function fallbackReview(context) {
  const account = context.account || {};
  const challenge = context.challenge || {};
  const market = context.market || {};
  const strategy = context.strategy || {};
  const riskAmount = Number(account.initialCapital || 0) * Number(account.riskPerTradePercent || 0);
  const target = Number(account.initialCapital || 0) * Number(challenge.profitTargetPercent || 0);

  return [
    "LOCAL RULE REVIEW",
    "",
    `Strategy candidate: ${strategy.label || "Unknown strategy"}`,
    `Primary market: ${market.label || "Unknown market"}`,
    `FTMO model: ${challenge.label || "Unknown challenge"}`,
    "",
    "Plan:",
    `- Risk per trade stays near ${Math.round(riskAmount)} account currency units and must never exceed 1%.`,
    `- Profit target is near ${Math.round(target)}, but daily loss and max loss rules come first.`,
    `- Entry must match: ${strategy.entry || "defined technical setup"}`,
    `- Invalidation: ${strategy.invalidation || "predefined stop-loss and structure failure"}`,
    `- Avoid: ${market.avoid || "high-impact news and abnormal spread"}`,
    "",
    "Required evidence before live:",
    "- Backtest and paper sample with positive expectancy after fees/slippage.",
    "- No FTMO daily loss or max loss violations.",
    "- Journal proves the same setup was followed repeatedly.",
  ].join("\n");
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const context = body.context || {};
  const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const apiKey = env.OPENROUTER_API_KEY;
  const fallback = fallbackReview(context);

  if (!apiKey) {
    return jsonResponse(
      {
        error: "OPENROUTER_API_KEY is not configured on Cloudflare Pages.",
        model,
        fallback,
      },
      503,
    );
  }

  const systemPrompt = [
    "You are Zeus Trading FTMO Strategy Agent.",
    "You help build and review rule-based strategy candidates for FTMO-style evaluation accounts.",
    "Do not promise profit, do not guarantee passing FTMO, and do not tell the user to blindly enter trades.",
    "Always prioritize risk limits, stop-loss, max daily loss, max loss, spread/news filters, paper testing, journaling, and backtesting.",
    "Use TradingView/forum ideas only as educational hypotheses that must be confirmed by the user's own chart and risk rules.",
    "Output in Croatian/Bosnian/Serbian. Be concise, practical, and structured.",
    "Include: strategy thesis, entry conditions, invalidation, news filter, risk plan, backtest/paper evidence required, and final approve/block verdict.",
  ].join(" ");

  const userPrompt = [
    "Review this FTMO strategy-agent context and produce a cautious strategy plan.",
    "Do not give financial advice. Treat this as research and paper-trading preparation.",
    JSON.stringify(context, null, 2),
  ].join("\n\n");

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://zeustrading.online",
      "X-Title": "Zeus Trading FTMO Agent",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.25,
      max_tokens: 1200,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    return jsonResponse({ error: "OpenRouter returned a non-JSON response.", model, fallback }, 502);
  }

  if (!response.ok) {
    return jsonResponse(
      {
        error: data.error?.message || "OpenRouter request failed.",
        model,
        fallback,
      },
      response.status,
    );
  }

  return jsonResponse({
    model: data.model || model,
    content: data.choices?.[0]?.message?.content || fallback,
    fallback,
  });
}
