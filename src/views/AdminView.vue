<template>
  <div class="admin-panel">
    <h1>🔧 Admin Panel</h1>
    <div class="admin-content">
      <p>Welcome to the admin panel, {{ userStore.profile?.username }}!</p>
      <p>Here you can manage users.</p>
      
      <div class="admin-sections">
        <!-- User Management Section -->
        <div class="admin-section">
          <h2>User Management</h2>
          <button @click="handleLoadUsers" class="admin-btn" :disabled="loadingUsers">
            {{ getLoadButtonText(loadingUsers) }}
          </button>
          
          <div v-if="users.length > 0" class="users-list">
            <h3>All Users ({{ users.length }})</h3>
            <div v-for="user in users" :key="user.uid" class="user-row">
              <div class="user-info">
                <strong>{{ user.username }}</strong>
                <span class="user-details">
                  {{ formatUserDetails(user) }}
                </span>
              </div>
              <button 
                v-if="!isAdminUser(user)" 
                @click="handleDeleteUser(user)" 
                class="delete-btn"
                :disabled="isUserBeingDeleted(user.uid)"
              >
                {{ getDeleteButtonText(isUserBeingDeleted(user.uid)) }}
              </button>
              <span v-else class="admin-badge">ADMIN</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/piniaStores/users'
import { useAdminUsers } from '@/Composables/admin/useAdminUsers'
import { useAdminUsersUI } from '@/Composables/admin/useAdminUsersUI'

const userStore = useUserStore()

// Smart composable - handles data and business logic
const {
  users,
  loadingUsers,
  loadUsers,
  deleteUser,
  isAdminUser,
  isUserBeingDeleted
} = useAdminUsers()

// Composable that - handles UI state and interactions
const {
  message,
  messageType,
  showSuccess,
  showError,
  confirmUserDeletion,
  formatUserDetails,
  getLoadButtonText,
  getDeleteButtonText
} = useAdminUsersUI()

// Handle load users with UI feedback
const handleLoadUsers = async () => {
  const result = await loadUsers()
  
  if (result.success) {
    showSuccess(result.message)
  } else {
    showError(result.message)
  }
}

// Handle delete user with confirmation and UI feedback
const handleDeleteUser = async (user) => {
  if (!confirmUserDeletion(user.username)) {
    return
  }

  const result = await deleteUser(user)
  
  if (result.success) {
    showSuccess(result.message, 5000) // Show success message for 5 seconds
  } else {
    showError(result.message)
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: monospace;
}

h1 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
}

.admin-content {
  background-color: #C0C0C0;
  border-left: 4px solid #dc3545;
  padding: 2rem;
  margin-bottom: 2rem;
}

.admin-content p {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.admin-sections {
  margin-top: 2rem;
}

.admin-section {
  margin-bottom: 3rem;
}

.admin-section h2 {
  color: #333;
  margin-bottom: 1rem;
}

.admin-section h3 {
  color: #333;
  margin: 1.5rem 0 1rem 0;
  font-size: 1.2rem;
}

.admin-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s;
}

.admin-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.admin-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.users-list {
  margin-top: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  background: white;
}

.user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.user-row:last-child {
  border-bottom: none;
}

.user-info {
  flex-grow: 1;
}

.user-info strong {
  color: #333;
  font-size: 1.1rem;
}

.user-details {
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.delete-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.admin-badge {
  background-color: #28a745;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.message {
  padding: 1rem;
  margin-top: 1rem;
  font-weight: bold;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .admin-content {
    padding: 1.5rem;
  }

  .admin-btn {
    width: 100%;
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .user-row {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .delete-btn {
    width: 100%;
    max-width: 150px;
  }

  .users-list {
    max-height: 300px;
  }
}
</style>