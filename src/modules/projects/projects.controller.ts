import { NextFunction, Request, Response } from "express";
import { PaginationQuery } from "../../shared/pagination";
import { projectsService } from "./projects.service";

export const projectsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await projectsService.create(userId, req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const pagination = req.validatedQuery as PaginationQuery;
      const result = await projectsService.findAll(userId, pagination);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await projectsService.findOne(Number(req.params.id), userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await projectsService.update(
        Number(req.params.id),
        userId,
        req.body
      );
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      await projectsService.remove(Number(req.params.id), userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
