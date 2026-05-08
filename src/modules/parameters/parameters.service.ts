import { prisma } from "../../database/client";
import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-errors";

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

  async findAll(userId: string) {
    return prisma.parameter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
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
