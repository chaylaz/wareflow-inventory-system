import {
  Activity,
  Boxes,
  LayoutDashboard,
  Package,
  Tags,
  Warehouse,
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    path: "/warehouses",
    label: "Warehouses",
    icon: Warehouse,
  },
  {
    path: "/products",
    label: "Products",
    icon: Package,
  },
];

function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Boxes size={23} strokeWidth={2.2} />
          </div>

          <div>
            <strong className="brand-name">
              WareFlow
            </strong>

            <span className="brand-description">
              Inventory System
            </span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <p className="navigation-label">
            Menu utama
          </p>

          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
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
                  <Icon size={17} strokeWidth={2} />
                </span>

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="environment-indicator" />

          <div>
            <strong>Development</strong>
            <span>Local environment</span>
          </div>
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

          <div className="topbar-actions">
            <div className="api-status">
              <Activity size={15} />
              <span>API terhubung</span>
            </div>

            <div
              className="user-avatar"
              title="Administrator"
            >
              A
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;