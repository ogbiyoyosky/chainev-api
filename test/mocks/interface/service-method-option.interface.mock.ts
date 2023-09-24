import { Business } from '../../../src/components/business/entities/business.entity';
import { KeyType } from '../../../src/components/key/enums/key.enum';
import { User } from '../../../src/components/user/entities/user.entity';
import { RequestContext } from '../../../src/shared/enums/request-context.enum';
import { Pagination } from '../../../src/shared/interfaces/pagination.interface';
import { EntityManager } from 'typeorm';

export interface MockServiceMethodOptions {
  /** An instance of the User entity representing the user associated with the request */
  currentUser?: Partial<User>;
  /** An instance of the `query` field on the Express.Request object */
  query?: any;
  /** A pagination object */
  pagination?: Partial<Pagination>;
  /** TypeORM entity manager */
  entityManager?: EntityManager;
  /** The business associated with the current request */
  currentBusiness?: Partial<Business>;
  /** Request context. Either `TEST` or `LIVE` */
  currentContext?: RequestContext;
  /** The type of API the key used for authentication if a key was used. Either `secret` or `public` */
  currentKeyType?: KeyType;
}
