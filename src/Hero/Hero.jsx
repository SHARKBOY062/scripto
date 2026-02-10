import "./Hero.css";

export default function Hero() {
  return (
    <section id="top" className="section hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-badges">
            <span className="badge badge-tech">Automático</span>
            <span className="badge badge-tech">&lt; 5 min</span>
            <span className="badge badge-tech">Sem KYC</span>
          </div>

          <h1 className="hero-title">
            Converta cripto em minutos com um fluxo premium, simples e seguro.
          </h1>

          <p className="hero-text">
            Você informa o valor, escolhe o ativo e confirma. A conversão acontece de forma automática,
            com cálculo transparente de taxa e estimativa de tempo. Sem KYC e sem complicação.
          </p>

          <div className="hero-points">
            <div className="point">
              <div className="dot" />
              <div>
                <div className="point-title">Como funciona</div>
                <div className="point-desc">
                  Simulação instantânea → validação de limites → execução automática → confirmação.
                </div>
              </div>
            </div>

            <div className="point">
              <div className="dot" />
              <div>
                <div className="point-title">Transparência</div>
                <div className="point-desc">
                  Você vê taxa, total líquido e o valor final antes de continuar.
                </div>
              </div>
            </div>
          </div>

          <div className="hero-cta">
            <a className="btn btn-primary" href="#converter">
              Converter agora
              <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost" href="#market">Ver mercado</a>
          </div>

          <div className="hero-trust" aria-label="Sinais de confiança">
            <span className="trust-pill">🔒 Camadas de validação</span>
            <span className="trust-sep" />
            <span className="trust-pill">🧾 Taxa visível</span>
            <span className="trust-sep" />
            <span className="trust-pill">⚡ Execução rápida</span>
          </div>
        </div>

        <aside className="hero-card card" aria-label="Resumo do fluxo">
          <div className="hero-card-top">
            <div className="pill pill-wine">Resumo</div>
            <div className="mini">Pronto para conectar API</div>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-k">Tempo</div>
              <div className="stat-v">&lt; 5 min</div>
            </div>
            <div className="stat">
              <div className="stat-k">Processo</div>
              <div className="stat-v small">100% automático</div>
            </div>
            <div className="stat stat-wide">
              <div className="stat-k">Passos</div>
              <div className="stat-v small">Simular → Confirmar → Converter</div>
            </div>
          </div>

          <hr className="soft" />

          <div className="hero-note">
            Abaixo você vê o mercado em tempo real e, em seguida, o componente de conversão com o cálculo completo.
          </div>
        </aside>
      </div>
    </section>
  );
}
