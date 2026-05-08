import { prisma } from "../../database/client";
import {
  ConflictError,
  NotFoundError,
} from "../../shared/errors/app-errors";

export interface CreateProjectDto {
  name: string;
  slug: string;
}

export const projectsService = {
  async create(userId: string, dto: CreateProjectDto) {
    const existing = await prisma.project.findFirst({
      where: { slug: dto.slug, userId },
    });

    if (existing) {
      throw new ConflictError("Slug already in use");
    }

    return prisma.project.create({
      data: { ...dto, userId },
    });
  },

  async findAll(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findOne(id: number, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: { links: true },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    return project;
  },

  async update(id: number, userId: string, dto: Partial<CreateProjectDto>) {
    await projectsService.findOne(id, userId);

    if (dto.slug) {
      const duplicate = await prisma.project.findFirst({
        where: { slug: dto.slug, userId, NOT: { id } },
      });

      if (duplicate) {
        throw new ConflictError("Slug already in use");
      }
    }

    return prisma.project.update({
      where: { id },
      data: dto,
    });
  },

  async remove(id: number, userId: string) {
    await projectsService.findOne(id, userId);
    await prisma.project.delete({ where: { id } });
  },
};
