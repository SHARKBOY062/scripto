import { useEffect, useMemo, useState } from "react";
import "./CryptoSlider.css";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
];

// brl dá uma cara “Brasil”; pode trocar pra "usd" se preferir
const VS = "brl";

// intervalo “real-time” sem estressar rate limit
const REFRESH_MS = 30_000;

const formatMoney = (n) => {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: VS.toUpperCase(),
    maximumFractionDigits: n < 1 ? 6 : n < 100 ? 4 : 2,
  }).format(n);
};

const formatPct = (n) => {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
};

function Track({ items, duplicated = false }) {
  return (
    <div className={`track ${duplicated ? "dup" : ""}`} aria-hidden={duplicated}>
      {items.map((c) => (
        <div className="coin card" key={`${c.id}-${duplicated ? "2" : "1"}`}>
          <div className="coin-top">
            <div className="coin-left">
              <img className="coin-logo" src={c.image} alt={`${c.name} logo`} loading="lazy" />
              <div className="coin-meta">
                <div className="coin-symbol">{c.symbol}</div>
                <div className="coin-name">{c.name}</div>
              </div>
            </div>

            <div className={`coin-chip ${c.change24h > 0 ? "up" : c.change24h < 0 ? "down" : ""}`}>
              {formatPct(c.change24h)}
            </div>
          </div>

          <div className="coin-bottom">
            <div className="coin-price">{formatMoney(c.price)}</div>
            <div className="coin-hint">Atualização automática</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CryptoSlider() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  const ids = useMemo(() => COINS.map((c) => c.id).join(","), []);

  const fetchPrices = async () => {
    try {
      setStatus((s) => ({ ...s, loading: s.loading && true, error: "" }));

      // CoinGecko markets: traz preço + variação + imagem
      const url =
        `https://api.coingecko.com/api/v3/coins/markets` +
        `?vs_currency=${VS}&ids=${encodeURIComponent(ids)}` +
        `&price_change_percentage=24h&sparkline=false`;

      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`Falha ao buscar preços (${res.status})`);

      const json = await res.json();

      // Normaliza na ordem do seu array COINS
      const normalized = COINS.map((c) => {
        const found = json.find((x) => x.id === c.id);
        return {
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          image: found?.image || "https://via.placeholder.com/32",
          price: Number(found?.current_price),
          change24h: Number(found?.price_change_percentage_24h),
        };
      });

      setData(normalized);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err?.message || "Erro ao carregar" });
    }
  };

  useEffect(() => {
    fetchPrices();
    const t = setInterval(fetchPrices, REFRESH_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = data.length ? data : COINS.map((c) => ({
    ...c,
    image: "https://via.placeholder.com/32",
    price: NaN,
    change24h: NaN,
  }));

  return (
    <section id="market" className="section slider">
      <div className="slider-head">
        <div className="slider-title-row">
          <h2 className="slider-title">Mercado em tempo real</h2>
          <span className={`live ${status.loading ? "loading" : ""}`}>
            <span className="live-dot" />
            {status.loading ? "Carregando..." : "Ao vivo"}
          </span>
        </div>

        <p className="slider-sub">
          Logos oficiais + preço atual + variação 24h. Visual claro, vinho elegante e movimento suave.
        </p>

        {status.error ? (
          <div className="slider-error">
            Não consegui atualizar agora: <b>{status.error}</b>. (Tentando novamente automaticamente)
          </div>
        ) : null}
      </div>

      <div className="marquee" role="region" aria-label="Crypto slider">
        <Track items={items} />
        <Track items={items} duplicated />
      </div>
    </section>
  );
}
