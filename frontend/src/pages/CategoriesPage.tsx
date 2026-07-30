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

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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

  function openCreateModal() {
    setName("");
    setDescription("");
    setFormError("");
    setSuccessMessage("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (isSubmitting) {
      return;
    }

    setIsCreateModalOpen(false);
    setFormError("");
  }

  async function handleCreateCategory(
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

      const response = await api.post<Category>(
        "/api/categories",
        {
          name: normalizedName,
          description: normalizedDescription || null,
        }
      );

      setCategories((currentCategories) =>
        [...currentCategories, response.data].sort(
          (firstCategory, secondCategory) =>
            firstCategory.name.localeCompare(
              secondCategory.name
            )
        )
      );

      setSuccessMessage(
        `Kategori "${response.data.name}" berhasil ditambahkan.`
      );

      setName("");
      setDescription("");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);

      setFormError(
        getApiErrorMessage(
          error,
          "Gagal menambahkan kategori."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Modal
        isOpen={isCreateModalOpen}
        title="Tambah kategori"
        onClose={closeCreateModal}
      >
        <form
          className="data-form"
          onSubmit={handleCreateCategory}
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
              onClick={closeCreateModal}
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
                : "Simpan kategori"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default CategoriesPage;