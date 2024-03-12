import 'vuetify/styles'
import '@/assets/main.css'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import colors from 'vuetify/util/colors'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from './App.vue'
import router from './router'

const customDark: ThemeDefinition = {
  dark: true,
  colors: {
    "background": colors.grey.darken4,
    "surface": "#212121",
    "primary": colors.teal.lighten3,
    "secondary": "#03DAC5",
    "error": "#CF6679",
    "info": "#2196F3",
    "success": "#4CAF50",
    "warning": "#FB8C00",
    'on-background': "#121212",
    'on-surface': "#fff",
    'on-primary': "#fff",
    'on-secondary': "#121212",
    'on-success': "#121212",
    'on-warning': "#121212",
    'on-error': "#121212",
    'on-info': "#121212",
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customDark',
    themes: {
      customDark
    },
  }
})

const app = createApp(App).use(vuetify)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.mount('#app')
