import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/sign-up.dto';
import { Tokens } from './types/token.type';
import { JwtPayload } from './types/jwt-payload';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async _generateToken(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '60m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '200 days',
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async deleteAll(): Promise<void> {
    await this.prisma.user.deleteMany();
  }

  async signIn(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preference: {
          include: {
            favouriteCampaignCategories: true,
          },
        },
        organization: true,
      },
    });
    const jwt = await this._generateToken(user.id, user.email);
    await this.updateUserRefreshToken(user.id, jwt.refreshToken);
    return { ...jwt, ...user };
  }

  // Auto sign user in if success
  // Return jwt token
  async signUp(signUpDto: SignUpDto) {
    const { id, email, fullName } = signUpDto;
    const formatFullName =
      fullName?.length === 0 ? email.split('@')[0] : fullName;
    const user = await this.prisma.user.create({
      data: {
        id: id,
        email: email,
        fullName: formatFullName,
        preference: {
          create: {
            favouriteCampaignCategories: {},
          },
        },
      },
    });

    const jwt = await this._generateToken(user.id, user.email);
    await this.updateUserRefreshToken(user.id, jwt.refreshToken);
    return jwt;
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const tokens = await this._generateToken(user.id, user.email);
    await this.updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateUserRefreshToken(userId: string, rt: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: rt,
      },
    });
  }
}
