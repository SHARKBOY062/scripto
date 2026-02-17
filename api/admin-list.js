import { prisma } from "./_prisma.js";

const isAdmin = (req) => String(req.headers["x-admin-key"] || "") === String(process.env.ADMIN_KEY || "");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: "unauthorized" });

  try {
    const data = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
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
        txHash: true,
        txNetwork: true,
      },
    });

    return res.status(200).json({ ok: true, data });
  } catch {
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
