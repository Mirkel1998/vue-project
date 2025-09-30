import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { useProfilesStore } from './stores/profiles'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores
const authStore = useAuthStore()
const profilesStore = useProfilesStore()

authStore.initAuth()
profilesStore.initProfiles()

app.mount('#app')
