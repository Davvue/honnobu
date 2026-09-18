import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  public create(_createBookDto: CreateBookDto) {
    return 'This action adds a new book';
  }

  public findAll() {
    return `This action returns all books`;
  }

  public findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  public update(id: number, _updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  public remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
