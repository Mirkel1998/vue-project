import { ref } from 'vue'

export function useAdminUsersUI() {
  // UI State
  const message = ref('')
  const messageType = ref('success')

  // Show message with auto-clear
  const showMessage = (text, type = 'success', duration = 3000) => {
    message.value = text
    messageType.value = type
    
    // Clear message after duration
    setTimeout(() => {
      clearMessage()
    }, duration)
  }

  // Clear message manually
  const clearMessage = () => {
    message.value = ''
  }

  // Show success message
  const showSuccess = (text, duration = 3000) => {
    showMessage(text, 'success', duration)
  }

  // Show error message
  const showError = (text, duration = 5000) => {
    showMessage(text, 'error', duration)
  }

  // Confirmation dialog for user deletion
  const confirmUserDeletion = (username) => {
    return confirm(
      `Are you sure you want to permanently delete user "${username}"?\n\n` +
      `This will remove:\n` +
      `- User profile\n` +
      `- All game scores\n` +
      `- All user data\n\n` +
      `This action cannot be undone!`
    )
  }

  // Format user details for display
  const formatUserDetails = (user) => {
    const parts = []
    if (user.email) parts.push(`(${user.email})`)
    if (user.location) parts.push(`- ${user.location}`)
    return parts.join(' ')
  }

  // Get button text based on loading state
  const getLoadButtonText = (isLoading) => {
    return isLoading ? 'Loading...' : '👥 Load All Users'
  }

  // Get delete button text based on deleting state
  const getDeleteButtonText = (isDeleting) => {
    return isDeleting ? 'Deleting...' : '🗑️ Delete'
  }

  return {
    // State
    message,
    messageType,
    
    // Message methods
    showMessage,
    showSuccess,
    showError,
    clearMessage,
    
    // UI helpers
    confirmUserDeletion,
    formatUserDetails,
    getLoadButtonText,
    getDeleteButtonText
  }
}