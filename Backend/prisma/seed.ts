import { PrismaClient, Role, CaseStatus, RiskLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('Demo123!', 12);
  await prisma.user.deleteMany(); await prisma.employee.deleteMany();
  await prisma.user.createMany({ data: [
    { email:'hrbp@sst.local', name:'Laura HRBP', role:Role.HRBP, passwordHash },
    { email:'medico@sst.local', name:'Dr. Andrés Médico', role:Role.MEDICAL, passwordHash },
    { email:'admin@sst.local', name:'Admin SST', role:Role.ADMIN_SST, passwordHash }
  ]});
  const employees = await Promise.all([
    prisma.employee.create({data:{code:'EMP-001',name:'Ana Torres',department:'Operaciones',position:'Supervisora',hireDate:new Date('2021-02-10')}}),
    prisma.employee.create({data:{code:'EMP-002',name:'Carlos Ruiz',department:'Tecnología',position:'Desarrollador',hireDate:new Date('2022-06-18')}}),
    prisma.employee.create({data:{code:'EMP-003',name:'María Gómez',department:'Operaciones',position:'Analista',hireDate:new Date('2020-09-01')}})
  ]);
  await prisma.absence.createMany({data:[{employeeId:employees[0].id,startDate:new Date('2026-07-01'),endDate:new Date('2026-07-03'),days:3,diagnosis:'Z76.3'},{employeeId:employees[0].id,startDate:new Date('2026-08-01'),endDate:new Date('2026-08-02'),days:2,diagnosis:'M54.5'},{employeeId:employees[0].id,startDate:new Date('2026-08-20'),endDate:new Date('2026-08-21'),days:2,diagnosis:'J06.9'},{employeeId:employees[1].id,startDate:new Date('2026-05-02'),endDate:new Date('2026-05-04'),days:3,diagnosis:'R51'}]});
  await prisma.symptomReport.createMany({data:[{employeeId:employees[0].id,reportedAt:new Date('2026-08-25'),symptoms:'Dolor lumbar recurrente',painLevel:8,hazardExposure:true},{employeeId:employees[2].id,reportedAt:new Date('2026-08-25'),symptoms:'Fatiga ocasional',painLevel:3,hazardExposure:false}]});
  await prisma.medicalCase.createMany({data:[{employeeId:employees[0].id,title:'Seguimiento ocupacional',status:CaseStatus.ACTIVE,risk:RiskLevel.HIGH,notes:'Revisión prioritaria y agendamiento médico.'},{employeeId:employees[1].id,title:'Control anual',status:CaseStatus.CLOSED,risk:RiskLevel.LOW,notes:'Caso cerrado sin novedades.'}]});
  await prisma.alert.create({data:{employeeId:employees[0].id,type:'REPETITIVE_ABSENCE',message:'Más de 2 incapacidades en los últimos 60 días. Sugerir revisión médica.',risk:RiskLevel.HIGH}});
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
