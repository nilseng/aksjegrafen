import { Request, Response } from "express";

export const asyncRouter = (callback: (req: Request, res: Response, next: () => void) => Promise<Response>) => {
  return (req: Request, res: Response, next: () => void) => callback(req, res, next).catch(next);
};
