import { useMemo, useState } from "react";
import "./Converter.css";

const ASSETS = [
  { code: "USDT", label: "USDT (Tether)" },
  { code: "BTC", label: "BTC (Bitcoin)" },
  { code: "ETH", label: "ETH (Ethereum)" },
];

// Mock (você vai trocar por API depois)
const MOCK_RATES_BRL = {
  USDT: 5.0,
  BTC: 260000,
  ETH: 14000,
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const onlyDigits = (v = "") => String(v).replace(/\D/g, "");
const formatBRL = (n) =>
  Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

const shortAddr = (s = "") => {
  const v = String(s).trim();
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-6)}`;
};

export default function Converter() {
  const [amount, setAmount] = useState("1000");
  const [asset, setAsset] = useState("USDT");
  const [wallet, setWallet] = useState("");
  const [feePct, setFeePct] = useState(0.9);
  const [isFast, setIsFast] = useState(true);

  // UI do PIX (mock)
  const [pixOpen, setPixOpen] = useState(false);
  const [pix, setPix] = useState(null);

  const parsed = useMemo(() => {
    const v = Number(String(amount).replace(",", "."));
    return Number.isFinite(v) ? v : 0;
  }, [amount]);

  const limits = useMemo(() => {
    const min = 50;
    const max = 500000;
    return { min, max };
  }, []);

  const within = parsed >= limits.min && parsed <= limits.max;

  const walletOk = useMemo(() => {
    const w = wallet.trim();
    // Validação leve (evita bloquear). Produção: validar por rede.
    return w.length >= 16;
  }, [wallet]);

  const quote = useMemo(() => {
    const baseRate = MOCK_RATES_BRL[asset] || 1;
    const fee = (feePct / 100) * parsed;
    const net = clamp(parsed - fee, 0, Number.MAX_SAFE_INTEGER);
    const out = baseRate > 0 ? net / baseRate : 0;

    const eta = isFast ? "≈ 3–5 min" : "≈ 5–12 min";
    return { baseRate, fee, net, out, eta };
  }, [parsed, asset, feePct, isFast]);

  const canGenerate = within && walletOk;

  const generatePixMock = () => {
    // Em produção: chamar seu backend e receber payload real (pix copia-e-cola, txid, expiração, etc.)
    const txid = `SCP${Date.now().toString(36).toUpperCase()}`;
    const cents = Math.round(quote.net * 100);
    const payload = `00020126580014BR.GOV.BCB.PIX0136mock-${txid}52040000530398654${cents}5802BR5906SCRIPTO6009SAO PAULO62100506${txid}6304ABCD`;

    setPix({
      txid,
      amount: quote.net,
      asset,
      receive: quote.out,
      wallet: wallet.trim(),
      eta: quote.eta,
      payload,
      expires: "10 min",
    });
    setPixOpen(true);
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pix?.payload || "");
    } catch {
      // sem barulho
    }
  };

  return (
    <section id="converter" className="section">
      <div className="conv-head">
        <h2 className="conv-title">Converter</h2>
        <p className="conv-sub">
          Informe o valor, escolha o ativo e a carteira de destino. Geramos um PIX para iniciar a conversão automática.
        </p>
      </div>

      <div className="conv-grid">
        {/* Form */}
        <div className="conv card">
          <div className="conv-row">
            <label className="label">Você envia (BRL)</label>
            <input
              className="input"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 1000"
            />
            <div className="helper">
              Limites: <b>{formatBRL(limits.min)}</b> até{" "}
              <b>{formatBRL(limits.max)}</b>
            </div>
          </div>

          <div className="conv-row two">
            <div>
              <label className="label">Recebe</label>
              <select className="input" value={asset} onChange={(e) => setAsset(e.target.value)}>
                {ASSETS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Taxa (%)</label>
              <input
                className="input"
                inputMode="decimal"
                value={String(feePct)}
                onChange={(e) => setFeePct(Number(String(e.target.value).replace(",", ".")) || 0)}
              />
            </div>
          </div>

          <div className="conv-row">
            <label className="label">Carteira de destino</label>
            <input
              className="input"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder={`Cole a wallet para receber ${asset} (ex: 0x..., bc1..., ...)`}
            />
            <div className="helper">
              A conversão será enviada para <b>{walletOk ? shortAddr(wallet) : "sua carteira"}</b>.
            </div>
          </div>

          <div className="conv-row">
            <label className="label">Modo</label>
            <div className="seg">
              <button
                type="button"
                className={`seg-btn ${isFast ? "on" : ""}`}
                onClick={() => setIsFast(true)}
              >
                Rápido
              </button>
              <button
                type="button"
                className={`seg-btn ${!isFast ? "on" : ""}`}
                onClick={() => setIsFast(false)}
              >
                Econômico
              </button>
            </div>
            <div className="helper">
              Estimativa: <b>{quote.eta}</b> • Execução automática • Sem KYC
            </div>
          </div>

          <div className="conv-actions">
            <button
              type="button"
              className={`btn btn-primary ${!canGenerate ? "disabled" : ""}`}
              onClick={() => canGenerate && generatePixMock()}
            >
              Gerar PIX
            </button>

            <a className="btn" href="#market">Ver mercado</a>
          </div>

          {!within && (
            <div className="warn">
              Valor fora do limite. Ajuste para continuar.
            </div>
          )}

          {within && !walletOk && (
            <div className="warn">
              Informe uma carteira válida para receber <b>{asset}</b>.
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="summary card">
          <div className="summary-top">
            <div className="pill pill-wine">Resumo</div>
            <div className="mini">Simulação</div>
          </div>

          <div className="summary-list">
            <div className="row">
              <span>Valor enviado</span>
              <b>{formatBRL(parsed)}</b>
            </div>

            <div className="row">
              <span>Taxa</span>
              <b>{formatBRL(quote.fee)}</b>
            </div>

            <div className="row">
              <span>Valor líquido</span>
              <b>{formatBRL(quote.net)}</b>
            </div>

            <div className="row">
              <span>Cotação ({asset})</span>
              <b>{formatBRL(quote.baseRate)}</b>
            </div>

            <hr className="soft" />

            <div className="row big">
              <span>Você recebe</span>
              <b>
                {quote.out.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} {asset}
              </b>
            </div>

            <div className="row">
              <span>Destino</span>
              <b className="mono">{walletOk ? shortAddr(wallet) : "—"}</b>
            </div>

            <div className="note">
              Ao gerar o PIX, iniciamos a conversão automática e enviamos o ativo para a carteira informada.
            </div>
          </div>
        </aside>
      </div>

      {/* Modal / Drawer de PIX (elegante, sem poluição) */}
      {pixOpen && pix && (
        <div className="pix-overlay" role="dialog" aria-modal="true">
          <div className="pix card">
            <div className="pix-top">
              <div className="pix-title">
                PIX para conversão <span className="pix-tag">Tx {pix.txid}</span>
              </div>
              <button className="pix-close" onClick={() => setPixOpen(false)} aria-label="Fechar">
                ✕
              </button>
            </div>

            <div className="pix-kpis">
              <div className="kpi">
                <div className="k">Pagar</div>
                <div className="v">{formatBRL(pix.amount)}</div>
              </div>
              <div className="kpi">
                <div className="k">Receber</div>
                <div className="v">
                  {pix.receive.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} {pix.asset}
                </div>
              </div>
              <div className="kpi">
                <div className="k">Tempo</div>
                <div className="v">{pix.eta}</div>
              </div>
            </div>

            <div className="pix-box">
              <div className="pix-label">PIX copia e cola</div>
              <textarea className="pix-textarea" readOnly value={pix.payload} />
              <div className="pix-actions">
                <button className="btn btn-primary" type="button" onClick={copyPix}>
                  Copiar PIX
                </button>
                <button className="btn" type="button" onClick={() => setPixOpen(false)}>
                  Voltar
                </button>
              </div>

              <div className="pix-note">
                Expira em <b>{pix.expires}</b>. Após o pagamento, a execução é automática e o envio ocorre para{" "}
                <b className="mono">{shortAddr(pix.wallet)}</b>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segurança/explicação curta e premium */}
      <section id="security" className="security">
        <div className="security-inner card">
          <h3>Segurança</h3>
          <p>
            Fluxo objetivo e transparente: validação de limites, taxa visível e confirmação automática.
            Em produção, o backend confirma pagamento via webhook e libera a execução.
          </p>
          <div className="security-badges">
            <span className="badge">🔒 Validação</span>
            <span className="badge">🧾 Transparência</span>
            <span className="badge">📡 Webhook</span>
          </div>
        </div>
      </section>
    </section>
  );
}
