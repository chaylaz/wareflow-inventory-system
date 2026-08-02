import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import CategoriesPage from "./pages/CategoriesPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import StockHistoryPage from "./pages/StockHistoryPage";
import StocksPage from "./pages/StocksPage";
import WarehousesPage from "./pages/WarehousesPage";

import "./App.css";
import "./styles/feedback.css";
import "./styles/uiRefinement.css";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
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
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/stocks"
          element={<StocksPage />}
        />

        <Route
          path="/stock-history"
          element={<StockHistoryPage />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default App;