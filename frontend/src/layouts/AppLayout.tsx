import {
  Activity,
  Archive,
  Boxes,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Tags,
  UserRound,
  Warehouse,
} from "lucide-react";

import { useState } from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

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
  {
    path: "/stocks",
    label: "Stocks",
    icon: Archive,
  },
  {
    path: "/stock-history",
    label: "Stock History",
    icon: History,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: UserRound,
  },
];

function AppLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const userInitial =
    user?.fullName
      .trim()
      .charAt(0)
      .toUpperCase() || "A";

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Failed to log out:",
        error
      );

      navigate("/login", {
        replace: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Boxes
              size={23}
              strokeWidth={2.2}
            />
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
                  <Icon
                    size={17}
                    strokeWidth={2}
                  />
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

            <div className="current-user">
              <div
                className="user-avatar"
                title={user?.fullName}
              >
                {userInitial}
              </div>

              <div className="current-user-details">
                <strong>
                  {user?.fullName ??
                    "Administrator"}
                </strong>

                <span>
                  {user?.role ??
                    "Administrator"}
                </span>
              </div>
            </div>

            <button
              className="logout-button"
              type="button"
              disabled={isLoggingOut}
              onClick={() =>
                void handleLogout()
              }
            >
              <LogOut
                size={16}
                strokeWidth={2}
              />

              <span>
                {isLoggingOut
                  ? "Keluar..."
                  : "Logout"}
              </span>
            </button>
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