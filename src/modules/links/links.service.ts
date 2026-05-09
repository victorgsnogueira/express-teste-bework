import { prisma } from "../../database/client";
import { NotFoundError } from "../../shared/errors/app-errors";
import {
  getPaginationParams,
  paginate,
  PaginationQuery,
} from "../../shared/pagination";

export interface CreateLinkDto {
  name: string;
  baseUrl: string;
  redirectUrl?: string | null;
  parameterIds?: number[];
}

async function assertLinkOwnership(linkId: number, userId: string) {
  const link = await prisma.link.findFirst({
    where: { id: linkId, project: { userId } },
  });

  if (!link) {
    throw new NotFoundError("Link not found");
  }

  return link;
}

async function assertProjectOwnership(projectId: number, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  return project;
}

async function assertParametersOwnership(parameterIds: number[], userId: string) {
  if (parameterIds.length === 0) {
    return;
  }

  const ownedParameters = await prisma.parameter.count({
    where: { id: { in: parameterIds }, userId },
  });

  if (ownedParameters !== new Set(parameterIds).size) {
    throw new NotFoundError("Parameter not found");
  }
}

function appendQueryString(baseUrl: string, queryString: string) {
  const hashIndex = baseUrl.indexOf("#");
  const urlWithoutHash =
    hashIndex === -1 ? baseUrl : baseUrl.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : baseUrl.slice(hashIndex);

  if (!urlWithoutHash.includes("?")) {
    return `${urlWithoutHash}?${queryString}${hash}`;
  }

  const separator =
    urlWithoutHash.endsWith("?") || urlWithoutHash.endsWith("&") ? "" : "&";

  return `${urlWithoutHash}${separator}${queryString}${hash}`;
}

export const linksService = {
  async create(projectId: number, userId: string, dto: CreateLinkDto) {
    await assertProjectOwnership(projectId, userId);

    const { parameterIds = [], ...linkData } = dto;
    await assertParametersOwnership(parameterIds, userId);

    return prisma.link.create({
      data: {
        ...linkData,
        projectId,
        parameters: {
          create: parameterIds.map((parameterId, index) => ({
            parameterId,
            order: index,
          })),
        },
      },
      include: {
        parameters: {
          include: { parameter: true },
          orderBy: { order: "asc" },
        },
      },
    });
  },

  async findAllByProject(
    projectId: number,
    userId: string,
    pagination: PaginationQuery
  ) {
    await assertProjectOwnership(projectId, userId);

    const [total, links] = await prisma.$transaction([
      prisma.link.count({
        where: { projectId },
      }),
      prisma.link.findMany({
        where: { projectId },
        include: {
          parameters: {
            include: { parameter: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        ...getPaginationParams(pagination),
      }),
    ]);

    return paginate(links, total, pagination);
  },

  async findOne(id: number, userId: string) {
    const link = await prisma.link.findFirst({
      where: { id, project: { userId } },
      include: {
        parameters: {
          include: { parameter: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!link) {
      throw new NotFoundError("Link not found");
    }

    return link;
  },

  async update(id: number, userId: string, dto: Partial<CreateLinkDto>) {
    await assertLinkOwnership(id, userId);

    const { parameterIds, ...linkData } = dto;

    if (parameterIds !== undefined) {
      await assertParametersOwnership(parameterIds, userId);
    }

    return prisma.$transaction(async (tx) => {
      if (parameterIds !== undefined) {
        await tx.linkParameter.deleteMany({ where: { linkId: id } });
        await tx.linkParameter.createMany({
          data: parameterIds.map((parameterId, index) => ({
            linkId: id,
            parameterId,
            order: index,
          })),
        });
      }

      return tx.link.update({
        where: { id },
        data: linkData,
        include: {
          parameters: {
            include: { parameter: true },
            orderBy: { order: "asc" },
          },
        },
      });
    });
  },

  async remove(id: number, userId: string) {
    await assertLinkOwnership(id, userId);
    await prisma.link.delete({ where: { id } });
  },

  async generate(id: number, userId: string) {
    const link = await linksService.findOne(id, userId);
    const params = new URLSearchParams();

    for (const linkParameter of link.parameters) {
      params.append(
        linkParameter.parameter.key,
        linkParameter.parameter.value
      );
    }

    if (link.redirectUrl) {
      params.append("redirect", link.redirectUrl);
    }

    const queryString = params.toString();
    return queryString
      ? appendQueryString(link.baseUrl, queryString)
      : link.baseUrl;
  },
};
