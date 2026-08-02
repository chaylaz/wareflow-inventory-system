import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
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
} from "react";

import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

import type {
  StockTransaction,
  StockTransactionType,
} from "../types/inventory";

import "../styles/dataToolbar.css";
import "../styles/stockHistory.css";

type TransactionFilter =
  | "all"
  | "StockIn"
  | "StockOut";

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

function getTransactionLabel(
  type: StockTransactionType
) {
  return type === "StockIn"
    ? "Stock In"
    : "Stock Out";
}

function getTransactionClass(
  type: StockTransactionType
) {
  return type === "StockIn"
    ? "transaction-type-in"
    : "transaction-type-out";
}

function StockHistoryPage() {
  const [
    transactions,
    setTransactions,
  ] = useState<StockTransaction[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    transactionFilter,
    setTransactionFilter,
  ] = useState<TransactionFilter>("all");

  const loadTransactions =
    useCallback(async () => {
      try {
        setErrorMessage("");

        const response =
          await api.get<StockTransaction[]>(
            "/api/stocks/history"
          );

        setTransactions(response.data);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          getApiErrorMessage(
            error,
            "Gagal mengambil riwayat transaksi stok."
          )
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions =
    useMemo(() => {
      const normalizedSearch =
        searchQuery.trim().toLowerCase();

      return transactions.filter(
        (transaction) => {
          const matchesSearch =
            normalizedSearch.length === 0 ||
            transaction.productSku
              .toLowerCase()
              .includes(normalizedSearch) ||
            transaction.productName
              .toLowerCase()
              .includes(normalizedSearch) ||
            transaction.warehouseCode
              .toLowerCase()
              .includes(normalizedSearch) ||
            transaction.warehouseName
              .toLowerCase()
              .includes(normalizedSearch);

          const matchesType =
            transactionFilter === "all" ||
            transaction.type ===
              transactionFilter;

          return matchesSearch && matchesType;
        }
      );
    }, [
      transactions,
      searchQuery,
      transactionFilter,
    ]);

  const stockInTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.type === "StockIn"
      ),
    [transactions]
  );

  const stockOutTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.type === "StockOut"
      ),
    [transactions]
  );

  const totalStockInQuantity = useMemo(
    () =>
      stockInTransactions.reduce(
        (total, transaction) =>
          total + transaction.quantity,
        0
      ),
    [stockInTransactions]
  );

  const totalStockOutQuantity = useMemo(
    () =>
      stockOutTransactions.reduce(
        (total, transaction) =>
          total + transaction.quantity,
        0
      ),
    [stockOutTransactions]
  );

  const hasActiveFilter =
    searchQuery.trim().length > 0 ||
    transactionFilter !== "all";

  function resetFilters() {
    setSearchQuery("");
    setTransactionFilter("all");
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            Inventory audit trail
          </p>

          <h1>Stock History</h1>

          <p>
            Pantau seluruh aktivitas Stock In
            dan Stock Out beserta saldo setelah
            setiap transaksi.
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          disabled={isLoading}
          onClick={() => {
            setIsLoading(true);
            void loadTransactions();
          }}
        >
          Muat ulang
        </button>
      </div>

      <div className="history-overview-grid">
        <article className="history-overview-card">
          <div className="history-overview-icon">
            <History
              size={21}
              strokeWidth={2}
            />
          </div>

          <div>
            <span>Total transaksi</span>
            <strong>
              {transactions.length}
            </strong>
            <small>
              Seluruh aktivitas stok
            </small>
          </div>
        </article>

        <article className="history-overview-card history-overview-in">
          <div className="history-overview-icon">
            <ArrowDownToLine
              size={21}
              strokeWidth={2}
            />
          </div>

          <div>
            <span>Transaksi masuk</span>
            <strong>
              {stockInTransactions.length}
            </strong>
            <small>
              {totalStockInQuantity} unit barang
              masuk
            </small>
          </div>
        </article>

        <article className="history-overview-card history-overview-out">
          <div className="history-overview-icon">
            <ArrowUpFromLine
              size={21}
              strokeWidth={2}
            />
          </div>

          <div>
            <span>Transaksi keluar</span>
            <strong>
              {stockOutTransactions.length}
            </strong>
            <small>
              {totalStockOutQuantity} unit barang
              keluar
            </small>
          </div>
        </article>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat riwayat transaksi stok...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        transactions.length === 0 && (
          <div className="message-card">
            Belum ada riwayat transaksi. Lakukan
            Stock In atau Stock Out terlebih
            dahulu.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        transactions.length > 0 && (
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
                  aria-label="Cari riwayat transaksi"
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
                  value={transactionFilter}
                  aria-label="Filter jenis transaksi"
                  onChange={(event) =>
                    setTransactionFilter(
                      event.target
                        .value as TransactionFilter
                    )
                  }
                >
                  <option value="all">
                    Semua transaksi
                  </option>

                  <option value="StockIn">
                    Stock In
                  </option>

                  <option value="StockOut">
                    Stock Out
                  </option>
                </select>
              </div>
            </div>

            <div className="data-summary">
              <span>
                Menampilkan{" "}
                <strong>
                  {
                    filteredTransactions.length
                  }
                </strong>{" "}
                dari{" "}
                <strong>
                  {transactions.length}
                </strong>{" "}
                transaksi
              </span>

              <span>
                Diurutkan dari transaksi terbaru
              </span>

              {hasActiveFilter && (
                <span className="filter-indicator">
                  Filter diterapkan
                </span>
              )}
            </div>

            {filteredTransactions.length >
            0 ? (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>Jenis</th>
                      <th>Produk</th>
                      <th>Gudang</th>
                      <th>Jumlah</th>
                      <th>Saldo setelah</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map(
                      (transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <span className="transaction-date">
                              {formatTransactionDate(
                                transaction.createdAtUtc
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`transaction-type-badge ${getTransactionClass(
                                transaction.type
                              )}`}
                            >
                              {transaction.type ===
                              "StockIn" ? (
                                <ArrowDownToLine
                                  size={14}
                                />
                              ) : (
                                <ArrowUpFromLine
                                  size={14}
                                />
                              )}

                              {getTransactionLabel(
                                transaction.type
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="history-reference-cell">
                              <span className="code-badge">
                                {
                                  transaction.productSku
                                }
                              </span>

                              <strong>
                                {
                                  transaction.productName
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            <div className="history-reference-cell">
                              <span className="warehouse-code">
                                {
                                  transaction.warehouseCode
                                }
                              </span>

                              <span>
                                {
                                  transaction.warehouseName
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                transaction.type ===
                                "StockIn"
                                  ? "transaction-quantity transaction-quantity-in"
                                  : "transaction-quantity transaction-quantity-out"
                              }
                            >
                              {transaction.type ===
                              "StockIn"
                                ? "+"
                                : "-"}
                              {transaction.quantity}{" "}
                              {transaction.unit}
                            </span>
                          </td>

                          <td>
                            <div className="balance-after-cell">
                              <strong>
                                {
                                  transaction.balanceAfter
                                }
                              </strong>

                              <span>
                                {transaction.unit}
                              </span>
                            </div>
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
                    Riwayat tidak ditemukan
                  </h3>

                  <p>
                    Tidak ada transaksi yang
                    sesuai dengan pencarian atau
                    filter yang dipilih.
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
    </section>
  );
}

export default StockHistoryPage;