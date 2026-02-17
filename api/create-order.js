import crypto from "crypto";
import { prisma } from "./_prisma.js";

const MIN_BRL = 250;
const FEE_PCT = 2.5;

const n = (v) => {
  const x = Number(String(v).replace(",", "."));
  return Number.isFinite(x) ? x : 0;
};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const body = req.body || {};
    const asset = body.asset === "BTC" ? "BTC" : "USDT";
    const wallet = String(body.wallet || "").trim();
    const brlGross = n(body.brl);

    if (!wallet || wallet.length < 16) return res.status(400).json({ ok: false, error: "invalid_wallet" });
    if (!brlGross || brlGross < MIN_BRL) return res.status(400).json({ ok: false, error: "min_250" });

    const USD_BRL = n(process.env.MOCK_USD_BRL || "5.05") || 5.05;
    const BTC_BRL = n(process.env.MOCK_BTC_BRL || "260000") || 260000;
    const TOURISM_SPREAD = n(process.env.TOURISM_SPREAD || "0.08") || 0.08;

    const feeBrl = (FEE_PCT / 100) * brlGross;
    const brlNet = clamp(brlGross - feeBrl, 0, Number.MAX_SAFE_INTEGER);

    const usdTourismRate = USD_BRL * (1 + TOURISM_SPREAD);

    let receiveUsdt = null;
    let receiveBtc = null;

    if (asset === "USDT") receiveUsdt = usdTourismRate > 0 ? brlNet / usdTourismRate : 0;
    if (asset === "BTC") receiveBtc = BTC_BRL > 0 ? brlNet / BTC_BRL : 0;

    const publicToken = crypto.randomBytes(24).toString("hex");

    const order = await prisma.order.create({
      data: {
        publicToken,
        asset,
        wallet,
        brlGross: String(brlGross),
        feePct: String(FEE_PCT),
        feeBrl: String(feeBrl),
        brlNet: String(brlNet),
        usdTourismRate: String(usdTourismRate),
        receiveUsdt: receiveUsdt === null ? null : String(receiveUsdt),
        receiveBtc: receiveBtc === null ? null : String(receiveBtc),
        status: "new",
      },
      select: {
        id: true,
        createdAt: true,
        publicToken: true,
        asset: true,
        wallet: true,
        brlGross: true,
        brlNet: true,
        usdTourismRate: true,
        receiveUsdt: true,
        receiveBtc: true,
        status: true,
      },
    });

    return res.status(200).json({ ok: true, order });
  } catch {
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
