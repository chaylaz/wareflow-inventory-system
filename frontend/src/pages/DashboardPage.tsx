import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type {
  Category,
  Warehouse,
} from "../types/inventory";

type DashboardSummary = {
  totalCategories: number;
  activeCategories: number;
  totalWarehouses: number;
  activeWarehouses: number;
};

const initialSummary: DashboardSummary = {
  totalCategories: 0,
  activeCategories: 0,
  totalWarehouses: 0,
  activeWarehouses: 0,
};

function DashboardPage() {
  const [summary, setSummary] =
    useState<DashboardSummary>(initialSummary);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [
          categoriesResponse,
          warehousesResponse,
        ] = await Promise.all([
          api.get<Category[]>("/api/categories"),
          api.get<Warehouse[]>("/api/warehouses"),
        ]);

        if (!isMounted) {
          return;
        }

        const categories = categoriesResponse.data;
        const warehouses = warehousesResponse.data;

        setSummary({
          totalCategories: categories.length,
          activeCategories: categories.filter(
            (category) => category.isActive
          ).length,
          totalWarehouses: warehouses.length,
          activeWarehouses: warehouses.filter(
            (warehouse) => warehouse.isActive
          ).length,
        });
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setErrorMessage(
            "Gagal mengambil ringkasan data dari backend."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = [
    {
      label: "Total kategori",
      value: summary.totalCategories,
      description: "Seluruh kategori barang",
    },
    {
      label: "Kategori aktif",
      value: summary.activeCategories,
      description: "Kategori yang dapat digunakan",
    },
    {
      label: "Total gudang",
      value: summary.totalWarehouses,
      description: "Seluruh lokasi gudang",
    },
    {
      label: "Gudang aktif",
      value: summary.activeWarehouses,
      description: "Gudang yang sedang digunakan",
    },
  ];

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p>
            Ringkasan data utama WareFlow Inventory.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat ringkasan data...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && (
        <div className="summary-grid">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="summary-card"
            >
              <p className="summary-label">
                {card.label}
              </p>

              <strong className="summary-value">
                {card.value}
              </strong>

              <p className="summary-description">
                {card.description}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;