import { getApiUrl } from '../config';

export interface Product {
  _id: string;
  productCategoryId: string;
  productCategoryName: string;
  channelIds: string[];
  channelNames: string[];
  productName: string;
  status: 'active' | 'inactive';
  webLink: string;
  applicationId: string;
  productDescription: string;
  reasonsToBuy: {
    reason1: string;
    reason2: string;
    reason3: string;
    reason4: string;
    reason5: string;
  };
  media: {
    videos: {
      _id: string;
      title: string;
      s3Links: string[];
      youtubeUrl?: string;
      isActive: boolean;
      uploadedAt: string;
    }[];
    images: {
      _id: string;
      title: string;
      s3Link: string;
      isActive: boolean;
      uploadedAt: string;
    }[];
  };
  files: {
    _id: string;
    categoryId: string;
    categoryName: string;
    fileType: string;
    language: string;
    brochureName: string;
    s3Link: string;
    uploadedAt: string;
  }[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  timestamp: string;
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: Product;
  timestamp: string;
}

export const getProducts = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ProductListResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
  });

  const response = await fetch(`${getApiUrl('api')}/products?${queryParams}`, {
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

export const getProductById = async (
  id: string
): Promise<ProductDetailResponse> => {
  const response = await fetch(`${getApiUrl('api')}/products/${id}`, {
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }

  return response.json();
};
