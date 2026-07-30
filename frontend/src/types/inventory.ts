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