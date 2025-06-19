import { PaginatedResponse, PaginationParams } from '../types';

export const paginateData = <T>(
  data: T[],
  { page, limit }: PaginationParams
): PaginatedResponse<T> => {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      showingFrom: totalItems === 0 ? 0 : startIndex + 1,
      showingTo: endIndex,
    },
  };
};
