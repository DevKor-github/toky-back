import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessUser } from 'src/common/decorators/accessUser.decorator';
import { JwtPayload } from 'src/common/interfaces/auth.interface';
import { ProfileDto } from './dto/profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '유저 프로필 및 응모권 수 조회',
    description:
      '유저 프로필, 응모권 수, 친구 초대에 필요한 초대 코드를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공 시',
    type: ProfileDto,
  })
  async getUserProfile(@AccessUser() user: JwtPayload): Promise<ProfileDto> {
    return await this.usersService.getUserProfile(user.id);
  }

  @Patch('/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '유저 name 및 전화번호 변경',
    description: '유저 name, 전화번호를 받아 유저 프로필을 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공 시 업데이트된 프로필 반환',
  })
  async updateProfile(
    @AccessUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    return await this.usersService.updateProfile(user.id, updateProfileDto);
  }
}
