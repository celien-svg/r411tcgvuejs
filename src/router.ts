import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import { useAuthStore } from './store/auth'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.LOGIN, component: LoginPage },
  { path: ROUTES.REGISTER, component: RegisterPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next(ROUTES.LOGIN)
  } else if (
    (to.path === ROUTES.LOGIN || to.path === ROUTES.REGISTER) &&
    isAuthenticated
  ) {
    next(ROUTES.HOME)
  } else {
    next()
  }
})

export default router
