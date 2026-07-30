import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import CategoriesPage from "./pages/CategoriesPage";
import DashboardPage from "./pages/DashboardPage";
import WarehousesPage from "./pages/WarehousesPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Navigate to="/dashboard" replace />
          }
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/categories"
          element={<CategoriesPage />}
        />

        <Route
          path="/warehouses"
          element={<WarehousesPage />}
        />

        <Route
          path="*"
          element={
            <Navigate to="/dashboard" replace />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;