import { Link, Outlet, useLocation } from "react-router-dom";

export default function App() {
  const loc = useLocation();
  const onHome = loc.pathname === "/";
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="mark">⚔</span> DnD Forge
        </Link>
        {!onHome && (
          <Link to="/" className="btn btn-ghost btn-sm">
            ← All Characters
          </Link>
        )}
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
