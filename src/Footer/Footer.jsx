import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer" aria-label="Rodapé">
      <div className="footer-inner">
        <div className="footer-left">
          <a className="footer-brand" href="#top" aria-label="Scripto">
            <img className="footer-logo" src="/logo.png" alt="Scripto" />
          </a>

          <p className="desc">
            Conversão cripto com foco em clareza, velocidade e acabamento premium.
          </p>
        </div>

        <nav className="footer-right" aria-label="Links">
          <a href="#top">Topo</a>
          <a href="#market">Mercado</a>
          <a href="#converter">Gerar PIX</a>
          <a href="#security">Segurança</a>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Scripto</span>
        <span className="sep">•</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
