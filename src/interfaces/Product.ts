export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string; 
}

export interface ProductItem extends Product {
  PK: string;
  SK: "PRODUCT";
  entityType: "PRODUCT"
}

export interface CreateProductInput {
  name: string;
  price: number;
  description?: string
}

export type UpdateProductInput = Partial<
Pick<Product, 'name' | 'price'| 'description'>>