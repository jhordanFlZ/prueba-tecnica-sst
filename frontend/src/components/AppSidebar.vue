<script setup lang="ts">
interface SidebarProps {
  active: string;
  medical: boolean;
  operational: boolean;
  userName: string;
  roleLabel: string;
}

defineProps<SidebarProps>();

const emit = defineEmits<{
  navigate: [page: string];
  logout: [];
}>();

const primaryItems = [
  { id: "overview", label: "Resumen", icon: "▦" },
  { id: "employees", label: "Colaboradores", icon: "◉" },
  { id: "absences", label: "Ausentismo", icon: "◷" },
  { id: "alerts", label: "Alertas", icon: "!" },
];
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">+</div>
      <div><strong>SST</strong><span>Health desk</span></div>
    </div>

    <div v-if="operational" class="workspace-label">OPERACIÓN</div>
    <nav aria-label="Operación">
      <template v-if="operational">
        <button
          v-for="item in primaryItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: active === item.id }"
          @click="emit('navigate', item.id)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
          <span v-if="item.id === 'alerts'" class="nav-dot">!</span>
        </button>
      </template>
      <button
        v-else
        class="nav-item"
        :class="{ active: active === 'overview' }"
        @click="emit('navigate', 'overview')"
      >
        <span class="nav-icon">▦</span>Resumen
      </button>
    </nav>

    <div class="workspace-label medical-label">GESTIÓN CLÍNICA</div>
    <nav aria-label="Gestión clínica">
      <template v-if="medical">
        <button
          class="nav-item"
          :class="{ active: active === 'records' }"
          @click="emit('navigate', 'records')"
        >
          <span class="nav-icon">▤</span>Expedientes
        </button>
        <button
          class="nav-item"
          :class="{ active: active === 'cases' }"
          @click="emit('navigate', 'cases')"
        >
          <span class="nav-icon">⌁</span>Casos clínicos
        </button>
        <button
          class="nav-item"
          :class="{ active: active === 'surveys' }"
          @click="emit('navigate', 'surveys')"
        >
          <span class="nav-icon">☷</span>Encuestas SST
        </button>
      </template>
      <div v-else class="restricted-note">
        <span>◈</span> Módulos clínicos<br /><small>Requiere rol médico</small>
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar">{{ userName.charAt(0) }}</div>
        <div class="user-meta">
          <strong>{{ userName }}</strong
          ><span>{{ roleLabel }}</span>
        </div>
        <button
          class="logout-button"
          title="Cerrar sesión"
          @click="emit('logout')"
        >
          ↪
        </button>
      </div>
    </div>
  </aside>
</template>
