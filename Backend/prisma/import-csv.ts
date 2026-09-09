import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const csvDir = process.env.CSV_DIR || 'D:/Users/Jordan/Downloads';
const read = (file: string) => fs.readFileSync(path.join(csvDir, file), 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/);
const rows = (file: string) => { const lines = read(file); const headers = lines.shift()!.split(','); return lines.filter(Boolean).map(line => Object.fromEntries(line.split(',').map((value, i) => [headers[i], value.trim()]))); };
const employeeCode = (value: string) => `EMP-${(value || '').toUpperCase().replace(/[^0-9]/g, '').padStart(3, '0')}`;
const date = (value: string) => { const v = value.trim(); let parts: string[]; if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(v)) { parts = v.split(/[-/]/); } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(v) || /^\d{2}\/\d{2}\/\d{4}$/.test(v)) { const [d, m, y] = v.split(/[-/]/); parts = [y, m, d]; } else return null; const result = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00.000Z`); return Number.isNaN(result.getTime()) ? null : result; };
const bool = (value: string) => ['SI', 'SÍ', 'YES', 'Y', 'TRUE', '1'].includes((value || '').toUpperCase());
const number = (value: string) => { const word: Record<string, number> = { BAJO: 2, MEDIO: 5, ALTO: 8 }; const n = Number(value); return Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : word[(value || '').toUpperCase()] || 0; };
const area = (value: string) => { const normalized = (value || '').trim().toUpperCase(); const aliases: Record<string, string> = { LOGISTICA: 'LOGÍSTICA', LOGÍSTICA: 'LOGÍSTICA', SISTEMAS: 'SISTEMAS', FINANZAS: 'FINANZAS', OPERACIONES: 'OPERACIONES' }; return aliases[normalized] || normalized; };

async function main() {
  try {
    const employeeRows = rows('RAW_BD_EMPLEADOS.csv');
    const surveyRows = rows('RAW_ENCUESTAS_SINTOMAS_PELIGROS.csv');
    const absenceRows = rows('RAW_HISTORICO_INCAPACIDADES_CONFIDENCIAL.csv');
    const employees = employeeRows.map((r, i) => ({ id: `employee-${String(i + 1).padStart(3, '0')}`, code: employeeCode(r.ID_Empleado), name: r.Nombre_Completo, department: area(r.Area_Trabajo), position: r.Cargo, hireDate: date(r.Fecha_Ingreso) })).filter(r => r.hireDate);
    const byCode = new Map(employees.map(e => [e.code, e]));
    const absences = absenceRows.map((r, i) => { const employee = byCode.get(employeeCode(r.EMPLEADO_REF)); const start = date(r.FECHA_INICIO_INCAPACIDAD); const days = Math.max(0, Number(r.DIAS_AUSENCIA) || 0); if (!employee || !start || !days) return null; const end = new Date(start); end.setUTCDate(end.getUTCDate() + days - 1); return { id: `absence-${String(i + 1).padStart(3, '0')}`, recordCode: r.COD_REGISTRO, employeeId: employee.id, startDate: start, endDate: end, days, diagnosis: r.DIAGNOSTICO_MEDICO_CONFIDENCIAL, cie10: r.CODIGO_CIE10, healthCategory: r.CATEGORIA_SALUD, issuer: r.ENTIDAD_EXPEDIDORA }; }).filter(Boolean) as any[];
    const surveys = surveyRows.map((r, i) => { const employee = byCode.get(employeeCode(r.CODIGO_EMPLEADO)); const reportedAt = date(r.FECHA_ENCUESTA); if (!employee || !reportedAt) return null; return { id: `survey-${String(i + 1).padStart(3, '0')}`, responseCode: r.ID_RESPUESTA, employeeId: employee.id, reportedAt, symptoms: r.SINTOMA_PRINCIPAL || 'Sin síntomas', hazard: r.PELIGRO_IDENTIFICADO || null, painLevel: number(r.NIVEL_DOLOR_PERCIBIDO), hazardExposure: Boolean(r.PELIGRO_IDENTIFICADO), requiresMedical: bool(r.REQUIERE_VALORACION_MEDICA) }; }).filter(Boolean) as any[];
    await prisma.$transaction(async tx => {
      await tx.alert.deleteMany(); await tx.medicalCase.deleteMany(); await tx.symptomReport.deleteMany(); await tx.absence.deleteMany(); await tx.employee.deleteMany();
      await tx.employee.createMany({ data: employees as any });
      await tx.absence.createMany({ data: absences }); await tx.symptomReport.createMany({ data: surveys });
      const alertEmployees = employees.filter(e => absences.filter(a => a.employeeId === e.id && a.startDate >= new Date('2025-12-01')).length > 2 || surveys.filter(s => s.employeeId === e.id && s.requiresMedical).length > 1);
      for (const employee of alertEmployees) { await tx.alert.create({ data: { id: `alert-${employee.id}`, employeeId: employee.id, type: 'ETL_RISK_RULE', message: 'Riesgo alto detectado por incapacidades repetitivas o síntomas recurrentes. Sugerir valoración médica.', risk: 'HIGH' } }); await tx.medicalCase.create({ data: { id: `case-${employee.id}`, employeeId: employee.id, title: 'Seguimiento generado por ETL', status: 'ACTIVE', risk: 'HIGH', notes: 'Caso creado automáticamente por el motor de correlación.' } }); }
    });
    console.log(JSON.stringify({ imported: { employees: employees.length, absences: absences.length, surveys: surveys.length }, alertsGenerated: employees.filter(e => absences.filter(a => a.employeeId === e.id).length > 2 || surveys.filter(s => s.employeeId === e.id && s.requiresMedical).length > 1).length }, null, 2));
  } catch (error) { console.error('ETL import failed', error); process.exitCode = 1; } finally { await prisma.$disconnect(); }
}
main();
