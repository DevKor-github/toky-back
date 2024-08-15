import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { ProfileDto } from './dto/profile.dto';
import { UpdateNameDto } from './dto/update-name.dto';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '유저 프로필 및 포인트 조회' })
  @ApiOkResponse({
    description: '프로필 조회 성공 시',
    type: ProfileDto,
  })
  async getUserProfile(@AccessUser() user: JwtPayload): Promise<ProfileDto> {
    return await this.usersService.getUserProfile(user.id);
  }

  @Patch('/profile/name')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '유저 name 변경' })
  @ApiOkResponse({
    description: '이름 변경 성공 시 업데이트된 프로필 반환',
  })
  async updateName(
    @AccessUser() user: JwtPayload,
    @Body() updateNameDto: UpdateNameDto,
  ): Promise<ProfileDto> {
    return await this.usersService.updateName(user.id, updateNameDto.name);
  }
}
