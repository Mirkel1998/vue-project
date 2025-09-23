<v-3></v-3>
  <template>
   <button v-if="isLoggedIn" @click="handleLogout" class="auth-btn">Logout</button>
   <router-link v-else class="auth-btn" to="/login">login</router-link>
  </template>

  <script setup>
    import { useAuth } from "../Composables/useAuth"
    import { useRouter } from "vue-router"

    const { isLoggedIn, logout } = useAuth ()
    const router = useRouter()

    const handleLogout = () => {
        logout(router)
    }
  </script>


    <style>
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