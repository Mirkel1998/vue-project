import { createRouter, createWebHistory } from 'vue-router'
import {useAuth} from '../Composables/useAuth.js'
import HomeView from '../views/HomeView.vue'

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
  ],
})

router.beforeEach((to, from, next) => {
  const { isLoggedIn, } = useAuth()
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    next({name: "login"})
  }
  else {
    next()
  }
})

export default router
