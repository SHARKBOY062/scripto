import "./Hero.css";

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="ic" aria-hidden="true">
      <path
        d="M12 2l7 4v6c0 5-3.5 9.4-7 10-3.5-.6-7-5-7-10V6l7-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.1l1.8 1.9 3.9-4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="ic" aria-hidden="true">
      <path
        d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" className="ic" aria-hidden="true">
      <path
        d="M2.5 12s3.6-7 9.5-7 9.5 7 9.5 7-3.6 7-9.5 7-9.5-7-9.5-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" className="ic ic--sm" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LuxBadge({ children }) {
  return (
    <span className="hBadge">
      <span className="hBadge__shine" aria-hidden="true" />
      {children}
    </span>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="hFeat">
      <div className="hFeat__ic">{icon}</div>
      <div className="hFeat__txt">
        <div className="hFeat__t">{title}</div>
        <div className="hFeat__d">{desc}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="section heroLux">
      {/* fundo premium controlado */}
      <div className="heroLux__bg" aria-hidden="true">
        <div className="bgGrid" />
        <div className="bgHalo bgHaloA" />
        <div className="bgHalo bgHaloB" />
        <div className="bgNoise" />
        <div className="bgVignette" />
      </div>

      <div className="heroLux__wrap">
        {/* Left */}
        <div className="heroLux__copy">
          <div className="heroLux__topline">
            <LuxBadge>Automático</LuxBadge>
            <LuxBadge>Menos de 5 min</LuxBadge>
            <LuxBadge>Sem KYC</LuxBadge>
          </div>

          <h1 className="heroLux__title">
            Conversão cripto com acabamento premium.
            <span className="heroLux__titleAccent"> Clareza absoluta.</span>
          </h1>

          <p className="heroLux__sub">
            Um fluxo direto: informe o valor, selecione o ativo, gere o PIX e acompanhe a hash assim que for confirmada.
          </p>

          <div className="heroLux__actions">
            <a className="btn btn-primary heroLux__cta" href="#converter">
              Converter agora
              <span className="heroLux__ctaIcon" aria-hidden="true">
                <IconChevron />
              </span>
            </a>

            <a className="btn btn-ghost heroLux__ghost" href="#market">
              Ver mercado
            </a>
          </div>

          <div className="heroLux__features" aria-label="Destaques">
            <Feature
              icon={<IconShield />}
              title="Validação e rastreio"
              desc="Pedido registrado, status objetivo e hash exibida após confirmação."
            />
            <Feature
              icon={<IconEye />}
              title="Taxa visível"
              desc="Cálculo transparente do líquido, sem surpresa no final."
            />
            <Feature
              icon={<IconBolt />}
              title="Execução rápida"
              desc="Experiência otimizada para conversão e baixa fricção."
            />
          </div>
        </div>

        {/* Right */}
        <aside className="heroLux__card card" aria-label="Resumo de fluxo">
          <div className="heroLux__cardBg" aria-hidden="true">
            <div className="cardGlow" />
            <div className="cardGrid" />
          </div>

          <div className="heroLux__cardTop">
            <div className="pill pill-wine">Resumo</div>
            <div className="mini">Fluxo premium</div>
          </div>

          <div className="heroLux__kpis">
            <div className="kpi">
              <div className="k">Tempo</div>
              <div className="v">&lt; 5 min</div>
            </div>
            <div className="kpi">
              <div className="k">Cadastro</div>
              <div className="v">Não exige</div>
            </div>
            <div className="kpi kpiWide">
              <div className="k">Sequência</div>
              <div className="v vSmall">Valor → Ativo → PIX → Confirmação → Hash</div>
            </div>
          </div>

          <div className="heroLux__divider" />

          <div className="heroLux__micro">
            <div className="microRow">
              <span className="microDot" aria-hidden="true" />
              <span>Design limpo, leitura rápida</span>
            </div>
            <div className="microRow">
              <span className="microDot" aria-hidden="true" />
              <span>Camadas visuais “luxo-tech”</span>
            </div>
            <div className="microRow">
              <span className="microDot" aria-hidden="true" />
              <span>Pronto para escalar com API</span>
            </div>
          </div>

          <div className="heroLux__cardFoot" aria-hidden="true">
            <div className="seal">
              <div className="sealRing" />
              <div className="sealText">SECURE FLOW</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
