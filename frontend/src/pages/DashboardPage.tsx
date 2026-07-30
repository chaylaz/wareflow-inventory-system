import {
  CheckCircle2,
  PackageCheck,
  Tags,
  Warehouse,
} from "lucide-react";

import { useEffect, useState } from "react";

import { api } from "../lib/api";

import type {
  Category,
  Warehouse as WarehouseType,
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
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [
          categoriesResponse,
          warehousesResponse,
        ] = await Promise.all([
          api.get<Category[]>("/api/categories"),

          api.get<WarehouseType[]>(
            "/api/warehouses"
          ),
        ]);

        if (!isMounted) {
          return;
        }

        const categories =
          categoriesResponse.data;

        const warehouses =
          warehousesResponse.data;

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

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = [
    {
      label: "Total kategori",
      value: summary.totalCategories,
      description: "Seluruh kategori barang",
      icon: Tags,
      tone: "blue",
    },
    {
      label: "Kategori aktif",
      value: summary.activeCategories,
      description: "Kategori yang dapat digunakan",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Total gudang",
      value: summary.totalWarehouses,
      description: "Seluruh lokasi gudang",
      icon: Warehouse,
      tone: "purple",
    },
    {
      label: "Gudang aktif",
      value: summary.activeWarehouses,
      description: "Gudang yang sedang digunakan",
      icon: PackageCheck,
      tone: "orange",
    },
  ];

  const totalActiveData =
    summary.activeCategories +
    summary.activeWarehouses;

  return (
    <section className="page-section">
      <div className="dashboard-hero">
        <div>
          <p className="page-eyebrow">
            Inventory overview
          </p>

          <h1>Selamat datang di WareFlow</h1>

          <p>
            Pantau kategori dan lokasi gudang dalam
            satu sistem yang terintegrasi.
          </p>
        </div>

        <div className="dashboard-hero-stat">
          <span>Data aktif</span>

          <strong>{totalActiveData}</strong>

          <small>
            Kategori dan gudang aktif
          </small>
        </div>
      </div>

      <div className="dashboard-section-heading">
        <div>
          <h2>Ringkasan sistem</h2>

          <p>
            Informasi terbaru berdasarkan data
            yang tersimpan.
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
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className={`summary-card summary-card-${card.tone}`}
              >
                <div className="summary-card-header">
                  <div className="summary-icon">
                    <Icon
                      size={21}
                      strokeWidth={2}
                    />
                  </div>

                  <span className="summary-status">
                    Live
                  </span>
                </div>

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
            );
          })}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;