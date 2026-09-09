declare module "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        name: string;
        role: "HRBP" | "LEADER" | "MEDICAL" | "ADMIN_SST";
      };
    }
  }
}
