import { createApp } from "vue";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./clinical-records.css";
import "./dashboard.css";
import "./style.css";
import "./table.css";
import App from "./App.vue";

createApp(App)
  .use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 3500,
  })
  .mount("#app");
