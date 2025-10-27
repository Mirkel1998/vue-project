<template>
  <nav>
    <RouterLink to="/" class="nav-logo">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
    </RouterLink>

    <!-- Mobile menu button -->
    <button class="mobile-menu-btn" @click="toggleMobileMenu" v-show="isMobile">
      <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
      <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
      <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
    </button>

    <!-- Navigation links -->
    <div class="nav-links" :class="{ 'mobile-open': showMobileMenu }">
      <RouterLink to="/" @click="closeMobileMenu">Game Hub</RouterLink>
      <RouterLink to="/landing" @click="closeMobileMenu">About</RouterLink>
      <RouterLink to="/usergames" @click="closeMobileMenu">My Games</RouterLink>
      <RouterLink to="/profile" @click="closeMobileMenu">My Profile</RouterLink>
      <RouterLink to="/community" @click="closeMobileMenu">Community</RouterLink>
      
      <!-- Admin link - only visible to admin users -->
      <RouterLink 
        v-if="isAdmin" 
        to="/admin" 
        @click="closeMobileMenu" 
        class="admin-link"
      >
        🔧 Admin Panel
      </RouterLink>
      
      <AuthButton @click="closeMobileMenu" />
    </div>

    <!-- Mobile overlay -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="closeMobileMenu"></div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import AuthButton from './AuthButton.vue'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'

const { currentUser } = useAuth()
const userStore = useUserStore()
const showMobileMenu = ref(false)
const isMobile = ref(false)

// Check if current user is admin - updated to handle "Mikkel (admin)"
const isAdmin = computed(() => {
  const username = userStore.profile?.username
  return username === 'Mikkel' || username === 'Mikkel (admin)'
})

// Watch for user changes to update admin status
watch(currentUser, async (newUser) => {
  if (newUser) {
    await userStore.fetchUserProfile(newUser.uid)
  }
}, { immediate: true })

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Load user profile to check admin status
  if (currentUser.value) {
    await userStore.fetchUserProfile(currentUser.value.uid)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  font-size: 1.1rem;
  margin: 2rem 0;
  width: 100%;
  position: relative;
}

.nav-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: nowrap;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background-color: #6C619E;
  margin: 2px 0;
  transition: 0.3s;
  transform-origin: center;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

nav a {
  color: #6C619E !important;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0 1rem;
  display: inline-block;
  white-space: nowrap;
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

.admin-link {
  background-color: #dc3545 !important;
  color: white !important;
  padding: 0.5rem 1rem !important;
  border-radius: 4px;
  font-size: 0.9rem !important;
}

.admin-link:hover {
  background-color: #c82333 !important;
  text-decoration: none !important;
}

.admin-link.router-link-exact-active,
.admin-link.router-link-active {
  background-color: #a71e2a !important;
  color: white !important;
}

/* Desktop styles */
@media (min-width: 769px) {
  nav {
    justify-content: center;
  }
  
  .nav-links {
    flex-wrap: nowrap;
  }
  
  nav {
    font-size: 1rem;
  }
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  nav {
    justify-content: space-between;
    padding: 0 1rem;
    margin: 1rem 0;
  }

  .logo {
    width: 80px;
    height: 80px;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 250px;
    height: 100vh;
    background-color: #C0C0C0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
    padding-top: 4rem;
    transition: right 0.3s ease;
    z-index: 1000;
    border-left: 2px solid #6C619E;
  }

  .nav-links.mobile-open {
    right: 0;
  }

  .mobile-overlay {
    display: block;
  }

  .nav-links a {
    padding: 1rem;
    font-size: 1.2rem;
    text-align: center;
    width: 80%;
    border-bottom: 1px solid #aaa;
  }

  .nav-links a:last-child {
    border-bottom: none;
  }

  .admin-link {
    width: 80% !important;
    text-align: center !important;
    font-size: 1.1rem !important;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  nav {
    padding: 0 0.5rem;
    margin: 0.5rem 0;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  .nav-links {
    width: 200px;
    gap: 1.5rem;
    padding-top: 3rem;
  }

  .nav-links a {
    font-size: 1.1rem;
    padding: 0.8rem;
  }

  .hamburger-line {
    width: 20px;
    height: 2px;
  }

  .admin-link {
    font-size: 1rem !important;
  }
}
</style>
