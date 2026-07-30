import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Warehouse } from "../types/inventory";

function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadWarehouses() {
      try {
        const response = await api.get<Warehouse[]>(
          "/api/warehouses"
        );

        if (isMounted) {
          setWarehouses(response.data);
        }
      } catch (error) {
        console.error(error);

        if (isMounted) {
          setErrorMessage(
            "Gagal mengambil data gudang."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWarehouses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Master data</p>
          <h1>Warehouses</h1>
          <p>
            Kelola lokasi gudang untuk penyimpanan barang.
          </p>
        </div>

        <button className="primary-button" type="button">
          Tambah gudang
        </button>
      </div>

      {isLoading && (
        <div className="message-card">
          Memuat data gudang...
        </div>
      )}

      {errorMessage && (
        <div className="message-card message-error">
          {errorMessage}
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        warehouses.length === 0 && (
          <div className="message-card">
            Belum ada gudang yang tersimpan.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        warehouses.length > 0 && (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama gudang</th>
                  <th>Alamat</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td>
                      <span className="code-badge">
                        {warehouse.code}
                      </span>
                    </td>

                    <td className="primary-cell">
                      {warehouse.name}
                    </td>

                    <td>{warehouse.address ?? "-"}</td>

                    <td>
                      <span
                        className={
                          warehouse.isActive
                            ? "status-badge status-active"
                            : "status-badge status-inactive"
                        }
                      >
                        {warehouse.isActive
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

export default WarehousesPage;