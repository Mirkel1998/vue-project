<template>
    <div class="login-view">
        <h1>login>/</h1>
        <form @submit.prevent="loginUser">
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit" :disabled="loading">Login</button>
        </form>
        <div class="Error" v-if="authError">
            {{ authError }}
        </div>
        <div v-if="isLoggedIn">
         Logged in as: {{currentUser?.email}}   
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from "../Composables/useAuth"

const { login, authError, loading, isLoggedIn, currentUser } = useAuth()

const email = ref("")
const password = ref("")

const loginUser = () => {
    login(email.value, password.value)
}
</script>

<style scoped>
 .login-view {
 max-width: 400px;
 margin: 20px auto; 
 }
</style>