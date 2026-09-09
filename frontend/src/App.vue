<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useToast } from "vue-toastification";
import AppSidebar from "./components/AppSidebar.vue";
import { apiRequest } from "./services/api";
import CasesView from "./views/CasesView.vue";
import ClinicalRecordsView from "./views/ClinicalRecordsView.vue";
import DashboardView from "./views/DashboardView.vue";
import LoginView from "./views/LoginView.vue";
import ResourceView from "./views/ResourceView.vue";

const toast = useToast();
const token = ref(localStorage.getItem("sst_token") || "");
const user = ref<any>(JSON.parse(localStorage.getItem("sst_user") || "null"));
const active = ref("overview");
const summary = ref<any>(null);
const employees = ref<any[]>([]);
const absences = ref<any[]>([]);
const alerts = ref<any[]>([]);
const surveys = ref<any[]>([]);
const cases = ref<any[]>([]);
const clinicalRecords = ref<any[]>([]);
const loading = ref(false);

const role = computed(() => user.value?.role || "");
const clinical = computed(() => ["MEDICAL", "ADMIN_SST"].includes(role.value));
const operational = clinical;
const roleLabel = computed(
  () =>
    (
      ({
        HRBP: "HRBP / Líder",
        LEADER: "Líder de área",
        MEDICAL: "Médico SST",
        ADMIN_SST: "Admin SST",
      }) as Record<string, string>
    )[role.value] || "",
);

async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return apiRequest<T>(path, token.value, options);
}

async function loadData(): Promise<void> {
  try {
    loading.value = true;
    summary.value = await request("/dashboard/summary");

    if (operational.value) {
      const [employeeData, absenceData, alertData] = await Promise.all([
        request("/dashboard/employees"),
        request("/dashboard/absences"),
        request("/dashboard/alerts"),
      ]);
      employees.value = employeeData;
      absences.value = absenceData;
      alerts.value = alertData;
    } else {
      alerts.value = [];
    }

    if (clinical.value) {
      const [caseData, surveyData, recordsData] = await Promise.all([
        request("/dashboard/cases"),
        request("/dashboard/surveys"),
        request("/dashboard/clinical-records"),
      ]);
      cases.value = caseData;
      surveys.value = surveyData;
      clinicalRecords.value = recordsData;
    }
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    loading.value = false;
  }
}

async function onLogin(result: any): Promise<void> {
  token.value = result.token;
  user.value = result.user;
  active.value = "overview";
  localStorage.setItem("sst_token", token.value);
  localStorage.setItem("sst_user", JSON.stringify(user.value));
  await loadData();
  toast.success("Sesión iniciada correctamente");
}

async function closeCase(row: any): Promise<void> {
  try {
    await request(`/dashboard/cases/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "CLOSED" }),
    });
    row.status = "CLOSED";
    toast.success("Caso actualizado");
  } catch (error: any) {
    toast.error(error.message);
  }
}

function logout(): void {
  token.value = "";
  user.value = null;
  summary.value = null;
  localStorage.clear();
}

let refreshTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (token.value) void loadData();
  refreshTimer = setInterval(() => {
    if (token.value) void loadData();
  }, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<template>
  <LoginView v-if="!user" @login="onLogin" />
  <div v-else class="app-shell">
    <AppSidebar
      :active="active"
      :medical="clinical"
      :operational="operational"
      :user-name="user.name"
      :role-label="roleLabel"
      @navigate="active = $event"
      @logout="logout"
    />

    <main class="main-content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>SuperApp SST</span><b>/</b>
          <strong>{{
            active === "overview"
              ? "Resumen"
              : active === "employees"
                ? "Colaboradores"
                : active === "absences"
                  ? "Ausentismo"
                  : active === "alerts"
                    ? "Alertas"
                    : active === "records"
                      ? "Expedientes"
                      : active === "cases"
                        ? "Casos clínicos"
                        : "Encuestas SST"
          }}</strong>
        </div>
        <div class="topbar-actions">
          <span class="secure-label">◉ Conexión segura</span
          ><button class="top-avatar">{{ user.name.charAt(0) }}</button>
        </div>
      </header>

      <div class="page-container">
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <span>Actualizando información…</span>
        </div>
        <DashboardView
          v-else-if="active === 'overview'"
          :summary="summary"
          :alerts="alerts"
        />
        <ResourceView
          v-else-if="active === 'employees' && operational"
          title="Colaboradores"
          eyebrow="PERSONAS"
          description="Maestro normalizado de colaboradores de la organización."
          :columns="[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre completo' },
            { key: 'department', label: 'Área' },
            { key: 'position', label: 'Cargo' },
            { key: 'hireDate', label: 'Ingreso', type: 'date' },
          ]"
          :rows="employees"
          count-label="colaboradores"
          filter-key="department"
        />
        <ResourceView
          v-else-if="active === 'absences' && operational"
          title="Registro de ausentismo"
          eyebrow="OPERACIÓN SST"
          description="Histórico detallado para Médico SST y Admin SST."
          :columns="[
            { key: 'recordCode', label: 'Registro' },
            { key: 'employee.name', label: 'Colaborador' },
            { key: 'employee.department', label: 'Área' },
            { key: 'startDate', label: 'Inicio', type: 'date' },
            { key: 'days', label: 'Días' },
            { key: 'diagnosis', label: 'Diagnóstico' },
            { key: 'cie10', label: 'CIE-10' },
          ]"
          :rows="absences"
          count-label="registros"
          filter-key="employee.department"
        />
        <ResourceView
          v-else-if="active === 'alerts' && operational"
          title="Alertas preventivas"
          eyebrow="SEGUIMIENTO"
          description="Señales generadas por el motor de correlación SST."
          :columns="[
            { key: 'employee.name', label: 'Colaborador' },
            { key: 'employee.department', label: 'Área' },
            { key: 'type', label: 'Regla' },
            { key: 'message', label: 'Recomendación' },
            { key: 'risk', label: 'Riesgo', type: 'status' },
            { key: 'createdAt', label: 'Fecha', type: 'date' },
          ]"
          :rows="alerts"
          count-label="pendientes"
          filter-key="employee.department"
        />
        <ClinicalRecordsView
          v-else-if="active === 'records' && clinical"
          :rows="clinicalRecords"
        />
        <CasesView
          v-else-if="active === 'cases' && clinical"
          :rows="cases"
          @close="closeCase"
        />
        <ResourceView
          v-else-if="active === 'surveys' && clinical"
          title="Encuestas SST / batería"
          eyebrow="GESTIÓN CLÍNICA"
          description="Resultados disponibles: síntomas, dolor, peligro y valoración médica."
          :columns="[
            { key: 'responseCode', label: 'Respuesta' },
            { key: 'employee.name', label: 'Colaborador' },
            { key: 'symptoms', label: 'Síntoma' },
            { key: 'hazard', label: 'Peligro' },
            { key: 'painLevel', label: 'Dolor' },
            { key: 'requiresMedical', label: 'Valoración', type: 'boolean' },
          ]"
          :rows="surveys"
          count-label="respuestas"
          filter-key="employee.department"
        />
      </div>
    </main>
  </div>
</template>
