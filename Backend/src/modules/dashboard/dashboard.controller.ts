import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CaseStatus, Role } from "@prisma/client";
import { AlertCorrelationService } from "../alerts/alert-correlation.service";
import { JwtGuard, Roles, RolesGuard } from "../auth/auth.guards";
import { PrismaService } from "../../core/database/prisma.service";

@Controller("dashboard")
@UseGuards(JwtGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly correlation: AlertCorrelationService,
  ) {}

  @Get("summary")
  @Roles(Role.HRBP, Role.LEADER, Role.MEDICAL, Role.ADMIN_SST)
  async summary(@Req() request: any) {
    try {
      await this.correlation.evaluateAll();
      const detailed = [Role.MEDICAL, Role.ADMIN_SST].includes(
        request.user.role,
      );
      const [employees, cases, alertCount, alerts, absences] =
        await Promise.all([
          this.prisma.employee.count(),
          this.prisma.medicalCase.groupBy({ by: ["status"], _count: true }),
          this.prisma.alert.count({ where: { resolved: false } }),
          detailed
            ? this.prisma.alert.findMany({
                where: { resolved: false },
                include: {
                  employee: {
                    select: { code: true, name: true, department: true },
                  },
                },
                orderBy: { createdAt: "desc" },
              })
            : Promise.resolve([]),
          this.prisma.absence.findMany({
            select: { days: true, employee: { select: { department: true } } },
          }),
        ]);

      const byDepartment = absences.reduce(
        (result, item) => {
          result[item.employee.department] =
            (result[item.employee.department] || 0) + item.days;
          return result;
        },
        {} as Record<string, number>,
      );

      return {
        employees,
        cases,
        alertCount,
        alerts,
        absenceByDepartment: byDepartment,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get("cases")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async cases() {
    try {
      return await this.prisma.medicalCase.findMany({
        include: {
          employee: {
            select: {
              code: true,
              name: true,
              department: true,
              position: true,
            },
          },
        },
        orderBy: { openedAt: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  @Get("clinical-records")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async clinicalRecords() {
    try {
      const employees = await this.prisma.employee.findMany({
        include: {
          absences: {
            select: {
              startDate: true,
              days: true,
              diagnosis: true,
              cie10: true,
              healthCategory: true,
              issuer: true,
            },
            orderBy: { startDate: "desc" },
          },
          symptoms: {
            select: {
              reportedAt: true,
              symptoms: true,
              hazard: true,
              painLevel: true,
              requiresMedical: true,
            },
            orderBy: { reportedAt: "desc" },
          },
          cases: {
            select: {
              title: true,
              status: true,
              risk: true,
              notes: true,
              openedAt: true,
            },
            orderBy: { openedAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
      });

      return employees.map((employee) => ({
        code: employee.code,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        absences: employee.absences,
        symptoms: employee.symptoms,
        cases: employee.cases,
      }));
    } catch (error) {
      throw error;
    }
  }

  @Get("employees")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async employees() {
    try {
      return await this.prisma.employee.findMany({
        select: {
          code: true,
          name: true,
          department: true,
          position: true,
          hireDate: true,
        },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      throw error;
    }
  }

  @Get("absences")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async absences() {
    try {
      return await this.prisma.absence.findMany({
        select: {
          recordCode: true,
          startDate: true,
          endDate: true,
          days: true,
          diagnosis: true,
          cie10: true,
          employee: { select: { code: true, name: true, department: true } },
        },
        orderBy: { startDate: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  @Get("surveys")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async surveys() {
    try {
      return await this.prisma.symptomReport.findMany({
        select: {
          responseCode: true,
          reportedAt: true,
          symptoms: true,
          hazard: true,
          painLevel: true,
          hazardExposure: true,
          requiresMedical: true,
          employee: { select: { code: true, name: true, department: true } },
        },
        orderBy: { reportedAt: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  @Get("alerts")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async alerts() {
    try {
      return await this.prisma.alert.findMany({
        where: { resolved: false },
        select: {
          id: true,
          type: true,
          message: true,
          risk: true,
          createdAt: true,
          employee: { select: { code: true, name: true, department: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw error;
    }
  }

  @Patch("cases/:id")
  @Roles(Role.MEDICAL, Role.ADMIN_SST)
  async update(@Param("id") id: string, @Body("status") status: CaseStatus) {
    try {
      return await this.prisma.medicalCase.update({
        where: { id },
        data: {
          status,
          closedAt: status === CaseStatus.CLOSED ? new Date() : null,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
