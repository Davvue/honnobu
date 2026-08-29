import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const usernameExists = await this.usersRepository.exists({
      where: { username: createUserDto.username },
    });
    if (usernameExists) throw new ConflictException('username already exists');

    if (createUserDto.password !== createUserDto.passwordConfirm)
      throw new ConflictException('passwords do not match');

    const passwordHash = await argon2.hash(createUserDto.password, {
      secret: Buffer.from(this.configService.getOrThrow<string>('AUTH_SECRET')),
    });

    const user = this.usersRepository.create({
      username: createUserDto.username,
      displayName: createUserDto.displayName,
      passwordHash,
    });

    if (createUserDto.email != null) {
      const emailExists = await this.usersRepository.exists({
        where: { email: createUserDto.email },
      });
      if (emailExists) throw new ConflictException('email already exists');

      user.email = createUserDto.email;
    }
    await this.usersRepository.save(user);

    return this.findUserById(user.id);
  }

  public async findUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });
    if (user == null) throw new NotFoundException();

    return user;
  }

  public async findAuthUser(usernameOrEmail: string): Promise<User | null> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :usernameOrEmail', { usernameOrEmail })
      .orWhere('user.username = :usernameOrEmail', { usernameOrEmail })
      .getOne();
  }
}
