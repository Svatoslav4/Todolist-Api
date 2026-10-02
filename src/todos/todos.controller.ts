import {Body,Controller,Delete,Get,HttpCode,Param,Patch,Post,UseGuards,} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import {CurrentUser,type CurrentUser as CurrentUserType,} from '../common/decorators/current-user.decorator.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateTodoDto,
  ) {
    return this.todosService.create(
      user.userId,d
      dto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.todosService.findAll(
      user.userId,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.todosService.findOne(
      user.userId,
      id,
    );
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todosService.update(
      user.userId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
  ) {
    return this.todosService.remove(
      user.userId,
      id,
    );
  }
}
