export async function createOrder({ asset, wallet, brl }) {
  const r = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asset, wallet, brl }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || "request_failed");
  return j.order;
}

export async function getPublicOrder(token) {
  const r = await fetch(`/api/order-public?token=${encodeURIComponent(token)}`);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || "request_failed");
  return j.data;
}

export async function adminList(adminKey) {
  const r = await fetch("/api/admin-list", {
    headers: { "x-admin-key": adminKey },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || "request_failed");
  return j.data;
}

export async function adminUpdate(adminKey, payload) {
  const r = await fetch("/api/admin-update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || "request_failed");
  return j.data;
}
export async function getOrderPublic(token) {
  const r = await fetch(`/api/orders/public?token=${encodeURIComponent(token)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!r.ok) {
    throw new Error("Não foi possível consultar o status do pedido.");
  }

  return r.json();
}
