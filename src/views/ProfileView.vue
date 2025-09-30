<template>
  <div class="profile">
    <!-- Profile actions -->
    <div class="profile-actions">
      <button v-if="isOwnProfile && !editMode" @click="toggleEditMode" class="edit-profile-btn">
        Edit Profile
      </button>
      <button v-if="isOwnProfile && editMode" @click="toggleEditMode" class="view-profile-btn">
        View Profile
      </button>
      <button v-if="isOwnProfile" @click="logout" class="logout-btn">Logout</button>
    </div>
    
    <div class="profile-header">
      <div class="profile-picture-container">
        <img 
          :src="profileData.profilePicture || 'https://via.placeholder.com/150x150/6C619E/FFFFFF?text=Profile'" 
          alt="Profile Picture" 
          class="profile-picture"
          @error="handleImageError"
        />
        <button v-if="isOwnProfile && editMode" @click="changeProfilePicture" class="change-photo-btn">
          Change Photo
        </button>
      </div>
      
      <div class="profile-info">
        <h1>{{ profileData.displayName }}</h1>
        <p class="username">@{{ profileData.username }}</p>
        <p class="join-date">Member since {{ formatDate(profileData.joinDate) }}</p>
        <div v-if="!isOwnProfile || !editMode" class="profile-badges">
          <span v-if="profileData.favoriteGenre" class="badge genre-badge">{{ profileData.favoriteGenre }}</span>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <!-- About Me Section -->
      <div class="section">
        <h2>{{ isOwnProfile ? 'About Me' : `About ${profileData.displayName}` }}</h2>
        <div v-if="isOwnProfile && editMode" class="editable-section">
          <textarea 
            v-if="editingDescription"
            v-model="profileData.description"
            class="description-input"
            placeholder="Tell us about yourself..."
            @keydown="handleKeydown"
          ></textarea>
          <p v-else class="description">
            {{ profileData.description || 'No description added yet.' }}
          </p>
          <button @click="toggleEditDescription" class="edit-btn">
            {{ editingDescription ? 'Save' : 'Edit' }}
          </button>
        </div>
        <p v-else class="description">
          {{ profileData.description || (isOwnProfile ? 'No description added yet.' : 'This user hasn\'t added a description yet.') }}
        </p>
      </div>

      <!-- Profile Information Section -->
      <div class="section">
        <h2>Profile Information</h2>
        <div v-if="isOwnProfile && editMode" class="info-grid">
          <div class="info-item">
            <label>Display Name:</label>
            <input 
              v-model="profileData.displayName" 
              type="text" 
              @keydown="handleKeydown"
            />
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ profileData.email }}</span>
          </div>
          <div class="info-item">
            <label>Location:</label>
            <input 
              v-model="profileData.location" 
              type="text" 
              placeholder="Enter your location"
              @keydown="handleKeydown"
            />
          </div>
          <div class="info-item">
            <label>Favorite Genre:</label>
            <select v-model="profileData.favoriteGenre">
              <option value="">Select a genre</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="RPG">RPG</option>
              <option value="Strategy">Strategy</option>
              <option value="Puzzle">Puzzle</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>
        <div v-else class="info-grid">
          <div class="info-item">
            <label>Location:</label>
            <span>{{ profileData.location || 'Not specified' }}</span>
          </div>
          <div class="info-item">
            <label>Favorite Genre:</label>
            <span>{{ profileData.favoriteGenre || 'Not specified' }}</span>
          </div>
          <div v-if="!isOwnProfile" class="info-item">
            <label>Games Played:</label>
            <span>{{ profileData.gamesPlayed || 0 }}</span>
          </div>
          <div v-if="!isOwnProfile" class="info-item">
            <label>Hours Played:</label>
            <span>{{ profileData.hoursPlayed || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Favorite Games Section -->
      <div class="section">
        <h2>Favorite Games</h2>
        <div v-if="isOwnProfile && editMode" class="favorite-games">
          <div class="add-game">
            <input 
              v-model="newFavoriteGame" 
              type="text" 
              placeholder="Add a favorite game..."
              @keyup.enter="addFavoriteGame"
              @keydown="handleKeydown"
            />
            <button @click="addFavoriteGame">Add Game</button>
          </div>
          <ul class="games-list">
            <li v-for="(game, index) in profileData.favoriteGames" :key="index" class="game-item">
              <span>{{ game }}</span>
              <button @click="removeFavoriteGame(index)" class="remove-btn">×</button>
            </li>
          </ul>
        </div>
        <div v-else class="favorite-games">
          <div v-if="profileData.favoriteGames.length === 0" class="no-games">
            {{ isOwnProfile ? 'No favorite games added yet.' : 'No favorite games added yet.' }}
          </div>
          <ul v-else class="games-list">
            <li v-for="(game, index) in profileData.favoriteGames" :key="index" class="game-item">
              <span>{{ game }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Action buttons for viewing other users -->
      <div v-if="!isOwnProfile" class="action-buttons">
        <button @click="sendFriendRequest" class="friend-btn">Add Friend</button>
        <button @click="sendMessage" class="message-btn">Send Message</button>
      </div>

      <!-- Save button for own profile in edit mode -->
      <button v-if="isOwnProfile && editMode" @click="saveProfile" class="save-profile-btn">
        Save Profile
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfilesStore } from '@/stores/profiles'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profilesStore = useProfilesStore()

const editMode = ref(false)
const editingDescription = ref(false)
const newFavoriteGame = ref('')

const profileData = reactive({
  displayName: '',
  username: '',
  email: '',
  profilePicture: '',
  description: '',
  location: '',
  favoriteGenre: '',
  joinDate: new Date(),
  favoriteGames: [],
  gamesPlayed: 0,
  hoursPlayed: 0
})

// Check if viewing own profile
const isOwnProfile = computed(() => {
  return !route.params.username || route.params.username === authStore.currentUser?.username
})

// Load profile data
onMounted(() => {
  loadProfileData()
})

// Watch for route changes
watch(() => route.params.username, () => {
  loadProfileData()
  editMode.value = false
  editingDescription.value = false
})

const loadProfileData = () => {
  if (isOwnProfile.value) {
    // Load current user's profile
    const userProfile = profilesStore.getCurrentUserProfile()
    if (userProfile) {
      Object.assign(profileData, userProfile)
    }
  } else {
    // Load other user's profile
    loadUserProfile(route.params.username)
  }
}

const loadUserProfile = (username) => {
  // Mock data for other users - in real app, fetch from API
  const mockUsers = {
    janesmith: {
      displayName: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      profilePicture: '',
      description: 'Avid RPG player and streamer. Love exploring vast open worlds and collecting achievements!',
      location: 'Stockholm, Sweden',
      favoriteGenre: 'RPG',
      joinDate: new Date('2022-08-20'),
      favoriteGames: ['Elden Ring', 'The Witcher 3', 'Skyrim', 'Baldur\'s Gate 3'],
      gamesPlayed: 73,
      hoursPlayed: 442
    }
  }
  
  const userData = mockUsers[username]
  if (userData) {
    Object.assign(profileData, userData)
  } else {
    router.push('/404')
  }
}

const toggleEditMode = () => {
  if (editMode.value) {
    // Save when switching from edit to view mode
    saveProfile()
  }
  editMode.value = !editMode.value
  if (!editMode.value) {
    editingDescription.value = false
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const toggleEditDescription = () => {
  editingDescription.value = !editingDescription.value
}

const handleImageError = (event) => {
  // Set a stock profile picture if the image fails to load
  event.target.src = 'https://via.placeholder.com/150x150/6C619E/FFFFFF?text=Profile'
}

const changeProfilePicture = () => {
  // In a real app, this would open a file picker
  alert('Profile picture change functionality would go here')
}

const addFavoriteGame = () => {
  if (newFavoriteGame.value.trim()) {
    profileData.favoriteGames.push(newFavoriteGame.value.trim())
    newFavoriteGame.value = ''
  }
}

const removeFavoriteGame = (index) => {
  profileData.favoriteGames.splice(index, 1)
}

const saveProfile = () => {
  const success = profilesStore.saveProfile(profileData)
  if (success) {
    alert('Profile saved successfully!')
    // Reload the profile data to ensure view reflects saved changes
    if (isOwnProfile.value) {
      const updatedProfile = profilesStore.getCurrentUserProfile()
      if (updatedProfile) {
        Object.assign(profileData, updatedProfile)
      }
    }
  } else {
    alert('Error saving profile')
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const sendFriendRequest = () => {
  alert('Friend request sent!')
}

const sendMessage = () => {
  alert('Message feature would open here')
}

const handleKeydown = (event) => {
  // Explicitly allow spacebar and prevent any global handlers
  if (event.code === 'Space' || event.keyCode === 32) {
    event.stopPropagation()
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: monospace;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.edit-profile-btn, .view-profile-btn {
  background-color: #6C619E;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.edit-profile-btn:hover, .view-profile-btn:hover {
  background-color: #5a4f85;
}

.profile-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #eee;
}

.profile-picture-container {
  text-align: center;
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #6C619E;
  margin-bottom: 1rem;
}

.change-photo-btn {
  background-color: #6C619E;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.username {
  color: #666;
  margin: 0 0 0.5rem 0;
}

.join-date {
  color: #888;
  margin: 0;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #C0C0C0;
  border-radius: 8px;
  border-left: 4px solid #6C619E;
}

.section h2 {
  margin-top: 0;
  color: #333;
}

.editable-section {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.description {
  flex: 1;
  margin: 0;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  min-height: 60px;
  color: #333;
  border-left: 4px solid #6C619E;
}

.description-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 60px;
  resize: vertical;
  font-family: monospace;
  background-color: white !important;
  color: #333 !important;
  outline: none;
  user-select: text !important;
  pointer-events: auto !important;
  position: relative;
  z-index: 1;
}

.description-input:focus {
  border-color: #6C619E;
  box-shadow: 0 0 5px rgba(108, 97, 158, 0.3);
}

.edit-btn {
  background-color: #6C619E;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: bold;
  color: #555;
}

.info-item input, .info-item select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  background-color: white !important;
  color: #333 !important;
  outline: none;
  user-select: text !important;
  pointer-events: auto !important;
  position: relative;
  z-index: 1;
}

.info-item input:focus, .info-item select:focus {
  border-color: #6C619E;
  box-shadow: 0 0 5px rgba(108, 97, 158, 0.3);
}

.add-game {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-game input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  background-color: white !important;
  color: #333 !important;
  outline: none;
  user-select: text !important;
  pointer-events: auto !important;
  position: relative;
  z-index: 1;
}

.add-game input:focus {
  border-color: #6C619E;
  box-shadow: 0 0 5px rgba(108, 97, 158, 0.3);
}

.games-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.game-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: white;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid #6C619E;
}

.game-item span {
  color: #333;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-profile-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  width: 100%;
  margin-top: 1rem;
}

.save-profile-btn:hover {
  background-color: #218838;
}

.profile-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.genre-badge {
  background-color: #6C619E;
  color: white;
}

.no-games {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.friend-btn, .message-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.2s;
}

.friend-btn {
  background-color: #28a745;
  color: white;
}

.friend-btn:hover {
  background-color: #218838;
}

.message-btn {
  background-color: #6C619E;
  color: white;
}

.message-btn:hover {
  background-color: #554d7a;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
