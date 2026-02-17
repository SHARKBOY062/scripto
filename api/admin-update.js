import { prisma } from "./_prisma.js";

const isAdmin = (req) => String(req.headers["x-admin-key"] || "") === String(process.env.ADMIN_KEY || "");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });
  if (!isAdmin(req)) return res.status(401).json({ ok: false, error: "unauthorized" });

  try {
    const { id, txHash, txNetwork, status } = req.body || {};
    const orderId = String(id || "").trim();
    if (!orderId) return res.status(400).json({ ok: false, error: "missing_id" });

    const data = await prisma.order.update({
      where: { id: orderId },
      data: {
        txHash: txHash ? String(txHash).trim() : null,
        txNetwork: txNetwork ? String(txNetwork).trim() : null,
        status: status === "done" ? "done" : "new",
      },
      select: { id: true, status: true, txHash: true, txNetwork: true },
    });

    return res.status(200).json({ ok: true, data });
  } catch {
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
