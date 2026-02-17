import { prisma } from "./_prisma.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  const token = String(req.query.token || "").trim();
  if (token.length < 20) return res.status(400).json({ ok: false, error: "invalid_token" });

  try {
    const data = await prisma.order.findUnique({
      where: { publicToken: token },
      select: {
        createdAt: true,
        asset: true,
        wallet: true,
        brlGross: true,
        brlNet: true,
        usdTourismRate: true,
        receiveUsdt: true,
        receiveBtc: true,
        status: true,
        txHash: true,
        txNetwork: true,
      },
    });

    if (!data) return res.status(404).json({ ok: false, error: "not_found" });
    return res.status(200).json({ ok: true, data });
  } catch {
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
