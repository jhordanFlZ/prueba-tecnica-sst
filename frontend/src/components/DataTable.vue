<script setup lang="ts">
interface TableColumn {
  key: string;
  label: string;
  type?: string;
}

defineProps<{
  columns: TableColumn[];
  rows: any[];
  empty?: string;
}>();

const getValue = (row: any, key: string) =>
  key.split(".").reduce((current, part) => current?.[part], row);

function formatValue(row: any, column: TableColumn): string {
  const rawValue = getValue(row, column.key);

  if (rawValue === null || rawValue === undefined || rawValue === "")
    return "—";
  if (column.type === "date") {
    return new Date(rawValue).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  if (column.type === "boolean") return rawValue ? "Sí" : "No";
  return String(rawValue);
}
</script>

<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="
            row.id || row.code || row.recordCode || row.responseCode || index
          "
        >
          <td v-for="column in columns" :key="column.key">
            <span
              v-if="column.type === 'status'"
              :class="[
                'status-pill',
                String(getValue(row, column.key)).toLowerCase(),
              ]"
              >{{ formatValue(row, column) }}</span
            >
            <span v-else>{{ formatValue(row, column) }}</span>
          </td>
          <td v-if="$slots.actions"><slot name="actions" :row="row" /></td>
        </tr>
        <tr v-if="!rows.length">
          <td
            :colspan="columns.length + ($slots.actions ? 1 : 0)"
            class="empty-cell"
          >
            {{ empty || "No hay registros para mostrar" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
