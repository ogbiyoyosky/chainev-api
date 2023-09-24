import {
  ValidationPipe as BaseValidationPipe,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

function formatNestedValidationError(error) {
  let errors = [];
  for (const child of error.children) {
    const obj = child['children'].map((c) => {
      return {
        field: `${error.property}.${child['property']}.${c.property}`,
        message: Object.values(c.constraints)[0],
      };
    });

    errors = errors.concat(obj);
  }

  return errors;
}

export default class ValidationPipe extends BaseValidationPipe {
  public async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (e) {
      if (e instanceof BadRequestException) {
        console.log(e.getResponse());
        const errorResponse = e.getResponse() as any;
        if (Array.isArray(errorResponse.message)) {
          errorResponse.errors = errorResponse.message;
          errorResponse.message = 'Invalid Data';
          delete errorResponse.error;
          throw new BadRequestException(errorResponse);
        }
      }
    }
  }
}
