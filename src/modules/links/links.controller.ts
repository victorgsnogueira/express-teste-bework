import { NextFunction, Request, Response } from "express";
import { linksService } from "./links.service";

export const linksController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectId = Number(req.params.projectId);
      const result = await linksService.create(projectId, userId, req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async findAllByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const projectId = Number(req.params.projectId);
      const result = await linksService.findAllByProject(projectId, userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await linksService.findOne(Number(req.params.id), userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await linksService.update(
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
      await linksService.remove(Number(req.params.id), userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const url = await linksService.generate(Number(req.params.id), userId);
      return res.json({ url });
    } catch (error) {
      next(error);
    }
  },
};
