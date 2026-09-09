<script setup lang="ts">
import { computed, ref, watch } from "vue";
import DataTable from "../components/DataTable.vue";

interface ResourceProps {
  title: string;
  eyebrow: string;
  description: string;
  columns: any[];
  rows: any[];
  countLabel?: string;
  filterKey?: string;
}

const props = defineProps<ResourceProps>();
const search = ref("");
const filter = ref("");
const filterOpen = ref(false);
const page = ref(1);
const pageSize = 10;

const getValue = (row: any, key?: string) =>
  key?.split(".").reduce((current, part) => current?.[part], row);

const filterOptions = computed(() =>
  [
    ...new Set(
      props.rows.map((row) => getValue(row, props.filterKey)).filter(Boolean),
    ),
  ].sort(),
);

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase();
  return props.rows.filter((row) => {
    const matchesText =
      !query ||
      props.columns.some((column) =>
        String(getValue(row, column.key) ?? "")
          .toLowerCase()
          .includes(query),
      );
    const matchesFilter =
      !filter.value || getValue(row, props.filterKey) === filter.value;
    return matchesText && matchesFilter;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
);
const visibleRows = computed(() =>
  filteredRows.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);

watch([search, filter], () => {
  page.value = 1;
});
watch(totalPages, (value) => {
  if (page.value > value) page.value = value;
});
</script>

<template>
  <div class="page-heading">
    <div>
      <div class="eyebrow dark">{{ eyebrow }}</div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
    <div class="table-count">
      <strong>{{ filteredRows.length }}</strong
      ><span>{{ countLabel || "registros" }}</span>
    </div>
  </div>
  <section class="panel table-panel">
    <div class="table-toolbar">
      <div class="table-tools">
        <input
          v-model="search"
          class="search-input"
          type="search"
          placeholder="⌕  Buscar en resultados"
        /><button
          class="filter-button"
          :class="{ active: filterOpen || filter }"
          @click="filterOpen = !filterOpen"
        >
          ≡ Filtros</button
        ><select
          v-if="filterOpen && filterOptions.length"
          v-model="filter"
          class="filter-select"
        >
          <option value="">Todas las áreas</option>
          <option v-for="option in filterOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
      <span class="page-size-label">10 por página</span>
    </div>
    <DataTable :columns="columns" :rows="visibleRows" />
    <div class="pagination">
      <span
        >Mostrando {{ filteredRows.length ? (page - 1) * pageSize + 1 : 0 }}–{{
          Math.min(page * pageSize, filteredRows.length)
        }}
        de {{ filteredRows.length }}</span
      >
      <div>
        <button :disabled="page === 1" @click="page--">‹</button
        ><b>{{ page }}</b
        ><button :disabled="page === totalPages" @click="page++">›</button>
      </div>
    </div>
  </section>
</template>
