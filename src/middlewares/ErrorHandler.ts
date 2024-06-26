import { Request, Response, NextFunction } from "express";

const ErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const errStatus = 500;
  const errMsg = "Something went wrong, please contact dev support!";

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
  });
};

export { ErrorHandler };
