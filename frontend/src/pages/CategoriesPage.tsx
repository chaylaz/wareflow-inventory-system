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
import type { Category } from "../types/inventory";

import "../styles/dataToolbar.css";
import "../styles/tableActions.css";

type CategoryModalMode = "create" | "edit" | null;

type StatusFilter = "all" | "active" | "inactive";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [toast, setToast] =
    useState<ToastState>(null);

  const [modalMode, setModalMode] =
    useState<CategoryModalMode>(null);

  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null);

  const [
    categoryToDeactivate,
    setCategoryToDeactivate,
  ] = useState<Category | null>(null);

  const [
    deactivatingCategoryId,
    setDeactivatingCategoryId,
  ] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setErrorMessage("");

      const response = await api.get<Category[]>(
        "/api/categories"
      );

      setCategories(response.data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "Gagal mengambil data kategori."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        (category.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          category.isActive) ||
        (statusFilter === "inactive" &&
          !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const activeCategoryCount = useMemo(
    () =>
      categories.filter(
        (category) => category.isActive
      ).length,
    [categories]
  );

  function sortCategories(
    categoryList: Category[]
  ) {
    return [...categoryList].sort(
      (firstCategory, secondCategory) =>
        firstCategory.name.localeCompare(
          secondCategory.name
        )
    );
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
  }

  function openCreateModal() {
    setModalMode("create");
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setFormError("");
    setToast(null);
  }

  function openEditModal(category: Category) {
    setModalMode("edit");
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setFormError("");
    setToast(null);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setEditingCategoryId(null);
    setFormError("");
  }

  function closeConfirmDialog() {
    if (deactivatingCategoryId !== null) {
      return;
    }

    setCategoryToDeactivate(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedDescription =
      description.trim();

    if (!normalizedName) {
      setFormError(
        "Nama kategori wajib diisi."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const requestBody = {
        name: normalizedName,
        description:
          normalizedDescription || null,
      };

      if (modalMode === "create") {
        const response = await api.post<Category>(
          "/api/categories",
          requestBody
        );

        setCategories((currentCategories) =>
          sortCategories([
            ...currentCategories,
            response.data,
          ])
        );

        setToast({
          type: "success",
          message:
            `Kategori "${response.data.name}" berhasil ditambahkan.`,
        });
      }

      if (
        modalMode === "edit" &&
        editingCategoryId !== null
      ) {
        const response = await api.put<Category>(
          `/api/categories/${editingCategoryId}`,
          requestBody
        );

        setCategories((currentCategories) =>
          sortCategories(
            currentCategories.map((category) =>
              category.id === response.data.id
                ? response.data
                : category
            )
          )
        );

        setToast({
          type: "success",
          message:
            `Kategori "${response.data.name}" berhasil diperbarui.`,
        });
      }

      setModalMode(null);
      setEditingCategoryId(null);
      setName("");
      setDescription("");
    } catch (error) {
      console.error(error);

      setFormError(
        getApiErrorMessage(
          error,
          modalMode === "edit"
            ? "Gagal memperbarui kategori."
            : "Gagal menambahkan kategori."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDeactivate() {
    if (categoryToDeactivate === null) {
      return;
    }

    const category = categoryToDeactivate;

    try {
      setDeactivatingCategoryId(category.id);
      setErrorMessage("");

      await api.delete(
        `/api/categories/${category.id}`
      );

      setCategories((currentCategories) =>
        currentCategories.map(
          (currentCategory) =>
            currentCategory.id === category.id
              ? {
                  ...currentCategory,
                  isActive: false,
                  updatedAtUtc:
                    new Date().toISOString(),
                }
              : currentCategory
        )
      );

      setToast({
        type: "success",
        message:
          `Kategori "${category.name}" berhasil dinonaktifkan.`,
      });
    } catch (error) {
      console.error(error);

      setToast({
        type: "error",
        message: getApiErrorMessage(
          error,
          "Gagal menonaktifkan kategori."
        ),
      });
    } finally {
      setDeactivatingCategoryId(null);
      setCategoryToDeactivate(null);
    }
  }

  const modalTitle =
    modalMode === "edit"
      ? "Edit kategori"
      : "Tambah kategori";

  const submitButtonText =
    modalMode === "edit"
      ? "Simpan perubahan"
      : "Simpan kategori";

  const hasActiveFilter =
    searchQuery.trim().length > 0 ||
    statusFilter !== "all";

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">
            Master data
          </p>

          <h1>Categories</h1>

          <p>
            Kelola kategori yang digunakan untuk
            mengelompokkan barang.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openCreateModal}
        >
          Tambah kategori
        </button>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat data kategori...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        categories.length === 0 && (
          <div className="message-card">
            Belum ada kategori yang tersimpan.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        categories.length > 0 && (
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
                  placeholder="Cari nama atau deskripsi kategori..."
                  aria-label="Cari kategori"
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
                  aria-label="Filter status kategori"
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
                  {filteredCategories.length}
                </strong>{" "}
                dari{" "}
                <strong>{categories.length}</strong>{" "}
                kategori
              </span>

              <span>
                <strong>
                  {activeCategoryCount}
                </strong>{" "}
                kategori aktif
              </span>

              {hasActiveFilter && (
                <span className="filter-indicator">
                  Filter diterapkan
                </span>
              )}
            </div>

            {filteredCategories.length > 0 ? (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Nama kategori</th>
                      <th>Deskripsi</th>
                      <th>Status</th>

                      <th className="action-column-heading">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map(
                      (category) => (
                        <tr key={category.id}>
                          <td className="primary-cell">
                            {category.name}
                          </td>

                          <td>
                            {category.description ??
                              "-"}
                          </td>

                          <td>
                            <span
                              className={
                                category.isActive
                                  ? "status-badge status-active"
                                  : "status-badge status-inactive"
                              }
                            >
                              {category.isActive
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
                                    category
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="action-button action-danger"
                                type="button"
                                disabled={
                                  !category.isActive
                                }
                                onClick={() =>
                                  setCategoryToDeactivate(
                                    category
                                  )
                                }
                              >
                                {category.isActive
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
                    Kategori tidak ditemukan
                  </h3>

                  <p>
                    Tidak ada kategori yang sesuai
                    dengan kata kunci atau filter
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
            <label htmlFor="category-name">
              Nama kategori
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              maxLength={100}
              placeholder="Contoh: Furniture"
              autoFocus
              required
              onChange={(event) =>
                setName(event.target.value)
              }
            />

            <span className="character-counter">
              {name.length}/100
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="category-description">
              Deskripsi
            </label>

            <textarea
              id="category-description"
              value={description}
              maxLength={500}
              rows={4}
              placeholder="Tuliskan deskripsi kategori"
              onChange={(event) =>
                setDescription(event.target.value)
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
        isOpen={categoryToDeactivate !== null}
        title="Nonaktifkan kategori?"
        description={
          categoryToDeactivate
            ? `Kategori "${categoryToDeactivate.name}" tidak akan dapat digunakan sebagai kategori aktif. Data kategori tetap tersimpan.`
            : ""
        }
        confirmLabel="Nonaktifkan"
        isProcessing={
          deactivatingCategoryId !== null
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

export default CategoriesPage;