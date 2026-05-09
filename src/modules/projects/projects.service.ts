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

export interface CreateProjectDto {
  name: string;
  slug: string;
}

export interface ListProjectsQuery extends PaginationQuery {
  search?: string;
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

  async findAll(userId: string, query: ListProjectsQuery) {
    const where = {
      userId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { slug: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [total, projects] = await prisma.$transaction([
      prisma.project.count({
        where,
      }),
      prisma.project.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...getPaginationParams(query),
      }),
    ]);

    return paginate(projects, total, query);
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
