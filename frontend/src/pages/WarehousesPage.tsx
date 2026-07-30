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

import "../styles/tableActions.css";

type WarehouseModalMode = "create" | "edit" | null;

function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [modalMode, setModalMode] =
    useState<WarehouseModalMode>(null);

  const [editingWarehouseId, setEditingWarehouseId] =
    useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [
    deactivatingWarehouseId,
    setDeactivatingWarehouseId,
  ] = useState<string | null>(null);

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

  function sortWarehouses(warehouseList: Warehouse[]) {
    return [...warehouseList].sort(
      (firstWarehouse, secondWarehouse) =>
        firstWarehouse.code.localeCompare(
          secondWarehouse.code
        )
    );
  }

  function openCreateModal() {
    setModalMode("create");
    setEditingWarehouseId(null);

    setCode("");
    setName("");
    setAddress("");

    setFormError("");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function openEditModal(warehouse: Warehouse) {
    setModalMode("edit");
    setEditingWarehouseId(warehouse.id);

    setCode(warehouse.code);
    setName(warehouse.name);
    setAddress(warehouse.address ?? "");

    setFormError("");
    setSuccessMessage("");
    setErrorMessage("");
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setEditingWarehouseId(null);
    setFormError("");
  }

  async function handleSubmit(
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

      const requestBody = {
        code: normalizedCode,
        name: normalizedName,
        address: normalizedAddress || null,
      };

      if (modalMode === "create") {
        const response = await api.post<Warehouse>(
          "/api/warehouses",
          requestBody
        );

        setWarehouses((currentWarehouses) =>
          sortWarehouses([
            ...currentWarehouses,
            response.data,
          ])
        );

        setSuccessMessage(
          `Gudang "${response.data.name}" berhasil ditambahkan.`
        );
      }

      if (
        modalMode === "edit" &&
        editingWarehouseId !== null
      ) {
        const response = await api.put<Warehouse>(
          `/api/warehouses/${editingWarehouseId}`,
          requestBody
        );

        setWarehouses((currentWarehouses) =>
          sortWarehouses(
            currentWarehouses.map((warehouse) =>
              warehouse.id === response.data.id
                ? response.data
                : warehouse
            )
          )
        );

        setSuccessMessage(
          `Gudang "${response.data.name}" berhasil diperbarui.`
        );
      }

      setModalMode(null);
      setEditingWarehouseId(null);

      setCode("");
      setName("");
      setAddress("");
    } catch (error) {
      console.error(error);

      setFormError(
        getApiErrorMessage(
          error,
          modalMode === "edit"
            ? "Gagal memperbarui gudang."
            : "Gagal menambahkan gudang."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(
    warehouse: Warehouse
  ) {
    if (!warehouse.isActive) {
      return;
    }

    const isConfirmed = window.confirm(
      `Nonaktifkan gudang "${warehouse.name}"?`
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeactivatingWarehouseId(warehouse.id);
      setSuccessMessage("");
      setErrorMessage("");

      await api.delete(
        `/api/warehouses/${warehouse.id}`
      );

      setWarehouses((currentWarehouses) =>
        currentWarehouses.map((currentWarehouse) =>
          currentWarehouse.id === warehouse.id
            ? {
                ...currentWarehouse,
                isActive: false,
                updatedAtUtc: new Date().toISOString(),
              }
            : currentWarehouse
        )
      );

      setSuccessMessage(
        `Gudang "${warehouse.name}" berhasil dinonaktifkan.`
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        getApiErrorMessage(
          error,
          "Gagal menonaktifkan gudang."
        )
      );
    } finally {
      setDeactivatingWarehouseId(null);
    }
  }

  const modalTitle =
    modalMode === "edit"
      ? "Edit gudang"
      : "Tambah gudang";

  const submitButtonText =
    modalMode === "edit"
      ? "Simpan perubahan"
      : "Simpan gudang";

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
                  <th className="action-column-heading">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {warehouses.map((warehouse) => {
                  const isDeactivating =
                    deactivatingWarehouseId ===
                    warehouse.id;

                  return (
                    <tr key={warehouse.id}>
                      <td>
                        <span className="code-badge">
                          {warehouse.code}
                        </span>
                      </td>

                      <td className="primary-cell">
                        {warehouse.name}
                      </td>

                      <td>
                        {warehouse.address ?? "-"}
                      </td>

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

                      <td>
                        <div className="table-actions">
                          <button
                            className="action-button action-edit"
                            type="button"
                            onClick={() =>
                              openEditModal(warehouse)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="action-button action-danger"
                            type="button"
                            disabled={
                              !warehouse.isActive ||
                              isDeactivating
                            }
                            onClick={() =>
                              void handleDeactivate(
                                warehouse
                              )
                            }
                          >
                            {isDeactivating
                              ? "Memproses..."
                              : warehouse.isActive
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
                setCode(
                  event.target.value.toUpperCase()
                )
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

export default WarehousesPage;