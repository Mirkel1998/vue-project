<template>
  <nav>
    <RouterLink to="/" class="nav-logo">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    </RouterLink>

    <div class="nav-links">
      <RouterLink to="/">Game Hub</RouterLink>
      <RouterLink to="/landing">About</RouterLink>
      <RouterLink to="/usergames">My Games</RouterLink>
      <RouterLink to="/profile">My Profile</RouterLink>
      <RouterLink to="/community">Community</RouterLink>
      <AuthButton />
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import AuthButton from './AuthButton.vue'
</script>

<style scoped>
nav {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap; /* Prevent wrapping */
  gap: 1.5rem;
  font-size: 1.1rem;
  margin: 2rem 0;
  width: 100%;
  white-space: nowrap; /* Keep text in one line */
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 1.5rem;
}

nav a {
  color: #6C619E !important;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0 1rem;
  display: inline-block;
  white-space: nowrap; /* Ensure each link never wraps */
}

nav a:hover {
  color: #6C619E !important;
  text-decoration: underline;
  background-color: transparent !important;
}

nav a.router-link-exact-active,
nav a.router-link-active {
  color: white !important;
}

@media (min-width: 1024px) {
  nav {
    font-size: 1rem;
  }
}
</style>
