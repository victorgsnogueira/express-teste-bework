import { NextFunction, Request, Response } from "express";
import { parametersService } from "./parameters.service";

export const parametersController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await parametersService.create(userId, req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const result = await parametersService.findAll(userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = Number(req.params.id);
      const result = await parametersService.findOne(id, userId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = Number(req.params.id);
      const result = await parametersService.update(id, userId, req.body);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = Number(req.params.id);
      await parametersService.remove(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
