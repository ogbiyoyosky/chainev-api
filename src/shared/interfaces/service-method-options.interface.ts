import { EntityManager } from 'typeorm';
import { User } from '../../components/user/entities/user.entity';
import { Pagination } from './pagination.interface';

export interface ServiceMethodOptions {
  /** An instance of the User entity representing the user associated with the request */
  currentUser?: User;
  /** An instance of the `query` field on the Express.Request object */
  query?: any;
  /** TypeORM entity manager */
  entityManager?: EntityManager;
  /** Pagination object */
  pagination?: Pagination;
}
