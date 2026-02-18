// /api/quotes.js
export default async function handler(req, res) {
  // Se algum dia você chamar de outro domínio, isso evita bloqueio
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // Cache no CDN da Vercel:
  // - s-maxage=60 => 1 min “forte”
  // - stale-while-revalidate=300 => se tiver pico, entrega cache antigo e revalida ao fundo
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  try {
    const [cgResp, exResp] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=brl,usd",
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "scripto-vercel-quotes-proxy",
          },
        }
      ),
      fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL", {
        headers: { Accept: "application/json" },
      }),
    ]);

    const cgOk = cgResp.ok;
    const exOk = exResp.ok;

    const cg = cgOk ? await cgResp.json() : null;
    const ex = exOk ? await exResp.json() : null;

    const btcBrl = Number(cg?.bitcoin?.brl || 0);
    const tetherUsd = Number(cg?.tether?.usd || 1); // geralmente ~1
    const usdBrl = Number(ex?.rates?.BRL || 0);

    return res.status(200).json({
      ok: true,
      ts: Date.now(),
      // dados principais que seu front precisa
      btcBrl: Number.isFinite(btcBrl) && btcBrl > 0 ? btcBrl : null,
      usdBrl: Number.isFinite(usdBrl) && usdBrl > 0 ? usdBrl : null,
      usdtUsd: Number.isFinite(tetherUsd) && tetherUsd > 0 ? tetherUsd : 1,
      // flags úteis pra debug
      cgOk,
      exOk,
    });
  } catch (e) {
    return res.status(200).json({
      ok: false,
      ts: Date.now(),
      error: "quotes_unavailable",
    });
  }
}
