import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../Composables/useAuth.js'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterView from '@/views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/usergames',
      name: 'usergames',
      component: () => import('../views/UserGames.vue'),
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
      path: '/community',
      name: 'Community',
      component: () => import('@/views/CommunityView.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
    }
  ],
})

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const { isLoggedIn } = useAuth()
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    next('/login')
  } else {
    next()
  }
})

export default router
