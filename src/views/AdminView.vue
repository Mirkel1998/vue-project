<template>
  <div class="admin-panel">
    <h1>🔧 Admin Panel</h1>
    <div class="admin-content">
      <p>Welcome to the admin panel, {{ userStore.profile?.username }}!</p>
      <p>Here you can manage users and other system settings.</p>
      
      <div class="admin-sections">
        <!-- User Management Section -->
        <div class="admin-section">
          <h2>User Management</h2>
          <button @click="loadUsers" class="admin-btn" :disabled="loadingUsers">
            {{ loadingUsers ? 'Loading...' : '👥 Load All Users' }}
          </button>
          
          <div v-if="users.length > 0" class="users-list">
            <h3>All Users ({{ users.length }})</h3>
            <div v-for="user in users" :key="user.uid" class="user-row">
              <div class="user-info">
                <strong>{{ user.username }}</strong>
                <span class="user-details">
                  {{ user.email ? `(${user.email})` : '' }}
                  {{ user.location ? `- ${user.location}` : '' }}
                </span>
              </div>
              <button 
                v-if="user.username !== 'Mikkel' && user.username !== 'Mikkel (admin)'" 
                @click="deleteUser(user)" 
                class="delete-btn"
                :disabled="deletingUsers.includes(user.uid)"
              >
                {{ deletingUsers.includes(user.uid) ? 'Deleting...' : '🗑️ Delete' }}
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
import { ref } from 'vue'
import { useUserStore } from '@/piniaStores/users'
import { db } from '@/Composables/useFirebase'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'

const userStore = useUserStore()

const users = ref([])
const loadingUsers = ref(false)
const deletingUsers = ref([])
const message = ref('')
const messageType = ref('success')

const games = [
  { name: "Pingpong", displayName: "Ping Pong" },
  { name: "Snake", displayName: "Snake" },
  { name: "FlappyBox", displayName: "Flappy Box" },
  { name: "SpaceShooter", displayName: "Space Shooter" },
  { name: "AvoidEnemy", displayName: "Avoid the Enemy" },
  { name: "RockPaperScissors", displayName: "Rock Paper Scissors" },
  { name: "QuizGame", displayName: "Star Wars Quiz" },
  { name: "MazeEscape", displayName: "Maze Escape" },
  { name: "GuessTheColor", displayName: "Guess the Color" },
  { name: "TicTacToe", displayName: "Tic Tac Toe" },
]

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const snap = await getDocs(collection(db, "users"))
    users.value = snap.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })).filter(user => user.username) // Only users with usernames
    
    message.value = `Loaded ${users.value.length} users successfully`
    messageType.value = 'success'
  } catch (error) {
    console.error('Error loading users:', error)
    message.value = 'Failed to load users'
    messageType.value = 'error'
  } finally {
    loadingUsers.value = false
    // Clear message after 3 seconds
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Are you sure you want to permanently delete user "${user.username}"?\n\nThis will remove:\n- User profile\n- All game scores\n- All user data\n\nThis action cannot be undone!`)) {
    return
  }

  deletingUsers.value.push(user.uid)
  
  try {
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', user.uid))
    
    // Delete user's scores from all game leaderboards
    const deletePromises = games.map(async (game) => {
      try {
        await deleteDoc(doc(db, `leaderboards/${game.name}/scores`, user.uid))
      } catch (e) {
        // Score might not exist for this game, continue
        console.log(`No score found for ${user.username} in ${game.name}`)
      }
    })
    
    await Promise.all(deletePromises)
    
    // Remove user from local array
    users.value = users.value.filter(u => u.uid !== user.uid)
    
    message.value = `User "${user.username}" has been permanently deleted`
    messageType.value = 'success'
    
  } catch (error) {
    console.error('Error deleting user:', error)
    message.value = `Failed to delete user "${user.username}". Please try again.`
    messageType.value = 'error'
  } finally {
    deletingUsers.value = deletingUsers.value.filter(id => id !== user.uid)
    
    // Clear message after 5 seconds
    setTimeout(() => {
      message.value = ''
    }, 5000)
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
  border-radius: 4px;
}

.message {
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
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