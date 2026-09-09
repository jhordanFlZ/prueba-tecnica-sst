import { Injectable } from "@nestjs/common";
import { RiskLevel } from "@prisma/client";
import { PrismaService } from "../../core/database/prisma.service";

@Injectable()
export class AlertCorrelationService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateAll(): Promise<number> {
    try {
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - 60);
      const employees = await this.prisma.employee.findMany({
        select: { id: true },
      });
      let generated = 0;

      for (const employee of employees) {
        const [absenceCount, symptomGroups, medicalRequests] =
          await Promise.all([
            this.prisma.absence.count({
              where: { employeeId: employee.id, startDate: { gte: since } },
            }),
            this.prisma.symptomReport.groupBy({
              by: ["symptoms"],
              where: { employeeId: employee.id, reportedAt: { gte: since } },
              _count: { symptoms: true },
            }),
            this.prisma.symptomReport.count({
              where: {
                employeeId: employee.id,
                reportedAt: { gte: since },
                requiresMedical: true,
              },
            }),
          ]);

        const recurrentSymptoms =
          symptomGroups.some((group) => group._count.symptoms >= 2) ||
          medicalRequests >= 2;
        if (absenceCount <= 2 && !recurrentSymptoms) continue;

        const existingAlert = await this.prisma.alert.findFirst({
          where: {
            employeeId: employee.id,
            resolved: false,
            risk: RiskLevel.HIGH,
          },
        });
        if (!existingAlert) {
          await this.prisma.alert.create({
            data: {
              employeeId: employee.id,
              type: "CORRELATION_HIGH_RISK",
              message:
                "Riesgo alto detectado: incapacidades repetitivas o síntomas recurrentes en los últimos 60 días. Sugerir examen médico o revisión en calendario.",
              risk: RiskLevel.HIGH,
            },
          });
          generated++;
        }

        const activeCase = await this.prisma.medicalCase.findFirst({
          where: {
            employeeId: employee.id,
            status: "ACTIVE",
            risk: RiskLevel.HIGH,
          },
        });
        if (!activeCase) {
          await this.prisma.medicalCase.create({
            data: {
              employeeId: employee.id,
              title: "Seguimiento por correlación SST",
              status: "ACTIVE",
              risk: RiskLevel.HIGH,
              notes:
                "Agendamiento sugerido por el motor automático de alertas.",
            },
          });
        }
      }

      return generated;
    } catch (error) {
      console.error("ALERT CORRELATION ERROR", error);
      throw error;
    }
  }
}
