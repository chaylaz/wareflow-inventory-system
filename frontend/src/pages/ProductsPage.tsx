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

import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";

import type {
  Category,
  Product,
} from "../types/inventory";

import "../styles/dataToolbar.css";
import "../styles/tableActions.css";

type ProductModalMode = "create" | "edit" | null;

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

function ProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [activeCategories, setActiveCategories] =
    useState<Category[]>([]);

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

  const [modalMode, setModalMode] =
    useState<ProductModalMode>(null);

  const [editingProductId, setEditingProductId] =
    useState<string | null>(null);

  const [
    productToDeactivate,
    setProductToDeactivate,
  ] = useState<Product | null>(null);

  const [
    deactivatingProductId,
    setDeactivatingProductId,
  ] = useState<string | null>(null);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [unit, setUnit] = useState("");

  const [description, setDescription] =
    useState("");

  const [minimumStock, setMinimumStock] =
    useState("0");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadInitialData =
    useCallback(async () => {
      try {
        setErrorMessage("");

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          api.get<Product[]>("/api/products"),
          api.get<Category[]>("/api/categories"),
        ]);

        setProducts(productsResponse.data);

        setActiveCategories(
          categoriesResponse.data
            .filter(
              (category) => category.isActive
            )
            .sort(
              (
                firstCategory,
                secondCategory
              ) =>
                firstCategory.name.localeCompare(
                  secondCategory.name
                )
            )
        );
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
    void loadInitialData();
  }, [loadInitialData]);

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
  }, [
    products,
    searchQuery,
    statusFilter,
  ]);

  const activeProductCount = useMemo(
    () =>
      products.filter(
        (product) => product.isActive
      ).length,
    [products]
  );

  const editingProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.id === editingProductId
      ) ?? null,
    [products, editingProductId]
  );

  const editingCategoryIsInactive =
    modalMode === "edit" &&
    editingProduct !== null &&
    !activeCategories.some(
      (category) =>
        category.id === editingProduct.categoryId
    );

  function sortProducts(
    productList: Product[]
  ) {
    return [...productList].sort(
      (firstProduct, secondProduct) =>
        firstProduct.name.localeCompare(
          secondProduct.name
        )
    );
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
  }

  function resetForm() {
    setSku("");
    setName("");
    setCategoryId("");
    setUnit("");
    setDescription("");
    setMinimumStock("0");
    setFormError("");
  }

  function openCreateModal() {
    resetForm();

    setCategoryId(
      activeCategories[0]?.id ?? ""
    );

    setModalMode("create");
    setEditingProductId(null);
    setToast(null);
  }

  function openEditModal(product: Product) {
    const categoryIsActive =
      activeCategories.some(
        (category) =>
          category.id === product.categoryId
      );

    setSku(product.sku);
    setName(product.name);

    setCategoryId(
      categoryIsActive
        ? product.categoryId
        : ""
    );

    setUnit(product.unit);

    setDescription(
      product.description ?? ""
    );

    setMinimumStock(
      product.minimumStock.toString()
    );

    setFormError(
      categoryIsActive
        ? ""
        : `Kategori "${product.categoryName}" sudah tidak aktif. Pilih kategori aktif lain sebelum menyimpan perubahan.`
    );

    setEditingProductId(product.id);
    setModalMode("edit");
    setToast(null);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setEditingProductId(null);
    resetForm();
  }

  function closeConfirmDialog() {
    if (deactivatingProductId !== null) {
      return;
    }

    setProductToDeactivate(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedSku =
      sku.trim().toUpperCase();

    const normalizedName = name.trim();
    const normalizedUnit = unit.trim();

    const normalizedDescription =
      description.trim();

    const parsedMinimumStock =
      Number(minimumStock);

    if (!normalizedSku) {
      setFormError(
        "SKU produk wajib diisi."
      );
      return;
    }

    if (
      !/^[A-Z0-9-]+$/.test(
        normalizedSku
      )
    ) {
      setFormError(
        "SKU hanya boleh berisi huruf, angka, dan tanda hubung."
      );
      return;
    }

    if (!normalizedName) {
      setFormError(
        "Nama produk wajib diisi."
      );
      return;
    }

    if (!categoryId) {
      setFormError(
        "Kategori aktif wajib dipilih."
      );
      return;
    }

    if (!normalizedUnit) {
      setFormError(
        "Satuan produk wajib diisi."
      );
      return;
    }

    if (
      !Number.isInteger(parsedMinimumStock) ||
      parsedMinimumStock < 0
    ) {
      setFormError(
        "Minimum stok harus berupa bilangan bulat nol atau lebih."
      );
      return;
    }

    const requestBody = {
      sku: normalizedSku,
      name: normalizedName,
      categoryId,
      unit: normalizedUnit,
      description:
        normalizedDescription || null,
      minimumStock: parsedMinimumStock,
    };

    try {
      setIsSubmitting(true);
      setFormError("");

      if (modalMode === "create") {
        const response =
          await api.post<Product>(
            "/api/products",
            requestBody
          );

        setProducts((currentProducts) =>
          sortProducts([
            ...currentProducts,
            response.data,
          ])
        );

        setToast({
          type: "success",
          message:
            `Produk "${response.data.name}" berhasil ditambahkan.`,
        });
      }

      if (
        modalMode === "edit" &&
        editingProductId !== null
      ) {
        const response =
          await api.put<Product>(
            `/api/products/${editingProductId}`,
            requestBody
          );

        setProducts((currentProducts) =>
          sortProducts(
            currentProducts.map((product) =>
              product.id === response.data.id
                ? response.data
                : product
            )
          )
        );

        setToast({
          type: "success",
          message:
            `Produk "${response.data.name}" berhasil diperbarui.`,
        });
      }

      setModalMode(null);
      setEditingProductId(null);
      resetForm();
    } catch (error) {
      console.error(error);

      setFormError(
        getApiErrorMessage(
          error,
          modalMode === "edit"
            ? "Gagal memperbarui produk."
            : "Gagal menambahkan produk."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (productToDeactivate === null) {
      return;
    }

    const product = productToDeactivate;

    try {
      setDeactivatingProductId(product.id);
      setErrorMessage("");

      await api.delete(
        `/api/products/${product.id}`
      );

      setProducts((currentProducts) =>
        currentProducts.map(
          (currentProduct) =>
            currentProduct.id === product.id
              ? {
                  ...currentProduct,
                  isActive: false,
                  updatedAtUtc:
                    new Date().toISOString(),
                }
              : currentProduct
        )
      );

      setToast({
        type: "success",
        message:
          `Produk "${product.name}" berhasil dinonaktifkan.`,
      });
    } catch (error) {
      console.error(error);

      setToast({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Gagal menonaktifkan produk."
        ),
      });
    } finally {
      setDeactivatingProductId(null);
      setProductToDeactivate(null);
    }
  }

  const hasActiveFilter =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all";

  const modalTitle =
    modalMode === "edit"
      ? "Edit produk"
      : "Tambah produk";

  const submitButtonText =
    modalMode === "edit"
      ? "Simpan perubahan"
      : "Simpan produk";

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            Master inventory
          </p>

          <h1>Products</h1>

          <p>
            Kelola daftar produk, kategori,
            satuan, dan batas minimum stok.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          disabled={
            activeCategories.length === 0
          }
          title={
            activeCategories.length === 0
              ? "Tambahkan atau aktifkan kategori terlebih dahulu."
              : "Tambah produk baru"
          }
          onClick={openCreateModal}
        >
          Tambah produk
        </button>
      </div>

      {!isLoading &&
        activeCategories.length === 0 && (
          <div className="message-card message-warning">
            Belum ada kategori aktif. Aktifkan
            atau tambahkan kategori sebelum
            membuat produk.
          </div>
        )}

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
                <Search
                  size={18}
                  strokeWidth={2}
                />

                <input
                  type="search"
                  value={searchQuery}
                  placeholder="Cari SKU, nama, kategori, atau satuan..."
                  aria-label="Cari produk"
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
                  aria-label="Filter status produk"
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
                dari{" "}
                <strong>
                  {products.length}
                </strong>{" "}
                produk
              </span>

              <span>
                <strong>
                  {activeProductCount}
                </strong>{" "}
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
                    {filteredProducts.map(
                      (product) => (
                        <tr key={product.id}>
                          <td>
                            <span className="code-badge">
                              {product.sku}
                            </span>
                          </td>

                          <td className="primary-cell">
                            {product.name}
                          </td>

                          <td>
                            {product.categoryName}
                          </td>

                          <td>
                            {product.unit}
                          </td>

                          <td>
                            <span className="stock-minimum-badge">
                              {
                                product.minimumStock
                              }
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
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="action-button action-danger"
                                type="button"
                                disabled={
                                  !product.isActive
                                }
                                onClick={() =>
                                  setProductToDeactivate(
                                    product
                                  )
                                }
                              >
                                {product.isActive
                                  ? "Nonaktifkan"
                                  : "Nonaktif"}
                              </button>
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
                    Produk tidak ditemukan
                  </h3>

                  <p>
                    Tidak ada produk yang sesuai
                    dengan pencarian atau filter
                    yang dipilih.
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
        isOpen={modalMode !== null}
        title={modalTitle}
        onClose={closeModal}
      >
        <form
          className="data-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="product-sku">
              SKU produk
            </label>

            <input
              id="product-sku"
              type="text"
              value={sku}
              maxLength={50}
              placeholder="Contoh: KERTAS-A4-001"
              autoFocus
              required
              onChange={(event) =>
                setSku(
                  event.target.value.toUpperCase()
                )
              }
            />

            <span className="character-counter">
              {sku.length}/50
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="product-name">
              Nama produk
            </label>

            <input
              id="product-name"
              type="text"
              value={name}
              maxLength={150}
              placeholder="Contoh: Kertas HVS A4"
              required
              onChange={(event) =>
                setName(event.target.value)
              }
            />

            <span className="character-counter">
              {name.length}/150
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="product-category">
              Kategori
            </label>

            <select
              id="product-category"
              value={categoryId}
              required
              onChange={(event) => {
                setCategoryId(
                  event.target.value
                );

                setFormError("");
              }}
            >
              <option value="" disabled>
                Pilih kategori aktif
              </option>

              {activeCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

            <span className="form-help-text">
              {editingCategoryIsInactive
                ? `Kategori sebelumnya "${editingProduct?.categoryName}" sudah tidak aktif. Pilih kategori aktif lain.`
                : "Hanya kategori aktif yang dapat dipilih."}
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="product-unit">
              Satuan
            </label>

            <input
              id="product-unit"
              type="text"
              value={unit}
              maxLength={30}
              placeholder="Contoh: Pcs, Rim, Box"
              required
              onChange={(event) =>
                setUnit(event.target.value)
              }
            />

            <span className="character-counter">
              {unit.length}/30
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="minimum-stock">
              Minimum stok
            </label>

            <input
              id="minimum-stock"
              type="number"
              value={minimumStock}
              min={0}
              step={1}
              required
              onChange={(event) =>
                setMinimumStock(
                  event.target.value
                )
              }
            />

            <span className="form-help-text">
              Digunakan sebagai batas peringatan
              stok rendah.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="product-description">
              Deskripsi
            </label>

            <textarea
              id="product-description"
              value={description}
              maxLength={500}
              rows={4}
              placeholder="Tuliskan deskripsi produk"
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />

            <span className="character-counter">
              {description.length}/500
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
              onClick={closeModal}
            >
              Batal
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Menyimpan..."
                : submitButtonText}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={productToDeactivate !== null}
        title="Nonaktifkan produk?"
        description={
          productToDeactivate
            ? `Produk "${productToDeactivate.name}" akan berubah menjadi tidak aktif. Data produk tetap tersimpan di dalam sistem.`
            : ""
        }
        confirmLabel="Nonaktifkan"
        isProcessing={
          deactivatingProductId !== null
        }
        onCancel={closeConfirmDialog}
        onConfirm={() =>
          void handleConfirmDeactivate()
        }
      />

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

export default ProductsPage;