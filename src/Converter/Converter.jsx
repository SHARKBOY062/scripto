import { useEffect, useMemo, useRef, useState } from "react";
import { createOrder, getOrderPublic } from "../services/api";
import "./Converter.css";

const MIN_BRL = 250;

// Taxas por ativo
const FEE_USDT_PCT = 2.5;
const FEE_BTC_PCT = 5.0;

// Spread do “dólar turismo”
const TOURISM_SPREAD =
  Number(import.meta?.env?.VITE_TOURISM_SPREAD ?? "") ||
  Number(import.meta?.env?.TOURISM_SPREAD ?? "") ||
  0.08;

// Fallbacks (UI nunca quebra)
const FALLBACK_USD_BRL = 5.05;
const FALLBACK_BTC_BRL = 260000;

const ASSETS = [
  { code: "USDT", name: "USDT", sub: "Stablecoin" },
  { code: "BTC", name: "BTC", sub: "Bitcoin" },
];

const n = (v) => {
  const x = Number(String(v).replace(",", "."));
  return Number.isFinite(x) ? x : 0;
};

const formatBRL = (value) =>
  (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const shortAddr = (s = "") => {
  const v = String(s).trim();
  if (v.length <= 18) return v;
  return `${v.slice(0, 9)}…${v.slice(-9)}`;
};

function clampStr(s = "", max = 2200) {
  const v = String(s || "");
  return v.length > max ? v.slice(0, max) : v;
}

export default function Converter() {
  const [asset, setAsset] = useState("USDT");
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("250");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Cotações (agora via /api/quotes)
  const [usdBrl, setUsdBrl] = useState(FALLBACK_USD_BRL);
  const [btcBrl, setBtcBrl] = useState(FALLBACK_BTC_BRL);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // PIX modal
  const [pixOpen, setPixOpen] = useState(false);
  const [pixPayload, setPixPayload] = useState("");

  // Token público (para hash)
  const [publicToken, setPublicToken] = useState("");

  // HASH modal
  const [hashOpen, setHashOpen] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txNetwork, setTxNetwork] = useState("");
  const [status, setStatus] = useState("");
  const [hashLoading, setHashLoading] = useState(false);
  const pollRef = useRef(null);

  // Recupera token salvo (Ver Hash funciona após reload)
  useEffect(() => {
    const t = localStorage.getItem("scripto_last_token");
    if (t && !publicToken) setPublicToken(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brlGross = useMemo(() => n(amount), [amount]);
  const walletOk = useMemo(() => wallet.trim().length >= 16, [wallet]);

  const feePct = useMemo(() => (asset === "BTC" ? FEE_BTC_PCT : FEE_USDT_PCT), [asset]);

  const feeBrl = useMemo(() => (feePct / 100) * brlGross, [feePct, brlGross]);
  const brlNet = useMemo(() => Math.max(0, brlGross - feeBrl), [brlGross, feeBrl]);

  const withinMin = brlGross >= MIN_BRL;
  const canGenerate = withinMin && walletOk && !loading;

  const usdTourismRate = useMemo(() => {
    const base = Number.isFinite(usdBrl) ? usdBrl : FALLBACK_USD_BRL;
    return base * (1 + TOURISM_SPREAD);
  }, [usdBrl]);

  const receive = useMemo(() => {
    if (!Number.isFinite(brlNet) || brlNet <= 0) return 0;

    if (asset === "USDT") {
      return brlNet / usdTourismRate;
    }

    const btc = Number.isFinite(btcBrl) ? btcBrl : FALLBACK_BTC_BRL;
    return btc > 0 ? brlNet / btc : 0;
  }, [asset, brlNet, usdTourismRate, btcBrl]);

  // Cotações via Vercel Function (/api/quotes)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    const run = async () => {
      try {
        setQuoteLoading(true);

        const r = await fetch("/api/quotes", {
          cache: "no-store",
          signal: controller.signal,
        });

        const j = await r.json().catch(() => null);
        if (!alive) return;

        const usd = Number(j?.usdBrl);
        const btc = Number(j?.btcBrl);

        if (Number.isFinite(usd) && usd > 0) setUsdBrl(usd);
        if (Number.isFinite(btc) && btc > 0) setBtcBrl(btc);
      } catch {
        // silêncio: mantém fallback
      } finally {
        if (alive) setQuoteLoading(false);
      }
    };

    run();
    const t = setInterval(run, 60_000);

    return () => {
      alive = false;
      clearInterval(t);
      controller.abort();
    };
  }, []);

  async function onGeneratePix() {
    setErr("");
    if (!canGenerate) return;

    try {
      setLoading(true);

      // NÃO muda lógica do backend/admin
      const order = await createOrder({
        asset,
        wallet: wallet.trim(),
        brl: brlGross,
      });

      // token público para acompanhar hash
      const token = order?.publicToken || order?.token || order?.public_token || "";
      if (token) {
        localStorage.setItem("scripto_last_token", token);
        setPublicToken(token);
      }

      // pix payload conforme backend retornar
      const pix =
        order?.pixPayload ||
        order?.pix ||
        order?.pixCopyPaste ||
        order?.pix_copia_cola ||
        "";

      setPixPayload(clampStr(pix));
      setPixOpen(true);
    } catch (e) {
      setErr(String(e?.message || "Falha ao criar pedido."));
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(pixPayload || "");
    } catch {
      // silêncio
    }
  }

  async function refreshHashOnce(token) {
    if (!token) return;

    try {
      setHashLoading(true);
      const data = await getOrderPublic(token);

      const h = data?.txHash || data?.hash || data?.tx_hash || "";
      const net = data?.txNetwork || data?.network || data?.tx_network || "";
      const st = data?.status || "";

      setTxHash(h || "");
      setTxNetwork(net || "");
      setStatus(st || "");
    } catch {
      // silêncio (pode ainda não ter hash no admin)
    } finally {
      setHashLoading(false);
    }
  }

  function openHashModal() {
    const token = publicToken || localStorage.getItem("scripto_last_token") || "";

    if (!token) {
      setErr("Gere o PIX primeiro para criar um pedido e habilitar a hash.");
      return;
    }

    if (!publicToken) setPublicToken(token);

    setHashOpen(true);
    refreshHashOnce(token);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => refreshHashOnce(token), 30_000);
  }

  function closeHashModal() {
    setHashOpen(false);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const helper =
    brlGross > 0 && brlGross < MIN_BRL
      ? `Mínimo: ${formatBRL(MIN_BRL)}`
      : wallet.length > 0 && !walletOk
      ? "Cole uma carteira válida (completa)."
      : "";

  const tokenAvailable = publicToken || localStorage.getItem("scripto_last_token") || "";

  return (
    <section id="converter" className="section convLux">
      <div className="convLux__head">
        <div className="convLux__kicker">
          <span className="dot" />
          Engine de conversão
        </div>

        <h2 className="convLux__title">Conversão premium, rápida e objetiva</h2>

        <p className="convLux__sub">
          Fluxo direto. Informe valor e carteira, gere o PIX e acompanhe a hash quando confirmarmos.
        </p>

        <div className="convLux__chips" aria-label="Destaques">
          <span className="chip">Automático</span>
          <span className="chip">Menos de 5 min</span>
          <span className="chip">Sem cadastro</span>
          <span className="chip">Taxa fixa</span>
        </div>
      </div>

      <div className="convLux__grid">
        <div className="panel card">
          <div className="panel__bg" aria-hidden="true">
            <div className="gridlines" />
            <div className="halo haloA" />
            <div className="halo haloB" />
          </div>

          <div className="panel__top">
            <div className="panel__brand">
              <span className="mark" />
              <div className="brandText">
                <div className="brandName">Scripto</div>
                <div className="brandSub">Converter</div>
              </div>
            </div>

            <div className="panel__status">
              <span className="statusPill">
                <span className={`pulse ${quoteLoading ? "pulse--busy" : ""}`} />
                {quoteLoading ? "atualizando cotações" : "pronto"}
              </span>
            </div>
          </div>

          <div className="panel__body">
            <div className="assetRow">
              <div className="assetLabel">Ativo</div>

              <div className="assetSwitch" role="tablist" aria-label="Selecionar ativo">
                {ASSETS.map((a) => (
                  <button
                    key={a.code}
                    type="button"
                    className={`assetBtn ${asset === a.code ? "on" : ""}`}
                    onClick={() => setAsset(a.code)}
                    role="tab"
                    aria-selected={asset === a.code}
                  >
                    <span className={`assetLogo assetLogo--${a.code}`} aria-hidden="true">
                      {a.code}
                    </span>

                    <span className="assetMeta">
                      <span className="assetCode">{a.name}</span>
                      <span className="assetSub">{a.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="fieldGrid">
              <div className="field">
                <label className="label">Você envia</label>
                <div className="inputWrap">
                  <span className="prefix">BRL</span>
                  <input
                    className="input"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250"
                    aria-label="Valor em BRL"
                  />
                  <span className="hintPill">mín {formatBRL(MIN_BRL)}</span>
                </div>
              </div>

              <div className="field">
                <label className="label">Taxa</label>
                <div className="meter">
                  <div className="meterTop">
                    <span>Fixa</span>
                    <b>{feePct.toFixed(1)}%</b>
                  </div>
                  <div className="meterBar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, Math.max(10, feePct * 10))}%` }} />
                  </div>
                  <div className="meterNote">Aplicada antes da conversão</div>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Carteira para receber {asset}</label>
              <div className="inputWrap">
                <input
                  className="input mono"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder={asset === "BTC" ? "bc1... / 1... (BTC)" : "0x... / TRC20 (USDT)"}
                  aria-label="Carteira de destino"
                />
                <span className={`validDot ${walletOk ? "ok" : wallet.length ? "bad" : ""}`} aria-hidden="true" />
              </div>
              <div className="helper">
                Destino: <b className="mono">{walletOk ? shortAddr(wallet) : "—"}</b>
              </div>
            </div>

            <div className="quoteBox">
              <div className="quoteTitle">Cálculo</div>

              <div className="quoteRow">
                <span>Taxa (BRL)</span>
                <b>{formatBRL(feeBrl)}</b>
              </div>

              <div className="quoteRow strong">
                <span>Valor líquido</span>
                <b>{formatBRL(brlNet)}</b>
              </div>

              <div className="quoteRow">
                <span>Cotação</span>
                <b className="mono">
                  {asset === "USDT"
                    ? `USD/BRL turismo ${usdTourismRate.toFixed(4)}`
                    : `BTC/BRL ${Number(btcBrl).toLocaleString("pt-BR")}`}
                </b>
              </div>

              <div className="quoteRow strong">
                <span>Você recebe</span>
                <b className="mono">
                  {receive.toLocaleString("pt-BR", { maximumFractionDigits: asset === "BTC" ? 8 : 2 })} {asset}
                </b>
              </div>

              <div className="quoteFoot">
                <span className="miniTag">Execução automática</span>
                <span className="miniTag">Hash após confirmação</span>
                <span className="miniTag">Sem cadastro</span>
              </div>

              <div className="quoteNote">
                {asset === "USDT"
                  ? `USDT usa dólar turismo com spread (${Math.round(TOURISM_SPREAD * 100)}%).`
                  : "BTC aplica taxa fixa de 5% e usa cotação BRL."}
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className={`btn btn-primary ${!canGenerate ? "disabled" : ""}`}
                onClick={onGeneratePix}
                disabled={!canGenerate}
              >
                {loading ? "Gerando..." : "Gerar PIX"}
                <span className="btnArrow" aria-hidden="true">
                  →
                </span>
              </button>

              <button
                type="button"
                className={`btn btn-ghost ${!tokenAvailable ? "disabled" : ""}`}
                onClick={openHashModal}
                disabled={!tokenAvailable}
                title={!tokenAvailable ? "Gere o PIX primeiro" : "Abrir acompanhamento da hash"}
              >
                Ver Hash
              </button>
            </div>

            {helper && <div className="warn">{helper}</div>}
            {err && <div className="warn">{err}</div>}
          </div>
        </div>

        <aside className="side card">
          <div className="sideTop">
            <div className="pill pill-wine">Resumo</div>
            <div className="mini">Preview</div>
          </div>

          <div className="sideList">
            <div className="row">
              <span>Ativo</span>
              <b>{asset}</b>
            </div>
            <div className="row">
              <span>Você envia</span>
              <b>{formatBRL(brlGross)}</b>
            </div>
            <div className="row">
              <span>Líquido</span>
              <b>{formatBRL(brlNet)}</b>
            </div>
            <div className="row">
              <span>Você recebe</span>
              <b className="mono">
                {receive.toLocaleString("pt-BR", { maximumFractionDigits: asset === "BTC" ? 8 : 2 })} {asset}
              </b>
            </div>

            <hr className="soft" />

            <div className="row">
              <span>Destino</span>
              <b className="mono">{walletOk ? shortAddr(wallet) : "—"}</b>
            </div>

            <div className="sideNote">
              Gere o PIX para registrar o pedido. A hash aparece assim que você confirmar no painel.
            </div>
          </div>

          <div className="sideSeal" aria-hidden="true">
            <div className="sealRing" />
            <div className="sealText">SECURE FLOW</div>
          </div>
        </aside>
      </div>

      {/* Modal PIX */}
      {pixOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal card">
            <div className="modalTop">
              <div className="modalTitle">PIX para iniciar a conversão</div>
              <button className="modalClose" onClick={() => setPixOpen(false)} aria-label="Fechar" type="button">
                ×
              </button>
            </div>

            <div className="modalBody">
              <div className="modalKpis">
                <div className="kpi">
                  <div className="k">Líquido</div>
                  <div className="v">{formatBRL(brlNet)}</div>
                </div>
                <div className="kpi">
                  <div className="k">Ativo</div>
                  <div className="v mono">{asset}</div>
                </div>
                <div className="kpi">
                  <div className="k">Destino</div>
                  <div className="v mono">{walletOk ? shortAddr(wallet) : "—"}</div>
                </div>
              </div>

              <div className="pixBox">
                <div className="pixLabel">PIX copia e cola</div>

                <textarea
                  className="pixText"
                  readOnly
                  value={
                    pixPayload ||
                    "Seu backend ainda não retornou o PIX. Ajuste a resposta do createOrder para incluir pixPayload."
                  }
                />

                <div className="pixActions">
                  <button
                    className={`btn btn-primary ${!pixPayload ? "disabled" : ""}`}
                    onClick={copyPix}
                    disabled={!pixPayload}
                    type="button"
                  >
                    Copiar PIX
                    <span className="btnArrow" aria-hidden="true">
                      →
                    </span>
                  </button>

                  <button className="btn btn-ghost" onClick={() => setPixOpen(false)} type="button">
                    Voltar
                  </button>
                </div>

                <div className="pixNote">
                  Após o pagamento, a execução segue automaticamente. Use “Ver Hash” para acompanhar quando for confirmada.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal HASH (poll 30s) */}
      {hashOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal card">
            <div className="modalTop">
              <div className="modalTitle">Hash da transação</div>
              <button className="modalClose" onClick={closeHashModal} aria-label="Fechar" type="button">
                ×
              </button>
            </div>

            <div className="modalBody">
              <div className="hashGrid">
                <div className="hashItem">
                  <div className="k">Status</div>
                  <div className="v">{status || (hashLoading ? "atualizando..." : "aguardando confirmação")}</div>
                </div>

                <div className="hashItem">
                  <div className="k">Rede</div>
                  <div className="v mono">{txNetwork || "—"}</div>
                </div>

                <div className="hashItem hashItemWide">
                  <div className="k">Hash</div>
                  <div className="v mono hashValue">{txHash || (hashLoading ? "consultando..." : "ainda não informada")}</div>
                </div>
              </div>

              <div className="hashFoot">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    const token = publicToken || localStorage.getItem("scripto_last_token") || "";
                    refreshHashOnce(token);
                  }}
                >
                  Atualizar agora
                  <span className="btnArrow" aria-hidden="true">
                    →
                  </span>
                </button>

                <div className="hashHint">
                  Atualiza automaticamente a cada <b>30s</b> enquanto este popup estiver aberto.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
