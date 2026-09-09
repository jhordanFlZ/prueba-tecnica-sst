<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { apiRequest } from "../services/api";

const emit = defineEmits<{ login: [result: any] }>();
const toast = useToast();
const email = ref("hrbp@sst.local");
const password = ref("Demo123!");
const loading = ref(false);

async function submitLogin(): Promise<void> {
  try {
    loading.value = true;
    const result = await apiRequest("/auth/login", "", {
      method: "POST",
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    emit("login", result);
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-brand-panel">
      <div class="brand brand-light">
        <div class="brand-mark">+</div>
        <div><strong>SST</strong><span>Health desk</span></div>
      </div>
      <div class="login-hero">
        <div class="eyebrow">SALUD Y SEGURIDAD EN EL TRABAJO</div>
        <h1>Decisiones preventivas, equipos más seguros.</h1>
        <p>
          Centraliza la operación SST y convierte cada señal en una acción a
          tiempo.
        </p>
      </div>
      <div class="login-foot">SuperApp SST · Prototipo operativo</div>
    </div>
    <div class="login-form-panel">
      <form class="login-card" @submit.prevent="submitLogin">
        <div class="eyebrow dark">ACCESO SEGURO</div>
        <h2>Inicia sesión</h2>
        <p class="form-intro">
          Ingresa con tus credenciales corporativas para continuar.
        </p>
        <label
          >Correo electrónico<input
            v-model="email"
            type="email"
            autocomplete="username"
        /></label>
        <label
          >Contraseña<input
            v-model="password"
            type="password"
            autocomplete="current-password"
        /></label>
        <button class="primary-button" :disabled="loading">
          {{ loading ? "Validando…" : "Ingresar al centro SST" }} <span>→</span>
        </button>
        <div class="demo-hint">
          <b>Accesos de demostración</b
          ><span>HRBP · Médico SST · Admin SST</span>
        </div>
      </form>
    </div>
  </div>
</template>
