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
      name: 'community',
      component: () => import('@/views/CommunityView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
  ],
})

// Route guard for authentication
router.beforeEach(async (to, from, next) => {
  const { isLoggedIn, currentUser } = useAuth()
  
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    next('/login')
  } else if (to.meta.requiresAdmin) {
    // Check if user is admin
    const { useUserStore } = await import('@/piniaStores/users')
    const userStore = useUserStore()
    
    if (currentUser.value) {
      await userStore.fetchUserProfile(currentUser.value.uid)
      const username = userStore.profile?.username
      if (username === 'Mikkel' || username === 'Mikkel (admin)') {
        next()
      } else {
        next('/') // Redirect non-admin users to home
      }
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router
