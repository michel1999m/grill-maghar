import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const expected = process.env.ADMIN_KEY || "dev-admin-key";
    const provided = req.headers["x-admin-key"];
    if (provided !== expected) {
      throw new UnauthorizedException("מפתח ניהול לא תקין");
    }
    return true;
  }
}
