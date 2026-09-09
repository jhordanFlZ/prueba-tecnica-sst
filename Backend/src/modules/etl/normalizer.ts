/** Normaliza las fuentes CSV sin exponer datos clínicos a roles agregados. */
export class DataNormalizer {
  static employeeCode(value: unknown): string {
    const digits = String(value ?? "")
      .toUpperCase()
      .replace(/[^0-9]/g, "");
    return `EMP-${digits.padStart(3, "0")}`;
  }

  static department(value: unknown): string {
    const clean = String(value ?? "")
      .trim()
      .toUpperCase();
    const aliases: Record<string, string> = {
      OPS: "OPERACIONES",
      OPERACIONES: "OPERACIONES",
      TI: "TECNOLOGÍA",
      TECNOLOGIA: "TECNOLOGÍA",
      RRHH: "RECURSOS HUMANOS",
    };
    return aliases[clean] || clean.replace(/\s+/g, " ");
  }

  static date(value: unknown): Date | null {
    const raw = String(value ?? "").trim();
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? raw
      : raw.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");
    const result = new Date(iso);
    return Number.isNaN(result.getTime()) ? null : result;
  }

  static days(value: unknown): number {
    const match = String(value ?? "").match(/\d+/);
    return match ? Math.max(0, Number(match[0])) : 0;
  }

  static pain(value: unknown): number {
    const map: Record<string, number> = { BAJO: 2, MEDIO: 5, ALTO: 8 };
    const raw = String(value ?? "").toUpperCase();
    return map[raw] ?? Math.min(10, Math.max(0, Number(raw) || 0));
  }
}
