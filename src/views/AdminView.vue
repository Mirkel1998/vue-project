<template>
  <div class="admin-panel">
    <h1>🔧 Admin Panel</h1>
    <div class="admin-content">
      <p>Welcome to the admin panel, {{ userStore.profile?.username }}!</p>
      <p>Here you can manage users, avatars, and other system settings.</p>
      
      <!-- Add your admin functionality here -->
      <div class="admin-sections">
        <div class="admin-section">
          <h2>Quick Actions</h2>
          <button @click="goToCommunity" class="admin-btn">
            👥 Manage Users (Community)
          </button>
          <button @click="goToProfile" class="admin-btn">
            📁 Upload Avatars (Profile)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/piniaStores/users'

const router = useRouter()
const userStore = useUserStore()

const goToCommunity = () => {
  router.push('/community')
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.admin-panel {
  max-width: 800px;
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
  margin-bottom: 2rem;
}

.admin-section h2 {
  color: #333;
  margin-bottom: 1rem;
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

.admin-btn:hover {
  background-color: #c82333;
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
}
</style>