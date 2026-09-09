export type UserRole = "HRBP" | "LEADER" | "MEDICAL" | "ADMIN_SST";

export interface SessionUser {
  name: string;
  role: UserRole;
}
