import { useId, useState } from "react";
import "./FAQ.css";

const FAQS = [
  {
    q: "Como funciona a conversão?",
    a: "Você informa o valor em BRL, escolhe USDT ou BTC e informa a carteira de destino. Após gerar o PIX, o pedido fica registrado e a execução segue o fluxo definido pelo sistema. Quando confirmado, a hash aparece para acompanhamento.",
  },
  {
    q: "Em quanto tempo recebo?",
    a: "O objetivo do fluxo é concluir em menos de 5 minutos após a confirmação do pagamento. O tempo pode variar conforme rede, liquidez e validações do processo.",
  },
  {
    q: "Por que não precisa de KYC?",
    a: "O fluxo é desenhado para ser direto e sem cadastro. A validação acontece via regras internas do pedido e confirmação do pagamento, mantendo a experiência simples para o lead.",
  },
  {
    q: "Como é calculada a taxa e o câmbio?",
    a: "A taxa é aplicada sobre o valor enviado. Para USDT, o cálculo considera dólar turismo com spread (deságio). Para BTC, a taxa e a cotação seguem as regras do sistema.",
  },
  {
    q: "Onde vejo a hash da transação?",
    a: "Depois que a transação for confirmada no painel administrativo, a hash fica disponível na tela do pedido (quando você clicar em “Ver Hash”).",
  },
];

export default function FAQ() {
  const baseId = useId();
  const [open, setOpen] = useState(null);

  function toggle(i) {
    setOpen((cur) => (cur === i ? null : i));
  }

  return (
    <section id="faq" className="section faq">
      <div className="faq-head">
        <div className="faq-brand" aria-label="Scripto FAQ">
          <img className="faq-logo" src="/logo.png" alt="Scripto" />
          <div className="faq-titles">
            <h2 className="faq-title">Dúvidas frequentes</h2>
            <p className="faq-sub">
              Respostas rápidas, sem ruído. Tudo pensado para um fluxo premium e objetivo.
            </p>
          </div>
        </div>
      </div>

      <div className="faq-card card">
        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            const btnId = `${baseId}-q-${i}`;
            const panelId = `${baseId}-a-${i}`;

            return (
              <div className={`faq-item ${isOpen ? "open" : ""}`} key={item.q}>
                <button
                  id={btnId}
                  className="faq-q"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                >
                  <span className="faq-q-left">
                    <span className="faq-dot" aria-hidden="true" />
                    <span className="faq-q-text">{item.q}</span>
                  </span>

                  <span className="faq-q-right" aria-hidden="true">
                    <span className="faq-plus" />
                  </span>
                </button>

                <div
                  id={panelId}
                  className="faq-a"
                  role="region"
                  aria-labelledby={btnId}
                  style={{ maxHeight: isOpen ? 220 : 0 }}
                >
                  <div className="faq-a-inner">{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-foot">
          <div className="faq-foot-left">
            <span className="faq-foot-pill">Fluxo premium</span>
            <span className="faq-foot-pill">Transparência</span>
            <span className="faq-foot-pill">Acompanhamento por hash</span>
          </div>

          <a className="faq-foot-cta" href="#converter">
            Voltar para o conversor
          </a>
        </div>
      </div>
    </section>
  );
}
