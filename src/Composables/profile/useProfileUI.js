import { ref, computed } from 'vue'
import { useUserStore } from '@/piniaStores/users'

export function useProfileUI() {
  // UI State
  const showAvatarSelector = ref(false)
  const showSnackbar = ref(false)
  const snackbarMessage = ref('')

  const userStore = useUserStore()

  // Avatar options
  const avatarOptions = [
    { id: 'avatar1', name: 'Avatar 1', src: '/avatars/avatar1.png' },
    { id: 'avatar2', name: 'Avatar 2', src: '/avatars/avatar2.png' },
    { id: 'avatar3', name: 'Avatar 3', src: '/avatars/avatar3.png' },
    { id: 'avatar4', name: 'Avatar 4', src: '/avatars/avatar4.png' },
    { id: 'avatar5', name: 'Avatar 5', src: '/avatars/avatar5.png' }
  ]

  // Check if user is admin
  const isAdmin = computed(() => {
    const username = userStore.profile?.username
    return username === 'Mikkel' || username === 'Mikkel (admin)'
  })

  // Show snackbar message
  const showSnackbarMessage = (message, duration = 3000) => {
    snackbarMessage.value = message
    showSnackbar.value = true
    setTimeout(() => {
      showSnackbar.value = false
    }, duration)
  }

  // Avatar UI methods
  const openAvatarSelector = () => {
    showAvatarSelector.value = true
  }

  const closeAvatarSelector = () => {
    showAvatarSelector.value = false
  }

  const saveAvatarSelection = () => {
    showAvatarSelector.value = false
  }

  // Get current avatar source
  const getCurrentAvatar = (selectedAvatarId) => {
    const avatar = avatarOptions.find(a => a.id === (selectedAvatarId || 'avatar1'))
    return avatar?.src || avatarOptions[0].src
  }

  // Get profile picture styles
  const getProfilePictureStyle = () => {
    return {
      width: '150px',
      height: '150px',
      border: '4px solid #6C619E',
      cursor: 'pointer',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }

  return {
    // State
    showAvatarSelector,
    showSnackbar,
    snackbarMessage,
    avatarOptions,
    isAdmin,
    
    // Methods
    showSnackbarMessage,
    openAvatarSelector,
    closeAvatarSelector,
    saveAvatarSelection,
    getCurrentAvatar,
    getProfilePictureStyle
  }
}