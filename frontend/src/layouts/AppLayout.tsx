import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    symbol: "D",
  },
  {
    path: "/categories",
    label: "Categories",
    symbol: "C",
  },
  {
    path: "/warehouses",
    label: "Warehouses",
    symbol: "W",
  },
];

function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">W</div>

          <div>
            <strong className="brand-name">WareFlow</strong>
            <span className="brand-description">
              Inventory System
            </span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <p className="navigation-label">Menu utama</p>

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "navigation-link navigation-link-active"
                  : "navigation-link"
              }
            >
              <span className="navigation-symbol">
                {item.symbol}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="environment-indicator" />
          Development
        </div>
      </aside>

      <div className="application-content">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">
              WareFlow Inventory
            </p>

            <p className="topbar-title">
              Inventory Management System
            </p>
          </div>

          <div className="user-avatar">A</div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;