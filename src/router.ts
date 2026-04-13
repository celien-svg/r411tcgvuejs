import { createRouter, createWebHistory } from 'vue-router'

import CreateDeckPage from '@/pages/CreateDeckPage.vue'
import DeckDetailPage from '@/pages/DeckDetailPage.vue'
import EditDeckPage from '@/pages/EditDeckPage.vue'

import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import { useAuthStore } from './store/auth'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DECK_CREATE: '/decks/create',
  DECK_DETAIL: (id: number | string) => `/decks/${id}`,
  DECK_EDIT: (id: number | string) => `/decks/${id}/edit`,
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.LOGIN, component: LoginPage },
  { path: ROUTES.REGISTER, component: RegisterPage },
  {
    path: '/decks/create',
    component: CreateDeckPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/decks/:id',
    component: DeckDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/decks/:id/edit',
    component: EditDeckPage,
    meta: { requiresAuth: true },
  },
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
