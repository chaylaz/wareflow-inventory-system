import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleAlert,
  PackageCheck,
  Tags,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

import type {
  Category,
  InventoryStock,
  Product,
  StockTransaction,
  Warehouse,
} from "../types/inventory";

import "../styles/dashboardInventory.css";

type DashboardData = {
  categories: Category[];
  warehouses: Warehouse[];
  products: Product[];
  stocks: InventoryStock[];
  transactions: StockTransaction[];
};

const initialDashboardData: DashboardData = {
  categories: [],
  warehouses: [],
  products: [],
  stocks: [],
  transactions: [],
};

const dateFormatter = new Intl.DateTimeFormat(
  "id-ID",
  {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }
);

function formatTransactionDate(
  dateValue: string
) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${dateFormatter.format(date)} WIB`;
}

function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(
      initialDashboardData
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setErrorMessage("");

        const [
          categoriesResponse,
          warehousesResponse,
          productsResponse,
          stocksResponse,
          transactionsResponse,
        ] = await Promise.all([
          api.get<Category[]>(
            "/api/categories"
          ),

          api.get<Warehouse[]>(
            "/api/warehouses"
          ),

          api.get<Product[]>(
            "/api/products"
          ),

          api.get<InventoryStock[]>(
            "/api/stocks"
          ),

          api.get<StockTransaction[]>(
            "/api/stocks/history"
          ),
        ]);

        setDashboardData({
          categories:
            categoriesResponse.data,

          warehouses:
            warehousesResponse.data,

          products:
            productsResponse.data,

          stocks:
            stocksResponse.data,

          transactions:
            transactionsResponse.data,
        });
      } catch (error) {
        console.error(error);

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Gagal mengambil ringkasan dashboard."
          )
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeCategories = useMemo(
    () =>
      dashboardData.categories.filter(
        (category) => category.isActive
      ).length,
    [dashboardData.categories]
  );

  const activeWarehouses = useMemo(
    () =>
      dashboardData.warehouses.filter(
        (warehouse) =>
          warehouse.isActive
      ).length,
    [dashboardData.warehouses]
  );

  const activeProducts = useMemo(
    () =>
      dashboardData.products.filter(
        (product) => product.isActive
      ).length,
    [dashboardData.products]
  );

  const totalStockQuantity = useMemo(
    () =>
      dashboardData.stocks.reduce(
        (total, stock) =>
          total + stock.quantity,
        0
      ),
    [dashboardData.stocks]
  );

  const lowStockCount = useMemo(
    () =>
      dashboardData.stocks.filter(
        (stock) =>
          stock.stockStatus === "LowStock"
      ).length,
    [dashboardData.stocks]
  );

  const outOfStockCount = useMemo(
    () =>
      dashboardData.stocks.filter(
        (stock) =>
          stock.stockStatus ===
          "OutOfStock"
      ).length,
    [dashboardData.stocks]
  );

  const stockAlerts = useMemo(
    () =>
      dashboardData.stocks
        .filter(
          (stock) =>
            stock.stockStatus ===
              "LowStock" ||
            stock.stockStatus ===
              "OutOfStock"
        )
        .sort((firstStock, secondStock) => {
          if (
            firstStock.stockStatus ===
              "OutOfStock" &&
            secondStock.stockStatus !==
              "OutOfStock"
          ) {
            return -1;
          }

          if (
            firstStock.stockStatus !==
              "OutOfStock" &&
            secondStock.stockStatus ===
              "OutOfStock"
          ) {
            return 1;
          }

          return (
            firstStock.quantity -
            secondStock.quantity
          );
        })
        .slice(0, 5),
    [dashboardData.stocks]
  );

  const recentTransactions = useMemo(
    () =>
      [...dashboardData.transactions]
        .sort(
          (
            firstTransaction,
            secondTransaction
          ) =>
            new Date(
              secondTransaction.createdAtUtc
            ).getTime() -
            new Date(
              firstTransaction.createdAtUtc
            ).getTime()
        )
        .slice(0, 5),
    [dashboardData.transactions]
  );

  const activeMasterData =
    activeCategories +
    activeWarehouses +
    activeProducts;

  const summaryCards = [
    {
      label: "Produk aktif",
      value: activeProducts,
      description:
        "Produk yang dapat digunakan",
      icon: PackageCheck,
      tone: "blue",
    },
    {
      label: "Gudang aktif",
      value: activeWarehouses,
      description:
        "Lokasi penyimpanan aktif",
      icon: WarehouseIcon,
      tone: "purple",
    },
    {
      label: "Kategori aktif",
      value: activeCategories,
      description:
        "Kategori yang dapat dipilih",
      icon: Tags,
      tone: "green",
    },
    {
      label: "Total stok",
      value: totalStockQuantity,
      description:
        "Akumulasi kuantitas barang",
      icon: Boxes,
      tone: "blue",
    },
    {
      label: "Stok rendah",
      value: lowStockCount,
      description:
        "Mencapai batas minimum",
      icon: AlertTriangle,
      tone: "warning",
    },
    {
      label: "Stok habis",
      value: outOfStockCount,
      description:
        "Saldo stok bernilai nol",
      icon: CircleAlert,
      tone: "danger",
    },
  ];

  return (
    <section className="page-section">
      <div className="inventory-dashboard-hero">
        <div>
          <p className="page-eyebrow">
            Inventory overview
          </p>

          <h1>
            Selamat datang di WareFlow
          </h1>

          <p>
            Pantau kondisi stok, master data,
            dan aktivitas barang dalam satu
            dashboard inventory.
          </p>

          <button
            className="inventory-dashboard-refresh"
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              void loadDashboard();
            }}
          >
            {isLoading
              ? "Memuat data..."
              : "Perbarui dashboard"}
          </button>
        </div>

        <div className="inventory-dashboard-hero-stat">
          <span>Total stok aktual</span>

          <strong>
            {totalStockQuantity}
          </strong>

          <small>
            Dari {dashboardData.stocks.length}{" "}
            kombinasi produk dan gudang
          </small>
        </div>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat ringkasan dashboard...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && (
        <>
          <div className="inventory-dashboard-section-heading">
            <div>
              <h2>Ringkasan inventory</h2>

              <p>
                Kondisi terbaru berdasarkan data
                yang tersimpan.
              </p>
            </div>

            <span>
              {activeMasterData} master data aktif
            </span>
          </div>

          <div className="inventory-summary-grid">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className={`inventory-summary-card inventory-summary-${card.tone}`}
                >
                  <div className="inventory-summary-header">
                    <div className="inventory-summary-icon">
                      <Icon
                        size={21}
                        strokeWidth={2}
                      />
                    </div>

                    <span>Live</span>
                  </div>

                  <p>{card.label}</p>

                  <strong>{card.value}</strong>

                  <small>
                    {card.description}
                  </small>
                </article>
              );
            })}
          </div>

          <div className="inventory-dashboard-content-grid">
            <section className="inventory-dashboard-panel">
              <div className="inventory-dashboard-panel-heading">
                <div>
                  <h2>
                    Stok perlu perhatian
                  </h2>

                  <p>
                    Produk dengan kondisi rendah
                    atau habis.
                  </p>
                </div>

                <span>
                  {stockAlerts.length} data
                </span>
              </div>

              {stockAlerts.length === 0 ? (
                <div className="inventory-dashboard-empty">
                  <PackageCheck size={28} />

                  <strong>
                    Kondisi stok aman
                  </strong>

                  <p>
                    Tidak ada stok rendah atau
                    stok habis.
                  </p>
                </div>
              ) : (
                <div className="inventory-alert-list">
                  {stockAlerts.map((stock) => (
                    <article
                      key={stock.id}
                      className="inventory-alert-item"
                    >
                      <div className="inventory-alert-main">
                        <span className="code-badge">
                          {stock.productSku}
                        </span>

                        <strong>
                          {stock.productName}
                        </strong>

                        <small>
                          {stock.warehouseCode} —{" "}
                          {stock.warehouseName}
                        </small>
                      </div>

                      <div className="inventory-alert-value">
                        <strong>
                          {stock.quantity}{" "}
                          {stock.unit}
                        </strong>

                        <span>
                          Minimum{" "}
                          {stock.minimumStock}{" "}
                          {stock.unit}
                        </span>

                        <em
                          className={
                            stock.stockStatus ===
                            "OutOfStock"
                              ? "inventory-alert-status inventory-alert-out"
                              : "inventory-alert-status inventory-alert-low"
                          }
                        >
                          {stock.stockStatus ===
                          "OutOfStock"
                            ? "Stok habis"
                            : "Stok rendah"}
                        </em>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="inventory-dashboard-panel">
              <div className="inventory-dashboard-panel-heading">
                <div>
                  <h2>
                    Aktivitas terbaru
                  </h2>

                  <p>
                    Lima transaksi stok terbaru.
                  </p>
                </div>

                <span>
                  {
                    dashboardData.transactions
                      .length
                  }{" "}
                  transaksi
                </span>
              </div>

              {recentTransactions.length ===
              0 ? (
                <div className="inventory-dashboard-empty">
                  <Boxes size={28} />

                  <strong>
                    Belum ada aktivitas
                  </strong>

                  <p>
                    Transaksi Stock In dan Stock
                    Out akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="inventory-activity-list">
                  {recentTransactions.map(
                    (transaction) => {
                      const isStockIn =
                        transaction.type ===
                        "StockIn";

                      return (
                        <article
                          key={transaction.id}
                          className="inventory-activity-item"
                        >
                          <div
                            className={
                              isStockIn
                                ? "inventory-activity-icon inventory-activity-in"
                                : "inventory-activity-icon inventory-activity-out"
                            }
                          >
                            {isStockIn ? (
                              <ArrowDownToLine
                                size={17}
                              />
                            ) : (
                              <ArrowUpFromLine
                                size={17}
                              />
                            )}
                          </div>

                          <div className="inventory-activity-content">
                            <div className="inventory-activity-title">
                              <strong>
                                {
                                  transaction.productName
                                }
                              </strong>

                              <span
                                className={
                                  isStockIn
                                    ? "inventory-activity-quantity inventory-quantity-in"
                                    : "inventory-activity-quantity inventory-quantity-out"
                                }
                              >
                                {isStockIn
                                  ? "+"
                                  : "-"}
                                {
                                  transaction.quantity
                                }{" "}
                                {transaction.unit}
                              </span>
                            </div>

                            <p>
                              {
                                transaction.warehouseCode
                              }{" "}
                              —{" "}
                              {
                                transaction.warehouseName
                              }
                            </p>

                            <small>
                              {formatTransactionDate(
                                transaction.createdAtUtc
                              )}
                            </small>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;