import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  CallHandler,
} from '@nestjs/common';
import { Observable } from  'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log(
            `XPERIA_API::: ip: ${
              req.ip
            } time: ${new Date().toLocaleString()} method: ${method} url: ${url} Duration: ${
              Date.now() - now
            }ms`,
            context.getClass.name,
          ),
        ),
      );
  }
}
