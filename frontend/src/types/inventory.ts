export type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  description: string | null;
  minimumStock: number;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type StockStatus =
  | "Available"
  | "LowStock"
  | "OutOfStock";

export type InventoryStock = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  unit: string;
  minimumStock: number;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  stockStatus: StockStatus;
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type StockTransactionType =
  | "StockIn"
  | "StockOut";

export type StockTransaction = {
  id: string;
  inventoryStockId: string;
  type: StockTransactionType;
  productId: string;
  productSku: string;
  productName: string;
  unit: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  balanceAfter: number;
  createdAtUtc: string;
};