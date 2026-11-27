<script setup lang="ts">
import { demoEmail, demoPassword, signInDemo } from '~/modules/demo-session'

const { t } = useI18n()
const router = useRouter()
const email = ref(demoEmail)
const password = ref(demoPassword)
const error = ref('')

useHead(() => ({ title: t('login.title') }))

async function submit() {
  try {
    if (!signInDemo(email.value, password.value)) {
      error.value = 'login.invalid'
      return
    }
  }
  catch {
    error.value = 'login.storageError'
    return
  }
  await router.replace('/dashboard')
}
</script>

<template>
  <section class="traffic-login" aria-labelledby="login-title">
    <h1 id="login-title">
      {{ t('login.title') }}
    </h1>
    <p class="traffic-description">
      {{ t('login.intro') }}
    </p>
    <form @submit.prevent="submit" @input="error = ''">
      <div class="traffic-field">
        <label for="email">{{ t('login.email') }}</label>
        <UInput
          id="email" v-model="email" name="email" type="email" autocomplete="username" required
          :aria-invalid="!!error" :aria-describedby="error ? 'login-error' : undefined"
        />
      </div>
      <div class="traffic-field">
        <label for="password">{{ t('login.password') }}</label>
        <UInput
          id="password" v-model="password" name="password" type="password" autocomplete="current-password" required
          :aria-invalid="!!error" :aria-describedby="error ? 'login-error' : undefined"
        />
      </div>
      <p v-if="error" id="login-error" role="alert">
        {{ t(error) }}
      </p>
      <UButton type="submit" block class="traffic-submit">
        {{ t('login.title') }}
      </UButton>
    </form>
    <aside class="traffic-demo">
      <h2>{{ t('login.account') }}</h2>
      <dl>
        <div><dt>{{ t('login.email') }}</dt><dd>{{ demoEmail }}</dd></div>
        <div><dt>{{ t('login.password') }}</dt><dd>{{ demoPassword }}</dd></div>
      </dl>
    </aside>
  </section>
</template>

<route lang="yaml">
name: login
</route>
