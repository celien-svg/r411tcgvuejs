<template>
  <NLayoutHeader
    bordered
    style="padding: 0 16px; position: sticky; top: 0; z-index: 100"
  >
    <div class="header-inner">
      <!-- Gauche : logo + liens -->
      <div class="header-left">
        <RouterLink to="/" class="logo">TCG SPA</RouterLink>
        <template v-if="!isMobile">
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
        </template>
      </div>

      <!-- Droite : auth -->
      <div class="header-right">
        <template v-if="isAuthenticated">
          <NText v-if="!isMobile" depth="3" class="username">
            {{ user?.username }}
          </NText>
          <NButton
            size="small"
            @click="
              () => {
                authStore.logout()
                goToLogin()
              }
            "
          >
            Déconnexion
          </NButton>
        </template>
        <template v-else>
          <NButton size="small" type="primary" @click="goToLogin">
            Se connecter
          </NButton>
          <NButton
            v-if="!isMobile"
            size="small"
            type="primary"
            @click="goToRegister"
          >
            S'inscrire
          </NButton>
        </template>
      </div>
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { NButton, NLayoutHeader, NText } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/router'
import { useAuthStore } from '@/store/auth'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const router = useRouter()
const goToLogin = () => router.push(ROUTES.LOGIN)
const goToRegister = () => router.push(ROUTES.REGISTER)

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 640)
</script>

<style scoped>
.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.logo {
  font-weight: 900;
  font-size: 15px;
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.username {
  white-space: nowrap;
  font-size: 13px;
}
</style>
