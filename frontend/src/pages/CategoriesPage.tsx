import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Modal from "../components/Modal";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import type { Category } from "../types/inventory";

import "../styles/tableActions.css";

type CategoryModalMode = "create" | "edit" | null;

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modalMode, setModalMode] =
    useState<CategoryModalMode>(null);

  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivatingCategoryId, setDeactivatingCategoryId] =
    useState<string | null>(null);

  const [formError, setFormError] = useState("");

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

  function sortCategories(categoryList: Category[]) {
    return [...categoryList].sort(
      (firstCategory, secondCategory) =>
        firstCategory.name.localeCompare(secondCategory.name)
    );
  }

  function openCreateModal() {
    setModalMode("create");
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setFormError("");
    setSuccessMessage("");
  }

  function openEditModal(category: Category) {
    setModalMode("edit");
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setFormError("");
    setSuccessMessage("");
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setEditingCategoryId(null);
    setFormError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedDescription = description.trim();

    if (!normalizedName) {
      setFormError("Nama kategori wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const requestBody = {
        name: normalizedName,
        description: normalizedDescription || null,
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

        setSuccessMessage(
          `Kategori "${response.data.name}" berhasil ditambahkan.`
        );
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

        setSuccessMessage(
          `Kategori "${response.data.name}" berhasil diperbarui.`
        );
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

  async function handleDeactivate(category: Category) {
    if (!category.isActive) {
      return;
    }

    const isConfirmed = window.confirm(
      `Nonaktifkan kategori "${category.name}"?`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeactivatingCategoryId(category.id);
      setSuccessMessage("");

      await api.delete(`/api/categories/${category.id}`);

      setCategories((currentCategories) =>
        currentCategories.map((currentCategory) =>
          currentCategory.id === category.id
            ? {
                ...currentCategory,
                isActive: false,
                updatedAtUtc: new Date().toISOString(),
              }
            : currentCategory
        )
      );

      setSuccessMessage(
        `Kategori "${category.name}" berhasil dinonaktifkan.`
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "Gagal menonaktifkan kategori."
        )
      );
    } finally {
      setDeactivatingCategoryId(null);
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

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Master data</p>

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

      {successMessage && (
        <div className="message-card message-success">
          {successMessage}
        </div>
      )}

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
                {categories.map((category) => {
                  const isDeactivating =
                    deactivatingCategoryId === category.id;

                  return (
                    <tr key={category.id}>
                      <td className="primary-cell">
                        {category.name}
                      </td>

                      <td>
                        {category.description ?? "-"}
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
                              openEditModal(category)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="action-button action-danger"
                            type="button"
                            disabled={
                              !category.isActive ||
                              isDeactivating
                            }
                            onClick={() =>
                              void handleDeactivate(category)
                            }
                          >
                            {isDeactivating
                              ? "Memproses..."
                              : category.isActive
                                ? "Nonaktifkan"
                                : "Nonaktif"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    </section>
  );
}

export default CategoriesPage;