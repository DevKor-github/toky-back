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
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  @Patch('/profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '유저 name 및 전화번호 변경' })
  @ApiOkResponse({
    description: '성공 시 업데이트된 프로필 반환',
  })
  async updateProfile(
    @AccessUser() user: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    return await this.usersService.updateProfile(user.id, updateProfileDto);
  }
}
