export default function Error() {
  return (
    <div className="section">
      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ margin: 0 }}>Página não encontrada</h2>
        <p style={{ marginTop: 8, color: "rgba(26,15,20,.68)" }}>
          Verifique o link ou volte para o início.
        </p>
        <a className="btn btn-primary" href="/" style={{ marginTop: 10 }}>
          Ir para Home
        </a>
      </div>
    </div>
  );
}
