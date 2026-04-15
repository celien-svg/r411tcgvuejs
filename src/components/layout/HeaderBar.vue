<template>
  <NLayoutHeader
    bordered
    style="padding: 0 24px; position: sticky; top: 0; z-index: 100"
  >
    <NSpace justify="space-between" align="center" style="height: 56px">
      <NSpace align="center" :size="16">
        <RouterLink to="/">TCG SPA</RouterLink>
        <NButton
          tag="a"
          :href="`${apiBaseUrl.replace('/api', '')}/api-docs`"
          target="_blank"
          text
          size="small"
        >
          API Docs
        </NButton>
        <NButton
          tag="a"
          href="https://making-rerun-61323218.figma.site/"
          target="_blank"
          text
          size="small"
        >
          Maquettes
        </NButton>
      </NSpace>
      <NSpace align="center" :size="16">
        <template v-if="isAuthenticated">
          <NText depth="3">Connecté en tant que {{ user?.username }}</NText>
          <NButton
            size="small"
            @click="
              () => {
                authStore.logout()
                goToLogin()
              }
            "
            >Déconnexion</NButton
          >
        </template>

        <template v-else>
          <NButton size="small" type="primary" @click="goToLogin">
            Se connecter
          </NButton>
          <NButton size="small" type="primary" @click="goToRegister">
            S'inscrire
          </NButton>
        </template>
      </NSpace>
    </NSpace>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/router'
import { useAuthStore } from '@/store/auth'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const router = useRouter()
const goToLogin = () => router.push(ROUTES.LOGIN)
const goToRegister = () => router.push(ROUTES.REGISTER)
</script>
