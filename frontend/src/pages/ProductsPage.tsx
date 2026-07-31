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
} from "react";

import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import type { Product } from "../types/inventory";

import "../styles/dataToolbar.css";
import "../styles/tableActions.css";

type StatusFilter = "all" | "active" | "inactive";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const loadProducts = useCallback(async () => {
    try {
      setErrorMessage("");

      const response = await api.get<Product[]>(
        "/api/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "Gagal mengambil data produk."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.sku
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.categoryName
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.unit
          .toLowerCase()
          .includes(normalizedSearch) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          product.isActive) ||
        (statusFilter === "inactive" &&
          !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const activeProductCount = useMemo(
    () =>
      products.filter((product) => product.isActive)
        .length,
    [products]
  );

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
  }

  const hasActiveFilter =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all";

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            Master inventory
          </p>

          <h1>Products</h1>

          <p>
            Kelola daftar produk, kategori, satuan, dan
            batas minimum stok.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
        >
          Tambah produk
        </button>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat data produk...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        products.length === 0 && (
          <div className="message-card">
            Belum ada produk yang tersimpan.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        products.length > 0 && (
          <div className="data-panel">
            <div className="data-toolbar">
              <div className="search-field">
                <Search size={18} strokeWidth={2} />

                <input
                  type="search"
                  value={searchQuery}
                  placeholder="Cari SKU, nama, kategori, atau satuan..."
                  aria-label="Cari produk"
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                />

                {searchQuery && (
                  <button
                    className="clear-search-button"
                    type="button"
                    aria-label="Hapus pencarian"
                    onClick={() => setSearchQuery("")}
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
                  aria-label="Filter status produk"
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as StatusFilter
                    )
                  }
                >
                  <option value="all">
                    Semua status
                  </option>

                  <option value="active">
                    Aktif
                  </option>

                  <option value="inactive">
                    Tidak aktif
                  </option>
                </select>
              </div>
            </div>

            <div className="data-summary">
              <span>
                Menampilkan{" "}
                <strong>
                  {filteredProducts.length}
                </strong>{" "}
                dari <strong>{products.length}</strong>{" "}
                produk
              </span>

              <span>
                <strong>{activeProductCount}</strong>{" "}
                produk aktif
              </span>

              {hasActiveFilter && (
                <span className="filter-indicator">
                  Filter diterapkan
                </span>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Nama produk</th>
                      <th>Kategori</th>
                      <th>Satuan</th>
                      <th>Minimum stok</th>
                      <th>Status</th>
                      <th className="action-column-heading">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <span className="code-badge">
                            {product.sku}
                          </span>
                        </td>

                        <td className="primary-cell">
                          {product.name}
                        </td>

                        <td>{product.categoryName}</td>

                        <td>{product.unit}</td>

                        <td>
                          <span className="stock-minimum-badge">
                            {product.minimumStock}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              product.isActive
                                ? "status-badge status-active"
                                : "status-badge status-inactive"
                            }
                          >
                            {product.isActive
                              ? "Aktif"
                              : "Tidak aktif"}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="action-button action-edit"
                              type="button"
                            >
                              Edit
                            </button>

                            <button
                              className="action-button action-danger"
                              type="button"
                              disabled={!product.isActive}
                            >
                              {product.isActive
                                ? "Nonaktifkan"
                                : "Nonaktif"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-filter-state">
                <div className="empty-filter-content">
                  <div className="empty-filter-icon">
                    <SearchX size={25} />
                  </div>

                  <h3>Produk tidak ditemukan</h3>

                  <p>
                    Tidak ada produk yang sesuai dengan
                    pencarian atau filter yang dipilih.
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

export default ProductsPage;