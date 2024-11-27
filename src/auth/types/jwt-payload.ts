export type JwtPayload = {
  sub: string;
  email: string;
};

export type JwtPayloadWithRT = JwtPayload & { refreshToken: string };
