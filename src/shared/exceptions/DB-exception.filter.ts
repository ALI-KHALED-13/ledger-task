
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { MongooseError } from 'mongoose';

@Catch(MongoError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';

    // Handle duplicate key error
    if (exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      const duplicateField = this.extractDuplicateField(exception.message);
      message = `${duplicateField} already exists`;

    } else if (exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      const validationErrors = Object.values((exception as unknown as {errors: {message: string}[]}).errors).map(err => err.message);
      message = `Validation failed: ${validationErrors.join(', ')}`;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private extractDuplicateField(errorMessage: string): string {
    // Extract field name from error message
    const match = errorMessage.match(/dup key: { (\w+):/);
    if (match && match[1] === 'transactionId') {
      return 'Transaction ID';
    }
    return 'Record';
  }
}