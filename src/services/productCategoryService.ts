import { getApiUrl } from '../config';

export interface ProductCategory {
  _id: string;
  categoryName: string;
  sequenceNumber: number;
  status: 'active' | 'inactive';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryListData {
  categories: ProductCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductCategoryResponse {
  data: ProductCategoryListData;
}

export interface CreateProductCategoryRequest {
  categoryName: string;
  sequenceNumber: number;
  status: 'active' | 'inactive';
  createdBy: string;
}

const API_BASE_URL = getApiUrl('api');

export const getProductCategories = async (
  page: number = 1,
  limit: number = 10
): Promise<ProductCategoryResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/product-categories?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch product categories');
  }

  const data = await response.json();
  return data;
};

export const getActiveProductCategories = async (): Promise<
  ProductCategory[]
> => {
  const response = await fetch(`${API_BASE_URL}/product-categories/active`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch active product categories');
  }

  const data = await response.json();
  return data.data;
};

export const createProductCategory = async (
  request: CreateProductCategoryRequest
): Promise<ProductCategory> => {
  const response = await fetch(`${API_BASE_URL}/product-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to create product category');
  }

  const data = await response.json();
  return data;
};

export const updateProductCategory = async (
  id: string,
  request: CreateProductCategoryRequest
): Promise<ProductCategory> => {
  const response = await fetch(`${API_BASE_URL}/product-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to update product category');
  }

  const data = await response.json();
  return data;
};
