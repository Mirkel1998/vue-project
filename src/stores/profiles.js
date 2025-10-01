import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useProfilesStore = defineStore('profiles', () => {
  const profiles = ref({})

  const getDefaultProfile = (user) => ({
    displayName: user.username,
    username: user.username,
    email: user.email,
    profilePicture: '',
    description: '',
    location: '',
    favoriteGenre: '',
    favoriteGames: []
  })

  const getCurrentUserProfile = () => {
    const authStore = useAuthStore()
    if (!authStore.currentUser) return null

    const userId = authStore.currentUser.id
    if (!profiles.value[userId]) {
      profiles.value[userId] = getDefaultProfile(authStore.currentUser)
    }
    
    return profiles.value[userId]
  }

  const saveProfile = (profileData) => {
    const authStore = useAuthStore()
    if (!authStore.currentUser) return false

    const userId = authStore.currentUser.id
    profiles.value[userId] = { ...profileData }
    
    // Save to localStorage for persistence
    localStorage.setItem('userProfiles', JSON.stringify(profiles.value))
    return true
  }

  const loadProfiles = () => {
    const savedProfiles = localStorage.getItem('userProfiles')
    if (savedProfiles) {
      profiles.value = JSON.parse(savedProfiles)
    }
  }

  const initProfiles = () => {
    loadProfiles()
  }

  return {
    getCurrentUserProfile,
    saveProfile,
    initProfiles
  }
})

