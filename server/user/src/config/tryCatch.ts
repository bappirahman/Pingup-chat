import type { NextFunction, Request, RequestHandler, Response } from "express";

const tryCatch = (handler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        res.status(500).json({
          message: error.message,
          error,
        });
      } else {
        console.error(error);
        res.status(500).json({
          message: "An unknown error occurred.",
          error,
        });
      }
    }
  };
};

export default tryCatch;
