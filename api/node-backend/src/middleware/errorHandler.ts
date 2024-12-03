import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    // Send proper error response
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
}; 