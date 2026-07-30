import { useEffect, useState } from "react";
import { api } from "./lib/api";
import "./App.css";

type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get<Category[]>(
          "/api/categories"
        );

        setCategories(response.data);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Gagal mengambil data kategori dari backend."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">WareFlow Inventory</p>
          <h1>Category Management</h1>
          <p className="subtitle">
            Data kategori yang diambil dari ASP.NET Core API.
          </p>
        </div>
      </header>

      {isLoading && (
        <div className="message">Memuat data kategori...</div>
      )}

      {errorMessage && (
        <div className="message error-message">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && categories.length === 0 && (
        <div className="message">
          Belum ada kategori yang tersimpan.
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        categories.length > 0 && (
          <div className="table-wrapper">
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
                    <td className="category-name">
                      {category.name}
                    </td>

                    <td>{category.description ?? "-"}</td>

                    <td>
                      <span
                        className={
                          category.isActive
                            ? "status status-active"
                            : "status status-inactive"
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
    </main>
  );
}

export default App;