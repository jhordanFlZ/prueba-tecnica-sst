<script setup lang="ts">
import DataTable from "../components/DataTable.vue";

defineProps<{ rows: any[] }>();
const emit = defineEmits<{ close: [row: any] }>();

const columns = [
  { key: "employee.name", label: "Colaborador" },
  { key: "employee.department", label: "Área" },
  { key: "title", label: "Motivo" },
  { key: "risk", label: "Riesgo", type: "status" },
  { key: "status", label: "Estado", type: "status" },
  { key: "notes", label: "Seguimiento" },
];
</script>

<template>
  <div class="page-heading">
    <div>
      <div class="eyebrow dark">GESTIÓN CLÍNICA</div>
      <h1>Casos clínicos</h1>
      <p>Seguimiento confidencial de colaboradores y planes de intervención.</p>
    </div>
    <div class="confidential-badge">◈ Acceso confidencial</div>
  </div>
  <section class="panel table-panel">
    <div class="table-toolbar">
      <div>
        <strong>Expedientes activos y cerrados</strong>
        <p>Visible únicamente para Médico SST y Admin SST.</p>
      </div>
    </div>
    <DataTable :columns="columns" :rows="rows">
      <template #actions="{ row }"
        ><button
          v-if="row.status === 'ACTIVE'"
          class="table-action"
          @click="emit('close', row)"
        >
          Cerrar caso
        </button></template
      >
    </DataTable>
  </section>
</template>
