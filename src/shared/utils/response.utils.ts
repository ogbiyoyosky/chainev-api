import ObjectLiteral from '../interfaces/object-literal.interface';

export const SuccessResponse = (message: string, data?: ObjectLiteral, meta?: ObjectLiteral) => {
  return {
    success: true,
    message,
    data,
    meta,
  };
};
