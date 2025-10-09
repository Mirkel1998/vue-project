<template>
  <NavBar />
  <div class="main-content">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from "./components/NavBar.vue"
import { watch } from 'vue'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'

const { currentUser } = useAuth()
const userStore = useUserStore()

watch(currentUser, (user) => {
  if (user) {
    userStore.fetchUserProfile(user.uid)
  } else {
    userStore.clearProfile()
  }
}, { immediate: true })
</script>

<style scoped>
.main-content {
  padding-top: 70px;
}

header {
  line-height: 1.5;
  max-height: 100vh;
  font-family: monospace;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a {
  color: #6C619E !important;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  display: inline-block;
  padding: 0 1rem;
}

nav a:hover {
  color: #6C619E !important;
  text-decoration: underline;
  background-color: transparent !important;
}

nav a.router-link-exact-active {
  color: white !important;
}

nav a.router-link-active {
  color: white !important;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: 2rem;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
