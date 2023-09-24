import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceMethodOptions } from '../../../shared/interfaces/service-method-options.interface';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { RootService } from '../../../shared/classes/root-service/root-service';
import { User } from '../entities/user.entity';
import { CreateUserInput } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService extends RootService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(userRepo);
  }

  async verify(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async checkDuplicateEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (user) {
      throw new BadRequestException('This email address is already taken');
    }
  }

  async create(
    input: CreateUserInput,
    options: ServiceMethodOptions,
  ): Promise<User> {
    await this.checkDuplicateEmail(input.email);
    const hashedPassword = await this.hashPassword(input.password);
    let user = this.constructEntityInstance(User, {
      ...input,
      password: hashedPassword,
    });
    return this.save(user, options);
  }

  async findById(id: string): Promise<User> {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({});
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT));
  }

  async comparePasswords(
    rawPassword: string,
    encryptedPassword: string,
  ): Promise<void> {
    const match = await bcrypt.compare(rawPassword, encryptedPassword);
    if (!match) {
      throw new BadRequestException('Current password is incorrect');
    }
  }
}
