import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ZODErrorMessage } from "../utils/zodErrorHandler.util";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`Error in ${req.method} ${req.url}`, err.stack);
  if (err instanceof ZodError) {
    const errorMessage: any = ZODErrorMessage(err);
    res.status(500).send({ status: false, message:  errorMessage, data: null });
    return;
  }

  res.status(500).send({ status: false, message: 'Something went wrong, please try again!', data: null });
};

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).send({ status: false, message: 'Not found', data: null });
};

process
  .on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection:', reason);
  })
  .on('uncaughtException', (err: Error, origin: string) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });