<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Register</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username:</label>
          <input v-model="credentials.username" type="text" id="username" required />
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="credentials.email" type="email" id="email" required autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="credentials.password" type="password" id="password" required autocomplete="new-password" />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">Create account</button>

        <p v-if="localError" class="error">{{ localError }}</p>
        <p v-else-if="authError" class="error">{{ authError }}</p>
      </form>

      <p class="toggle-form">
        Already have an account?
        <router-link to="/login" class="link-btn">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/Composables/useAuth'

const router = useRouter()
const { register, authError, loading } = useAuth()

const localError = ref('')

const credentials = reactive({
  username: '',
  email: '',
  password: ''
})

const handleSubmit = async () => {
  localError.value = ''
  if (credentials.username.trim().length < 3) {
    localError.value = 'Username must be at least 3 characters'
    return
  }
  if (credentials.password.length < 6) {
    localError.value = 'Password must be at least 6 characters'
    return
  }

  await register(credentials.email.trim(), credentials.password, credentials.username.trim())
  if (!authError.value) {
    router.push('/profile')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: monospace;
  min-height: calc(100vh - 4rem);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  background-color: #C0C0C0;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #6C619E;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.login-form h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-family: monospace;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
  font-family: monospace;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-family: monospace;
  background-color: white !important;
  color: #333 !important;
  outline: none;
  user-select: text !important;
  pointer-events: auto !important;
  position: relative;
  z-index: 1;
}

.form-group input:focus {
  outline: none;
  border-color: #6C619E;
  box-shadow: 0 0 5px rgba(108, 97, 158, 0.3);
}

.login-btn {
  width: 100%;
  background-color: #6C619E;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-family: monospace;
  font-weight: bold;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #5a4f85;
}

.error {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 4px;
  font-family: monospace;
}

.toggle-form {
  text-align: center;
  margin-top: 1.5rem;
  color: #333;
  font-family: monospace;
}

.link-btn {
  background: none;
  border: none;
  color: #6C619E;
  cursor: pointer;
  text-decoration: underline;
  font-family: monospace;
  font-weight: bold;
}

.link-btn:hover {
  color: #5a4f85;
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .login-form {
    padding: 1.5rem;
  }
}
</style>

