<v-3></v-3>
  <template>
  <button v-if="isLoggedIn" @click="handleLogout" class="auth-btn">Logout</button>
  <button v-else @click="goToLogin" class="auth-btn">Login</button>
</template>

<script setup>
import { useAuth } from "../Composables/useAuth"
import { useRouter } from "vue-router"

const { isLoggedIn, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout(router)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.auth-btn {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #6C619E;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}
.auth-btn:hover {
  background-color: #554d7a;
}
</style>
