import { z } from "zod";

export interface PaginationQuery {
  page: number;
  perPage: number;
}

export const paginationQueryShape = {
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
};

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const paginationQuerySchema = z
  .object(paginationQueryShape)
  .strict();

export function getPaginationParams(query: PaginationQuery) {
  return {
    skip: (query.page - 1) * query.perPage,
    take: query.perPage,
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  query: PaginationQuery
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / query.perPage);

  return {
    data,
    meta: {
      page: query.page,
      perPage: query.perPage,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
}
