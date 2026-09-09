<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface ClinicalRecord {
  code: string;
  name: string;
  department: string;
  position: string;
  absences: any[];
  symptoms: any[];
  cases: any[];
}

const props = defineProps<{ rows: ClinicalRecord[] }>();
const search = ref("");
const page = ref(1);
const pageSize = 10;

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return props.rows;
  return props.rows.filter((row) =>
    [row.name, row.code, row.department, row.position].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(term),
    ),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
);
const visibleRows = computed(() =>
  filteredRows.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
const totalAbsences = computed(() =>
  props.rows.reduce((total, row) => total + row.absences.length, 0),
);
const totalSymptoms = computed(() =>
  props.rows.reduce((total, row) => total + row.symptoms.length, 0),
);
const totalCases = computed(() =>
  props.rows.reduce((total, row) => total + row.cases.length, 0),
);

watch(search, () => {
  page.value = 1;
});
watch(
  () => props.rows.length,
  () => {
    page.value = 1;
  },
);
</script>

<template>
  <div class="clinical-heading">
    <div>
      <div class="eyebrow dark">GESTIÓN CLÍNICA · ACCESO RESTRINGIDO</div>
      <h1>Expedientes de salud ocupacional</h1>
      <p>
        Consulta individual de historia clínica, diagnósticos, síntomas y
        seguimiento de casos.
      </p>
    </div>
    <div class="clinical-secure-badge">
      <span>●</span> Datos protegidos · Médico / Admin SST
    </div>
  </div>

  <div class="clinical-summary-grid">
    <div class="clinical-summary-card">
      <span class="clinical-summary-icon blue">◉</span>
      <div>
        <small>EXPEDIENTES</small><strong>{{ rows.length }}</strong
        ><span>colaboradores registrados</span>
      </div>
    </div>
    <div class="clinical-summary-card">
      <span class="clinical-summary-icon red">+</span>
      <div>
        <small>INCAPACIDADES</small><strong>{{ totalAbsences }}</strong
        ><span>registros clínicos</span>
      </div>
    </div>
    <div class="clinical-summary-card">
      <span class="clinical-summary-icon amber">⌁</span>
      <div>
        <small>AUTOREPORTES</small><strong>{{ totalSymptoms }}</strong
        ><span>síntomas reportados</span>
      </div>
    </div>
    <div class="clinical-summary-card">
      <span class="clinical-summary-icon green">✓</span>
      <div>
        <small>CASOS</small><strong>{{ totalCases }}</strong
        ><span>seguimientos individuales</span>
      </div>
    </div>
  </div>

  <section class="clinical-records-panel">
    <div class="clinical-records-toolbar">
      <div>
        <div class="section-kicker">BANDEJA CLÍNICA</div>
        <h2>Expedientes detallados</h2>
        <p>
          Selecciona un expediente para revisar sus antecedentes y señales de
          riesgo.
        </p>
      </div>
      <div class="clinical-search">
        <span>⌕</span
        ><input
          v-model="search"
          placeholder="Buscar por nombre, código o área"
          aria-label="Buscar expediente"
        /><b>{{ filteredRows.length }}</b>
      </div>
    </div>

    <div class="clinical-card-grid">
      <article
        v-for="row in visibleRows"
        :key="row.code"
        class="clinical-record-card"
      >
        <div class="record-card-header">
          <div class="record-avatar">{{ row.name.charAt(0) }}</div>
          <div class="record-identity">
            <h3>{{ row.name }}</h3>
            <p>{{ row.code }} · {{ row.department }}</p>
            <small>{{ row.position }}</small>
          </div>
          <span class="record-lock">⌕</span>
        </div>

        <div class="record-metrics">
          <div>
            <b>{{ row.absences.length }}</b
            ><span>Incapacidades</span>
          </div>
          <div>
            <b>{{ row.symptoms.length }}</b
            ><span>Síntomas</span>
          </div>
          <div>
            <b>{{ row.cases.length }}</b
            ><span>Casos</span>
          </div>
        </div>

        <div class="record-section">
          <div class="record-section-title">
            <span>Historia clínica</span
            ><em v-if="row.absences.length" class="risk-tag">Con registros</em
            ><em v-else class="neutral-tag">Sin registros</em>
          </div>
          <div v-if="row.absences.length" class="record-list">
            <div
              v-for="absence in row.absences.slice(0, 2)"
              :key="absence.startDate + absence.diagnosis"
            >
              <strong>{{ absence.diagnosis }}</strong
              ><span
                >{{ absence.cie10 || "CIE-10 no registrado" }} ·
                {{ absence.days }} días ·
                {{
                  new Date(absence.startDate).toLocaleDateString("es-CO")
                }}</span
              >
            </div>
          </div>
          <p v-else class="record-empty">No hay incapacidades registradas.</p>
        </div>

        <div class="record-section">
          <div class="record-section-title">
            <span>Síntomas y batería SST</span
            ><em
              v-if="
                row.symptoms.some((symptom: any) => symptom.requiresMedical)
              "
              class="risk-tag"
              >Revisión requerida</em
            >
          </div>
          <div v-if="row.symptoms.length" class="record-list">
            <div
              v-for="symptom in row.symptoms.slice(0, 2)"
              :key="symptom.reportedAt + symptom.symptoms"
            >
              <strong>{{ symptom.symptoms }}</strong
              ><span
                >Dolor {{ symptom.painLevel }}/10 ·
                {{ symptom.hazard || "Sin peligro reportado" }}</span
              >
            </div>
          </div>
          <p v-else class="record-empty">Sin autoreportes recientes.</p>
        </div>

        <div class="record-case-footer">
          <span
            ><i
              :class="{
                active: row.cases.some((item: any) => item.status === 'ACTIVE'),
              }"
            ></i
            >{{
              row.cases.length
                ? `${row.cases.length} caso(s) en seguimiento`
                : "Sin casos abiertos"
            }}</span
          ><span class="view-detail">Ver detalle →</span>
        </div>
      </article>
      <div v-if="!visibleRows.length" class="clinical-empty">
        No hay expedientes para la búsqueda realizada.
      </div>
    </div>

    <div class="clinical-pagination">
      <span
        >Mostrando {{ visibleRows.length }} de
        {{ filteredRows.length }} expedientes</span
      >
      <div>
        <button :disabled="page === 1" @click="page--">‹ Anterior</button
        ><strong>Página {{ page }} de {{ totalPages }}</strong
        ><button :disabled="page === totalPages" @click="page++">
          Siguiente ›
        </button>
      </div>
    </div>
  </section>
</template>
