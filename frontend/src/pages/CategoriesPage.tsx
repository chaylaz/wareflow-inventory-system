import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Category } from "../types/inventory";

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const response = await api.get<Category[]>(
          "/api/categories"
        );

        if (isMounted) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setErrorMessage(
            "Gagal mengambil data kategori."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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

        <button className="primary-button" type="button">
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
    </section>
  );
}

export default CategoriesPage;