import { User } from '../../components/user/entities/user.entity';

export interface Request extends Express.Request {
  user: User;
}
