import { prisma } from "../../database/client";
import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-errors";
import {
  getPaginationParams,
  paginate,
  PaginationQuery,
} from "../../shared/pagination";

export interface CreateParameterDto {
  key: string;
  value: string;
}

export interface ListParametersQuery extends PaginationQuery {
  search?: string;
  key?: string;
  value?: string;
}

export const parametersService = {
  async create(userId: string, dto: CreateParameterDto) {
    const existing = await prisma.parameter.findFirst({
      where: { key: dto.key, value: dto.value, userId },
    });

    if (existing) {
      throw new ConflictError("Parameter already exists");
    }

    return prisma.parameter.create({
      data: { ...dto, userId },
    });
  },

  async findAll(userId: string, query: ListParametersQuery) {
    const where = {
      userId,
      ...(query.key ? { key: { contains: query.key } } : {}),
      ...(query.value ? { value: { contains: query.value } } : {}),
      ...(query.search
        ? {
            OR: [
              { key: { contains: query.search } },
              { value: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [total, parameters] = await prisma.$transaction([
      prisma.parameter.count({
        where,
      }),
      prisma.parameter.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...getPaginationParams(query),
      }),
    ]);

    return paginate(parameters, total, query);
  },

  async findOne(id: number, userId: string) {
    const parameter = await prisma.parameter.findFirst({
      where: { id, userId },
    });

    if (!parameter) {
      throw new NotFoundError("Parameter not found");
    }

    return parameter;
  },

  async update(
    id: number,
    userId: string,
    dto: Partial<CreateParameterDto>
  ) {
    const current = await parametersService.findOne(id, userId);

    if (dto.key !== undefined || dto.value !== undefined) {
      const newKey = dto.key ?? current.key;
      const newValue = dto.value ?? current.value;
      const duplicate = await prisma.parameter.findFirst({
        where: { key: newKey, value: newValue, userId, NOT: { id } },
      });

      if (duplicate) {
        throw new ConflictError("Parameter already exists");
      }
    }

    return prisma.parameter.update({
      where: { id },
      data: dto,
    });
  },

  async remove(id: number, userId: string) {
    await parametersService.findOne(id, userId);
    await prisma.parameter.delete({ where: { id } });
  },
};
