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