<script setup lang="ts">
import { computed } from "vue";

interface DashboardProps {
  summary: any;
  alerts: any[];
}

const props = defineProps<DashboardProps>();

const activeCases = computed(
  () =>
    props.summary?.cases?.find((item: any) => item.status === "ACTIVE")
      ?._count || 0,
);

const closedCases = computed(
  () =>
    props.summary?.cases?.find((item: any) => item.status === "CLOSED")
      ?._count || 0,
);

const totalCases = computed(() => activeCases.value + closedCases.value);
const closureRate = computed(() =>
  totalCases.value
    ? Math.round((closedCases.value / totalCases.value) * 100)
    : 0,
);

const departments = computed(() =>
  Object.entries(props.summary?.absenceByDepartment || {})
    .sort((a: any, b: any) => Number(b[1]) - Number(a[1]))
    .slice(0, 6),
);

const maxAbsence = computed(() =>
  Math.max(...departments.value.map((item: any) => Number(item[1])), 1),
);
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-heading">
      <div>
        <div class="eyebrow dark">GESTIÓN SST</div>
        <h1>Resumen de gestión</h1>
        <p>Indicadores principales de salud y seguridad en el trabajo.</p>
      </div>
      <div class="dashboard-updated">
        <span></span>
        <div>
          <b>Actualizado automáticamente</b
          ><small>Consulta en tiempo real · cada 30 segundos</small>
        </div>
      </div>
    </div>

    <div class="dashboard-scope">
      <span class="scope-icon">i</span
      ><span
        >La información presentada corresponde al alcance permitido para tu rol.
        Los datos clínicos individuales están protegidos.</span
      ><b>Última consulta: ahora</b>
    </div>

    <section class="dashboard-kpis">
      <div class="dashboard-kpi">
        <div class="kpi-label">COLABORADORES</div>
        <strong>{{ summary?.employees || 0 }}</strong
        ><span>Personas en la base activa</span>
      </div>
      <div class="dashboard-kpi warning">
        <div class="kpi-label">ALERTAS PENDIENTES</div>
        <strong>{{ summary?.alertCount ?? alerts.length }}</strong
        ><span>Requieren revisión</span>
      </div>
      <div class="dashboard-kpi">
        <div class="kpi-label">CASOS ACTIVOS</div>
        <strong>{{ activeCases }}</strong
        ><span>Seguimientos en curso</span>
      </div>
      <div class="dashboard-kpi success">
        <div class="kpi-label">CASOS CERRADOS</div>
        <strong>{{ closedCases }}</strong
        ><span>{{ closureRate }}% del total de casos</span>
      </div>
    </section>

    <div class="dashboard-main-grid">
      <section class="dashboard-panel case-status-panel">
        <div class="dashboard-panel-heading">
          <div>
            <div class="section-kicker">ESTADO DE CASOS</div>
            <h2>Seguimiento de casos</h2>
            <p>Distribución actual de los casos registrados.</p>
          </div>
          <span class="dashboard-period">Total {{ totalCases }}</span>
        </div>
        <div class="case-status-content">
          <div
            class="case-donut"
            :style="{ '--case-progress': `${closureRate * 3.6}deg` }"
          >
            <div>
              <strong>{{ closureRate }}%</strong><span>cerrados</span>
            </div>
          </div>
          <div class="case-legend">
            <div>
              <span class="legend-dot active-dot"></span>
              <div><b>Activos</b><small>Requieren seguimiento</small></div>
              <strong>{{ activeCases }}</strong>
            </div>
            <div>
              <span class="legend-dot closed-dot"></span>
              <div><b>Cerrados</b><small>Gestión completada</small></div>
              <strong>{{ closedCases }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-panel">
        <div class="dashboard-panel-heading">
          <div>
            <div class="section-kicker">AUSENTISMO</div>
            <h2>Días por área</h2>
            <p>Acumulado registrado en la base.</p>
          </div>
          <span class="dashboard-period">Top 6 áreas</span>
        </div>
        <div class="absence-list">
          <div
            v-for="([department, days], index) in departments"
            :key="department"
            class="absence-item"
          >
            <div class="absence-item-label">
              <span>{{ index + 1 }}</span
              ><b>{{ department }}</b
              ><strong>{{ days }} días</strong>
            </div>
            <div class="absence-track">
              <span
                :style="{
                  width: `${Math.max(8, (Number(days) / maxAbsence) * 100)}%`,
                }"
              ></span>
            </div>
          </div>
          <div v-if="!departments.length" class="dashboard-empty">
            No hay datos de ausentismo.
          </div>
        </div>
      </section>
    </div>

    <section class="dashboard-panel dashboard-alerts-panel">
      <div class="dashboard-panel-heading">
        <div>
          <div class="section-kicker">CONTROL DE ALERTAS</div>
          <h2>Alertas pendientes</h2>
          <p v-if="alerts.length">
            Detalle de las señales que requieren valoración.
          </p>
          <p v-else>
            Se muestra únicamente el indicador agregado para este rol.
          </p>
        </div>
        <span class="alert-total"
          >{{ summary?.alertCount ?? alerts.length }} pendientes</span
        >
      </div>
      <div v-if="alerts.length" class="alert-table">
        <div
          v-for="alert in alerts.slice(0, 5)"
          :key="alert.id"
          class="alert-table-row"
        >
          <span class="alert-level">{{ alert.risk }}</span>
          <div>
            <b>{{ alert.employee?.name || "Colaborador protegido" }}</b
            ><small>{{ alert.message }}</small>
          </div>
          <span class="alert-date">{{
            new Date(alert.createdAt).toLocaleDateString("es-CO")
          }}</span>
        </div>
      </div>
      <div v-else class="restricted-alerts">
        <div class="restricted-icon">✓</div>
        <div>
          <b>Vista agregada habilitada</b>
          <p>
            Los nombres, diagnósticos y detalles clínicos solo están disponibles
            para Médico Ocupacional y Admin SST.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
