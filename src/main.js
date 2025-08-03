import { createApp } from 'vue'
import App from "./App.vue";
import './assets/style/scss/style.scss'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app');