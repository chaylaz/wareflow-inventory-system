import {
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

import type {
  InventoryStock,
  Product,
  StockStatus,
  Warehouse,
} from "../types/inventory";

import "../styles/dataToolbar.css";
import "../styles/stocks.css";
import "../styles/tableActions.css";

type TransactionMode = "in" | "out" | null;

type StatusFilter =
  | "all"
  | "available"
  | "low"
  | "out";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

function sortStocks(
  stockList: InventoryStock[]
) {
  return [...stockList].sort(
    (firstStock, secondStock) => {
      const productComparison =
        firstStock.productName.localeCompare(
          secondStock.productName
        );

      if (productComparison !== 0) {
        return productComparison;
      }

      return firstStock.warehouseName.localeCompare(
        secondStock.warehouseName
      );
    }
  );
}

function getStatusLabel(
  status: StockStatus
) {
  switch (status) {
    case "Available":
      return "Tersedia";

    case "LowStock":
      return "Stok rendah";

    case "OutOfStock":
      return "Stok habis";
  }
}

function getStatusClass(
  status: StockStatus
) {
  switch (status) {
    case "Available":
      return "stock-status-available";

    case "LowStock":
      return "stock-status-low";

    case "OutOfStock":
      return "stock-status-out";
  }
}

function StocksPage() {
  const [stocks, setStocks] =
    useState<InventoryStock[]>([]);

  const [activeProducts, setActiveProducts] =
    useState<Product[]>([]);

  const [
    activeWarehouses,
    setActiveWarehouses,
  ] = useState<Warehouse[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [toast, setToast] =
    useState<ToastState>(null);

  const [
    transactionMode,
    setTransactionMode,
  ] = useState<TransactionMode>(null);

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [
    selectedWarehouseId,
    setSelectedWarehouseId,
  ] = useState("");

  const [
    selectedStockId,
    setSelectedStockId,
  ] = useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [formError, setFormError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadInitialData =
    useCallback(async () => {
      try {
        setErrorMessage("");

        const [
          stocksResponse,
          productsResponse,
          warehousesResponse,
        ] = await Promise.all([
          api.get<InventoryStock[]>(
            "/api/stocks"
          ),

          api.get<Product[]>(
            "/api/products"
          ),

          api.get<Warehouse[]>(
            "/api/warehouses"
          ),
        ]);

        setStocks(
          sortStocks(stocksResponse.data)
        );

        setActiveProducts(
          productsResponse.data
            .filter(
              (product) => product.isActive
            )
            .sort(
              (
                firstProduct,
                secondProduct
              ) =>
                firstProduct.name.localeCompare(
                  secondProduct.name
                )
            )
        );

        setActiveWarehouses(
          warehousesResponse.data
            .filter(
              (warehouse) =>
                warehouse.isActive
            )
            .sort(
              (
                firstWarehouse,
                secondWarehouse
              ) =>
                firstWarehouse.name.localeCompare(
                  secondWarehouse.name
                )
            )
        );
      } catch (error) {
        console.error(error);

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Gagal mengambil data stok."
          )
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const activeProductIds = useMemo(
    () =>
      new Set(
        activeProducts.map(
          (product) => product.id
        )
      ),
    [activeProducts]
  );

  const activeWarehouseIds = useMemo(
    () =>
      new Set(
        activeWarehouses.map(
          (warehouse) => warehouse.id
        )
      ),
    [activeWarehouses]
  );

  const stockOutOptions = useMemo(
    () =>
      stocks.filter(
        (stock) =>
          stock.quantity > 0 &&
          activeProductIds.has(
            stock.productId
          ) &&
          activeWarehouseIds.has(
            stock.warehouseId
          )
      ),
    [
      stocks,
      activeProductIds,
      activeWarehouseIds,
    ]
  );

  const selectedStock = useMemo(
    () =>
      stocks.find(
        (stock) =>
          stock.id === selectedStockId
      ) ?? null,
    [stocks, selectedStockId]
  );

  const filteredStocks = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return stocks.filter((stock) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        stock.productSku
          .toLowerCase()
          .includes(normalizedSearch) ||
        stock.productName
          .toLowerCase()
          .includes(normalizedSearch) ||
        stock.warehouseCode
          .toLowerCase()
          .includes(normalizedSearch) ||
        stock.warehouseName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" &&
          stock.stockStatus ===
            "Available") ||
        (statusFilter === "low" &&
          stock.stockStatus ===
            "LowStock") ||
        (statusFilter === "out" &&
          stock.stockStatus ===
            "OutOfStock");

      return matchesSearch && matchesStatus;
    });
  }, [
    stocks,
    searchQuery,
    statusFilter,
  ]);

  const totalQuantity = useMemo(
    () =>
      stocks.reduce(
        (total, stock) =>
          total + stock.quantity,
        0
      ),
    [stocks]
  );

  const availableCount = useMemo(
    () =>
      stocks.filter(
        (stock) =>
          stock.stockStatus === "Available"
      ).length,
    [stocks]
  );

  const lowStockCount = useMemo(
    () =>
      stocks.filter(
        (stock) =>
          stock.stockStatus === "LowStock"
      ).length,
    [stocks]
  );

  const outOfStockCount = useMemo(
    () =>
      stocks.filter(
        (stock) =>
          stock.stockStatus ===
          "OutOfStock"
      ).length,
    [stocks]
  );

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
  }

  function resetTransactionForm() {
    setSelectedProductId("");
    setSelectedWarehouseId("");
    setSelectedStockId("");
    setQuantity("1");
    setFormError("");
  }

  function openStockInModal() {
    resetTransactionForm();

    setSelectedProductId(
      activeProducts[0]?.id ?? ""
    );

    setSelectedWarehouseId(
      activeWarehouses[0]?.id ?? ""
    );

    setTransactionMode("in");
    setToast(null);
  }

  function openStockOutModal() {
    resetTransactionForm();

    setSelectedStockId(
      stockOutOptions[0]?.id ?? ""
    );

    setTransactionMode("out");
    setToast(null);
  }

  function closeTransactionModal() {
    if (isSubmitting) {
      return;
    }

    setTransactionMode(null);
    resetTransactionForm();
  }

  function upsertStock(
    updatedStock: InventoryStock
  ) {
    setStocks((currentStocks) => {
      const stockExists =
        currentStocks.some(
          (stock) =>
            stock.id === updatedStock.id
        );

      if (!stockExists) {
        return sortStocks([
          ...currentStocks,
          updatedStock,
        ]);
      }

      return sortStocks(
        currentStocks.map((stock) =>
          stock.id === updatedStock.id
            ? updatedStock
            : stock
        )
      );
    });
  }

  async function handleTransaction(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      setFormError(
        "Jumlah transaksi harus berupa bilangan bulat lebih dari nol."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      if (transactionMode === "in") {
        if (!selectedProductId) {
          setFormError(
            "Produk aktif wajib dipilih."
          );
          return;
        }

        if (!selectedWarehouseId) {
          setFormError(
            "Gudang aktif wajib dipilih."
          );
          return;
        }

        const response =
          await api.post<InventoryStock>(
            "/api/stocks/in",
            {
              productId:
                selectedProductId,

              warehouseId:
                selectedWarehouseId,

              quantity: parsedQuantity,
            }
          );

        upsertStock(response.data);

        setToast({
          type: "success",
          message:
            `Stock In berhasil. Stok ${response.data.productName} sekarang ${response.data.quantity} ${response.data.unit}.`,
        });
      }

      if (transactionMode === "out") {
        if (!selectedStock) {
          setFormError(
            "Saldo stok wajib dipilih."
          );
          return;
        }

        const response =
          await api.post<InventoryStock>(
            "/api/stocks/out",
            {
              productId:
                selectedStock.productId,

              warehouseId:
                selectedStock.warehouseId,

              quantity: parsedQuantity,
            }
          );

        upsertStock(response.data);

        setToast({
          type: "success",
          message:
            `Stock Out berhasil. Stok ${response.data.productName} sekarang ${response.data.quantity} ${response.data.unit}.`,
        });
      }

      setTransactionMode(null);
      resetTransactionForm();
    } catch (error) {
      console.error(error);

      setFormError(
        getApiErrorMessage(
          error,
          transactionMode === "out"
            ? "Gagal mengurangi stok."
            : "Gagal menambahkan stok."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasActiveFilter =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all";

  const stockInUnavailable =
    activeProducts.length === 0 ||
    activeWarehouses.length === 0;

  const stockOutUnavailable =
    stockOutOptions.length === 0;

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            Inventory operation
          </p>

          <h1>Stocks</h1>

          <p>
            Pantau saldo stok produk pada
            setiap gudang dan catat transaksi
            Stock In atau Stock Out.
          </p>
        </div>

        <div className="stock-page-actions">
          <button
            className="secondary-button stock-out-button"
            type="button"
            disabled={stockOutUnavailable}
            title={
              stockOutUnavailable
                ? "Tidak ada stok aktif yang dapat dikeluarkan."
                : "Kurangi stok barang"
            }
            onClick={openStockOutModal}
          >
            Stock Out
          </button>

          <button
            className="primary-button"
            type="button"
            disabled={stockInUnavailable}
            title={
              stockInUnavailable
                ? "Produk dan gudang aktif diperlukan."
                : "Tambahkan stok barang"
            }
            onClick={openStockInModal}
          >
            Stock In
          </button>
        </div>
      </div>

      {!isLoading &&
        stockInUnavailable && (
          <div className="message-card message-warning">
            Stock In membutuhkan minimal satu
            produk aktif dan satu gudang aktif.
          </div>
        )}

      <div className="stock-overview-grid">
        <article className="stock-overview-card">
          <span>Total saldo</span>
          <strong>{stocks.length}</strong>
          <small>
            Kombinasi produk dan gudang
          </small>
        </article>

        <article className="stock-overview-card">
          <span>Total kuantitas</span>
          <strong>{totalQuantity}</strong>
          <small>
            Akumulasi seluruh barang
          </small>
        </article>

        <article className="stock-overview-card stock-overview-warning">
          <span>Stok rendah</span>
          <strong>{lowStockCount}</strong>
          <small>
            Mencapai batas minimum
          </small>
        </article>

        <article className="stock-overview-card stock-overview-danger">
          <span>Stok habis</span>
          <strong>{outOfStockCount}</strong>
          <small>
            Saldo bernilai nol
          </small>
        </article>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat data stok...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        stocks.length === 0 && (
          <div className="message-card">
            Belum ada saldo stok. Gunakan
            tombol Stock In untuk mencatat stok
            awal.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        stocks.length > 0 && (
          <div className="data-panel">
            <div className="data-toolbar">
              <div className="search-field">
                <Search
                  size={18}
                  strokeWidth={2}
                />

                <input
                  type="search"
                  value={searchQuery}
                  placeholder="Cari SKU, produk, atau gudang..."
                  aria-label="Cari saldo stok"
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                />

                {searchQuery && (
                  <button
                    className="clear-search-button"
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() =>
                      setSearchQuery("")
                    }
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="filter-control">
                <SlidersHorizontal
                  size={17}
                  strokeWidth={2}
                />

                <select
                  value={statusFilter}
                  aria-label="Filter status stok"
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value as StatusFilter
                    )
                  }
                >
                  <option value="all">
                    Semua status
                  </option>

                  <option value="available">
                    Tersedia
                  </option>

                  <option value="low">
                    Stok rendah
                  </option>

                  <option value="out">
                    Stok habis
                  </option>
                </select>
              </div>
            </div>

            <div className="data-summary">
              <span>
                Menampilkan{" "}
                <strong>
                  {filteredStocks.length}
                </strong>{" "}
                dari{" "}
                <strong>{stocks.length}</strong>{" "}
                saldo stok
              </span>

              <span>
                <strong>
                  {availableCount}
                </strong>{" "}
                stok tersedia
              </span>

              {hasActiveFilter && (
                <span className="filter-indicator">
                  Filter diterapkan
                </span>
              )}
            </div>

            {filteredStocks.length > 0 ? (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Gudang</th>
                      <th>Stok aktual</th>
                      <th>Minimum stok</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStocks.map(
                      (stock) => (
                        <tr key={stock.id}>
                          <td>
                            <div className="stock-reference-cell">
                              <span className="code-badge">
                                {stock.productSku}
                              </span>

                              <strong>
                                {stock.productName}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <div className="stock-reference-cell">
                              <span className="warehouse-code">
                                {
                                  stock.warehouseCode
                                }
                              </span>

                              <span>
                                {
                                  stock.warehouseName
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="stock-quantity-cell">
                              <strong>
                                {stock.quantity}
                              </strong>

                              <span>
                                {stock.unit}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="stock-minimum-badge">
                              {
                                stock.minimumStock
                              }{" "}
                              {stock.unit}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`stock-status-pill ${getStatusClass(
                                stock.stockStatus
                              )}`}
                            >
                              {getStatusLabel(
                                stock.stockStatus
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-filter-state">
                <div className="empty-filter-content">
                  <div className="empty-filter-icon">
                    <SearchX size={25} />
                  </div>

                  <h3>
                    Saldo stok tidak ditemukan
                  </h3>

                  <p>
                    Tidak ada data yang sesuai
                    dengan pencarian atau filter.
                  </p>

                  <button
                    className="reset-filter-button"
                    type="button"
                    onClick={resetFilters}
                  >
                    Reset pencarian
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      <Modal
        isOpen={transactionMode !== null}
        title={
          transactionMode === "out"
            ? "Catat Stock Out"
            : "Catat Stock In"
        }
        onClose={closeTransactionModal}
      >
        <form
          className="data-form"
          onSubmit={handleTransaction}
        >
          {transactionMode === "in" && (
            <>
              <div className="form-field">
                <label htmlFor="stock-product">
                  Produk
                </label>

                <select
                  id="stock-product"
                  value={selectedProductId}
                  required
                  onChange={(event) =>
                    setSelectedProductId(
                      event.target.value
                    )
                  }
                >
                  <option value="" disabled>
                    Pilih produk aktif
                  </option>

                  {activeProducts.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.sku} —{" "}
                        {product.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="stock-warehouse">
                  Gudang
                </label>

                <select
                  id="stock-warehouse"
                  value={
                    selectedWarehouseId
                  }
                  required
                  onChange={(event) =>
                    setSelectedWarehouseId(
                      event.target.value
                    )
                  }
                >
                  <option value="" disabled>
                    Pilih gudang aktif
                  </option>

                  {activeWarehouses.map(
                    (warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.code} —{" "}
                        {warehouse.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </>
          )}

          {transactionMode === "out" && (
            <div className="form-field">
              <label htmlFor="stock-balance">
                Saldo stok
              </label>

              <select
                id="stock-balance"
                value={selectedStockId}
                required
                onChange={(event) =>
                  setSelectedStockId(
                    event.target.value
                  )
                }
              >
                <option value="" disabled>
                  Pilih produk dan gudang
                </option>

                {stockOutOptions.map(
                  (stock) => (
                    <option
                      key={stock.id}
                      value={stock.id}
                    >
                      {stock.productSku} —{" "}
                      {stock.productName} |{" "}
                      {stock.warehouseCode} —{" "}
                      {stock.warehouseName}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {transactionMode === "out" &&
            selectedStock && (
              <div className="stock-balance-preview">
                <span>Stok tersedia</span>

                <strong>
                  {selectedStock.quantity}{" "}
                  {selectedStock.unit}
                </strong>

                <small>
                  Minimum stok:{" "}
                  {
                    selectedStock.minimumStock
                  }{" "}
                  {selectedStock.unit}
                </small>
              </div>
            )}

          <div className="form-field">
            <label htmlFor="transaction-quantity">
              Jumlah
            </label>

            <input
              id="transaction-quantity"
              type="number"
              value={quantity}
              min={1}
              step={1}
              required
              autoFocus={
                transactionMode === "out"
              }
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
            />

            <span className="form-help-text">
              {transactionMode === "out"
                ? "Jumlah tidak boleh melebihi stok tersedia."
                : "Jumlah akan ditambahkan ke saldo stok saat ini."}
            </span>
          </div>

          {formError && (
            <div className="form-error">
              {formError}
            </div>
          )}

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={isSubmitting}
              onClick={
                closeTransactionModal
              }
            >
              Batal
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Memproses..."
                : transactionMode === "out"
                  ? "Simpan Stock Out"
                  : "Simpan Stock In"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={closeToast}
        />
      )}
    </section>
  );
}

export default StocksPage;