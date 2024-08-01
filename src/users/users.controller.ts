import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { ProfileDto } from './dto/profile.dto';
import { UpdateNameDto } from './dto/update-name.dto';

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
  async updateName(
    @AccessUser() user: JwtPayload,
    @Body() updateNameDto: UpdateNameDto,
  ): Promise<void> {
    return this.usersService.updateName(user.id, updateNameDto.name);
  }
}
