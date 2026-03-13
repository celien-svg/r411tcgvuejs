<template>
  <NCard title="Connexion" style="max-width: 400px; margin: 40px auto">
    <NForm :model="form" :rules="rules">
      <NFormItem label="Email" path="email">
        <NInput v-model:value="form.email" placeholder="email@example.com" />
      </NFormItem>

      <NFormItem label="Mot de passe" path="password">
        <NInput
           v-model:value="form.password" type="password" placeholder="Votre mot de passe"
        />
      </NFormItem>

      <NAlert v-if="errorMessage" type="error" style="margin-bottom: 12px">
        {{ errorMessage }}
      </NAlert>

      <NButton
        type="primary"
        block
        :loading="loading"
        @click="handleSubmit"
      >
        Se connecter
      </NButton>

      <NSpace justify="center" style="margin-top: 12px">
        Pas encore de compte ? <RouterLink :to="ROUTES.REGISTER">S'inscrire</RouterLink>
      </NSpace>
    </NForm>
  </NCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '@/composables/useApi'
import { ROUTES } from '@/router'
import { useAuthStore } from '@/store/auth'
import type { SignInPayload } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const api = useApi()


//RG1

const form = ref<SignInPayload>({
  email: '',
  password: ''
})

const rules = {
  email: { required: true, message: 'Email requis', trigger: 'blur' },
  password: { required: true, message: 'Mot de passe requis', trigger: 'blur' }
}



const loading = ref(false)
const errorMessage = ref('')


//RG2, RG3, RG4

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    // Appel API réel
    const response = await api.signIn(form.value)


    authStore.login(response.token, response.user)

    router.push(ROUTES.HOME)
  } catch (_err: unknown) {
    errorMessage.value = 'Identifiants incorrects' // RG3
  } finally {
    loading.value = false // RG2
  }
}
</script>
