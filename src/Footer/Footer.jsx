import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-brand">
            <span className="mark" />
            <span className="name">Scripto</span>
          </div>
          <p className="desc">
            Landing page profissional para conversão cripto: clara, rápida e com estética vinho.
          </p>
        </div>

        <div className="footer-right">
          <a href="#top">Topo</a>
          <a href="#converter">Converter</a>
          <a href="#security">Segurança</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Scripto</span>
        <span className="sep">•</span>
        <span>UI demo</span>
      </div>
    </footer>
  );
}
