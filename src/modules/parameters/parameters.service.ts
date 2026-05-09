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

  async findAll(userId: string, pagination: PaginationQuery) {
    const [total, parameters] = await prisma.$transaction([
      prisma.parameter.count({
        where: { userId },
      }),
      prisma.parameter.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        ...getPaginationParams(pagination),
      }),
    ]);

    return paginate(parameters, total, pagination);
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
