import { useEffect, useState } from "react";
import { adminList, adminUpdate } from "../services/api";

const short = (s = "") => {
  const v = String(s || "");
  if (v.length <= 18) return v;
  return `${v.slice(0, 9)}…${v.slice(-9)}`;
};

export default function Admin() {
  const [key, setKey] = useState(localStorage.getItem("scripto_admin_key") || "");
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    if (!key) return;
    setLoading(true);
    try {
      const data = await adminList(key);
      setRows(data);
    } catch (e) {
      setErr(String(e?.message || "Falha ao carregar"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (key) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(orderId, txHash, txNetwork, status) {
    setErr("");
    try {
      await adminUpdate(key, { id: orderId, txHash, txNetwork, status });
      await load();
    } catch (e) {
      setErr(String(e?.message || "Falha ao salvar"));
    }
  }

  return (
    <main>
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <h2 style={{ margin: 0 }}>Admin</h2>
          <p style={{ marginTop: 8, color: "var(--muted)" }}>
            Painel simples para registrar hash e confirmar operações. Leads não acessam esta área.
          </p>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <label className="label">Admin key</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                className="input"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Sua ADMIN_KEY"
                style={{ minWidth: 260, flex: "1 1 280px" }}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  localStorage.setItem("scripto_admin_key", key);
                  load();
                }}
                disabled={!key || loading}
              >
                {loading ? "Carregando..." : "Entrar"}
              </button>
              <button className="btn" onClick={load} disabled={!key || loading}>
                Atualizar
              </button>
            </div>

            {err && <div className="warn">{err}</div>}
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {rows.map((o) => (
              <OrderRow key={o.id} o={o} onSave={save} />
            ))}

            {!rows.length && key && !loading && (
              <div style={{ color: "var(--muted)" }}>Nenhum pedido ainda.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function OrderRow({ o, onSave }) {
  const [txHash, setTxHash] = useState(o.txHash || "");
  const [txNetwork, setTxNetwork] = useState(o.txNetwork || "");
  const [status, setStatus] = useState(o.status || "new");

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800 }}>
          {o.asset} • <span className="mono">{short(o.wallet)}</span>
        </div>
        <div style={{ color: "var(--muted)" }}>
          {new Date(o.createdAt).toLocaleString("pt-BR")}
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--muted)" }}>BRL</span>
          <b>{Number(o.brlGross).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
        </div>

        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          Token público: <span className="mono">{o.publicToken}</span>
        </div>

        <hr className="soft" />

        <label className="label">Tx hash</label>
        <input className="input" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x..." />

        <div className="conv-row two" style={{ margin: 0 }}>
          <div>
            <label className="label">Rede</label>
            <input className="input" value={txNetwork} onChange={(e) => setTxNetwork(e.target.value)} placeholder="TRC20 / ERC20 / BTC" />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="new">new</option>
              <option value="done">done</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <button className="btn btn-primary" onClick={() => onSave(o.id, txHash, txNetwork, status)}>
            Salvar
          </button>
          <button className="btn" onClick={() => {
            navigator.clipboard?.writeText(o.publicToken);
          }}>
            Copiar token
          </button>
        </div>
      </div>
    </div>
  );
}
