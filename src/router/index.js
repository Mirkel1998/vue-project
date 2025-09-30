import { createRouter, createWebHistory } from 'vue-router'
import {useAuth} from '../Composables/useAuth.js'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
     {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('../views/LandingPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:username',
      name: 'userProfile',
      component: UserProfileView
    }
  ],
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
