import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getPublicOrder } from "../services/api";

const formatBRL = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const short = (s = "") => {
  const v = String(s || "");
  if (v.length <= 18) return v;
  return `${v.slice(0, 9)}…${v.slice(-9)}`;
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Success() {
  const q = useQuery();
  const token = q.get("token") || localStorage.getItem("scripto_last_token") || "";

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const d = await getPublicOrder(token);
      setData(d);
    } catch (e) {
      setErr(String(e?.message || "Falha ao carregar pedido"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setErr("Token não encontrado.");
      setLoading(false);
      return;
    }
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main>
      <section className="section">
        <div className="card" style={{ padding: 18 }}>
          <h2 style={{ margin: 0 }}>Acompanhar conversão</h2>
          <p style={{ marginTop: 8, color: "var(--muted)" }}>
            Atualizamos automaticamente. Guarde este link para acompanhar a hash.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <button className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
            <Link className="btn" to="/">Voltar</Link>
          </div>

          {err && <div className="warn" style={{ marginTop: 12 }}>{err}</div>}

          {data && (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div><b>Status:</b> {data.status === "done" ? "Confirmado" : "Aguardando confirmação"}</div>
                  <div style={{ color: "var(--muted)" }}><b>Ativo:</b> {data.asset}</div>
                </div>

                <hr className="soft" style={{ margin: "14px 0" }} />

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>Você enviou</span>
                    <b>{formatBRL(Number(data.brlGross))}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>Valor líquido</span>
                    <b>{formatBRL(Number(data.brlNet))}</b>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>Destino</span>
                    <b className="mono">{short(data.wallet)}</b>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 700 }}>Hash da transação</div>
                <div style={{ marginTop: 8 }}>
                  {data.txHash ? (
                    <>
                      <div className="mono" style={{ wordBreak: "break-all" }}>{data.txHash}</div>
                      <div style={{ marginTop: 6, color: "var(--muted)" }}>
                        Rede: <b>{data.txNetwork || "—"}</b>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: "var(--muted)" }}>
                      Ainda não confirmada. Assim que a operação for concluída, a hash aparecerá aqui.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                Token: <span className="mono">{token}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
