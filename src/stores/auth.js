import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isAuthenticated = computed(() => !!currentUser.value)

  // Mock users database
  const users = ref([
    {
      id: 1,
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123'
    },
    {
      id: 2,
      username: 'janedoe',
      email: 'jane.doe@example.com',
      password: 'password123'
    }
  ])

  const login = (username, password) => {
    const user = users.value.find(u => 
      (u.username === username || u.email === username) && u.password === password
    )
    
    if (user) {
      currentUser.value = { id: user.id, username: user.username, email: user.email }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return true
    }
    return false
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const register = (userData) => {
    const newUser = {
      id: users.value.length + 1,
      ...userData
    }
    users.value.push(newUser)
    currentUser.value = { id: newUser.id, username: newUser.username, email: newUser.email }
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    return true
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      currentUser.value = JSON.parse(savedUser)
    }
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    logout,
    register,
    initAuth
  }
})
