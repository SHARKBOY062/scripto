import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="Scripto">
          <span className="brand-mark" />
          <span className="brand-name">Scripto</span>
          <span className="brand-sub">Crypto Converter</span>
        </a>

        <nav className="nav">
          <a className="nav-link" href="#market">Mercado</a>
          <a className="nav-link" href="#limits">Limites</a>
          <a className="nav-link" href="#security">Segurança</a>
          <a className="btn btn-primary" href="#converter">Converter agora</a>
        </nav>
      </div>
    </header>
  );
}
