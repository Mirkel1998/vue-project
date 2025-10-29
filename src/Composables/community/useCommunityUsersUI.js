import { computed } from 'vue'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'

export function useCommunityUsersUI() {
  const { currentUser } = useAuth()
  const userStore = useUserStore()

  // Check if current user is admin
  const isAdmin = computed(() => {
    const username = userStore.profile?.username
    return username === 'Mikkel' || username === 'Mikkel (admin)'
  })

  // Get button text for show/hide scores
  const getToggleButtonText = (showScores) => {
    return showScores ? 'Hide' : 'Show More'
  }

  // Format user details for display
  const formatUserDetail = (label, value) => {
    return value ? { label, value } : null
  }

  // Get all user details for display
  const getUserDetails = (user) => {
    const details = []
    
    if (user.description) {
      details.push({ label: 'About:', value: user.description })
    }
    if (user.location) {
      details.push({ label: 'Location:', value: user.location })
    }
    if (user.favoriteGenre) {
      details.push({ label: 'Favorite Genre:', value: user.favoriteGenre })
    }
    
    return details
  }

  // Format game metadata
  const formatGameMeta = (game) => {
    const parts = []
    if (game.released) parts.push(game.released)
    if (game.publisher) parts.push(game.publisher)
    return parts.join(' • ')
  }

  // Check if user details should be shown
  const shouldShowUserDetails = (user) => {
    return user.description || user.location || user.favoriteGenre
  }

  // Get loading message
  const getLoadingMessage = (type = 'users') => {
    switch (type) {
      case 'users':
        return 'Loading users...'
      case 'scores':
        return 'Loading scores...'
      default:
        return 'Loading...'
    }
  }

  // Get empty state message
  const getEmptyMessage = (type = 'users') => {
    switch (type) {
      case 'users':
        return 'No users found.'
      case 'games':
        return 'No games added yet.'
      default:
        return 'No data found.'
    }
  }

  return {
    // Computed
    isAdmin,
    
    // Text helpers
    getToggleButtonText,
    getLoadingMessage,
    getEmptyMessage,
    
    // Formatting helpers
    formatUserDetail,
    getUserDetails,
    formatGameMeta,
    
    // Display logic
    shouldShowUserDetails
  }
}