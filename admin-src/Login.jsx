import netlifyIdentity from "netlify-identity-widget";

export default function Login() {
  return (
    <div className="login-shell">
      <h1>NDS Nutzfahrzeuge — Admin</h1>
      <p className="who">Anmeldung über Netlify Identity erforderlich.</p>
      <button className="btn btn-primary" onClick={() => netlifyIdentity.open("login")}>
        Anmelden
      </button>
    </div>
  );
}
