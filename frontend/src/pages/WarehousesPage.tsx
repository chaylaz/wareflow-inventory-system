import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Modal from "../components/Modal";
import { api } from "../lib/api";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import type { Warehouse } from "../types/inventory";

function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formError, setFormError] = useState("");

  const loadWarehouses = useCallback(async () => {
    try {
      setErrorMessage("");

      const response = await api.get<Warehouse[]>(
        "/api/warehouses"
      );

      setWarehouses(response.data);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "Gagal mengambil data gudang."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  function openCreateModal() {
    setCode("");
    setName("");
    setAddress("");
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

  async function handleCreateWarehouse(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();
    const normalizedName = name.trim();
    const normalizedAddress = address.trim();

    if (!normalizedCode) {
      setFormError("Kode gudang wajib diisi.");
      return;
    }

    if (!/^[A-Z0-9-]+$/.test(normalizedCode)) {
      setFormError(
        "Kode gudang hanya boleh berisi huruf, angka, dan tanda hubung."
      );
      return;
    }

    if (!normalizedName) {
      setFormError("Nama gudang wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");

      const response = await api.post<Warehouse>(
        "/api/warehouses",
        {
          code: normalizedCode,
          name: normalizedName,
          address: normalizedAddress || null,
        }
      );

      setWarehouses((currentWarehouses) =>
        [...currentWarehouses, response.data].sort(
          (firstWarehouse, secondWarehouse) =>
            firstWarehouse.code.localeCompare(
              secondWarehouse.code
            )
        )
      );

      setSuccessMessage(
        `Gudang "${response.data.name}" berhasil ditambahkan.`
      );

      setCode("");
      setName("");
      setAddress("");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);

      setFormError(
        getApiErrorMessage(
          error,
          "Gagal menambahkan gudang."
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

          <h1>Warehouses</h1>

          <p>
            Kelola lokasi gudang untuk penyimpanan barang.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openCreateModal}
        >
          Tambah gudang
        </button>
      </div>

      {successMessage && (
        <div className="message-card message-success">
          {successMessage}
        </div>
      )}

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

      <Modal
        isOpen={isCreateModalOpen}
        title="Tambah gudang"
        onClose={closeCreateModal}
      >
        <form
          className="data-form"
          onSubmit={handleCreateWarehouse}
        >
          <div className="form-field">
            <label htmlFor="warehouse-code">
              Kode gudang
            </label>

            <input
              id="warehouse-code"
              type="text"
              value={code}
              maxLength={20}
              placeholder="Contoh: WH-SBY-01"
              autoFocus
              required
              onChange={(event) =>
                setCode(event.target.value.toUpperCase())
              }
            />

            <span className="character-counter">
              {code.length}/20
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="warehouse-name">
              Nama gudang
            </label>

            <input
              id="warehouse-name"
              type="text"
              value={name}
              maxLength={100}
              placeholder="Contoh: Gudang Utama Surabaya"
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
            <label htmlFor="warehouse-address">
              Alamat
            </label>

            <textarea
              id="warehouse-address"
              value={address}
              maxLength={300}
              rows={4}
              placeholder="Tuliskan alamat gudang"
              onChange={(event) =>
                setAddress(event.target.value)
              }
            />

            <span className="character-counter">
              {address.length}/300
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
                : "Simpan gudang"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default WarehousesPage;