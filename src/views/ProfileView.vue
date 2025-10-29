<template>
  <div class="profile" v-if="!loading && profileData">
    <!-- Snackbar notification -->
    <div v-if="showSnackbar" class="snackbar" :class="{ show: showSnackbar }">
      {{ snackbarMessage }}
    </div>

    <div class="profile-header">
      <div class="profile-picture-container">
        <div class="profile-picture" @click="openAvatarSelector" :style="getProfilePictureStyle()">
          <img :src="getCurrentAvatar(profileData.avatar)" :alt="profileData.username" />
        </div>
        <button @click="openAvatarSelector" class="change-avatar-btn">Change Avatar</button>
      </div>
      <div class="profile-info" style="display: flex; align-items: center; gap: 1rem;">
        <h1 style="margin: 0;">
          <span class="username-display" style="font-size:2rem; color:white;">
            {{ profileData.username }}
          </span>
        </h1>
        <div v-if="profileData.favoriteGenre" class="profile-badges">
          <span class="badge genre-badge">{{ profileData.favoriteGenre }}</span>
        </div>
      </div>
    </div>

    <!-- Avatar Selector Modal -->
    <div v-if="showAvatarSelector" class="avatar-modal" @click="closeAvatarSelector">
      <div class="avatar-modal-content" @click.stop>
        <h3>Choose Your Avatar</h3>
        <div class="avatar-grid">
          <div 
            v-for="avatar in avatarOptions" 
            :key="avatar.id"
            class="avatar-option"
            :class="{ selected: profileData.avatar === avatar.id }"
            @click="handleAvatarSelection(avatar.id)"
          >
            <div class="avatar-preview">
              <img :src="avatar.src" :alt="avatar.name" />
            </div>
            <span class="avatar-name">{{ avatar.name }}</span>
          </div>
        </div>
        <div class="avatar-modal-actions">
          <button @click="closeAvatarSelector" class="cancel-btn">Cancel</button>
          <button @click="handleSaveAvatarSelection" class="save-btn">Save</button>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="section">
        <h2>About</h2>
        <textarea v-model="profileData.description" placeholder="Tell us about yourself..."></textarea>
      </div>

      <div class="section">
        <h2>Profile Information</h2>
        <div class="info-vertical">
          <div class="info-item">
            <label>Location:</label>
            <input v-model="profileData.location" type="text" placeholder="Enter your location" />
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
              <option value="Racing">Racing</option>
              <option value="Simulation">Simulation</option>
              <option value="Fighting">Fighting</option>
              <option value="Shooter">Shooter</option>
              <option value="Horror">Horror</option>
              <option value="Platformer">Platformer</option>
              <option value="Indie">Indie</option>
              <option value="MMORPG">MMORPG</option>
              <option value="Battle Royale">Battle Royale</option>
              <option value="Survival">Survival</option>
              <option value="Music/Rhythm">Music/Rhythm</option>
              <option value="Visual Novel">Visual Novel</option>
            </select>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Your High Scores</h2>
        <div class="scores-list">
          <div v-for="game in userScores" :key="game.name" class="score-item">
            <span class="game-name">{{ game.displayName }}</span>
            <span class="game-score">{{ game.score !== null ? game.score : '—' }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Your Games</h2>
        <div v-if="userGames.length" class="games-grid">
          <div v-for="game in userGames" :key="game.id" class="user-game-card">
            <img :src="game.background_image" :alt="game.name" class="user-game-thumb" />
            <div class="user-game-info">
              <div class="user-game-title">{{ game.name }}</div>
              <div class="user-game-meta">
                <span v-if="game.released">{{ game.released }}</span>
                <span v-if="game.publisher"> • {{ game.publisher }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-games">
          <p>No games added yet. <router-link to="/usergames" style="color: #6C619E;">Add some games!</router-link></p>
        </div>
      </div>

      <button @click="handleSaveProfile" class="save-profile-btn">
        Save Profile
      </button>
    </div>
  </div>
  <div v-else-if="loading" class="loading">
    Loading profile...
  </div>
  <div v-else class="not-found">
    User not found.
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useProfile } from '@/Composables/profile/useProfile'
import { useProfileUI } from '@/Composables/profile/useProfileUI'

// Smart composable - handles data and business logic
const {
  loading,
  profileData,
  userScores,
  userGames,
  loadProfileData,
  saveProfile,
  selectAvatar,
  currentUser
} = useProfile()

// Dumb composable - handles UI state and interactions
const {
  showAvatarSelector,
  showSnackbar,
  snackbarMessage,
  avatarOptions,
  isAdmin,
  showSnackbarMessage,
  openAvatarSelector,
  closeAvatarSelector,
  saveAvatarSelection,
  getCurrentAvatar,
  getProfilePictureStyle
} = useProfileUI()

// Handle avatar selection
const handleAvatarSelection = (avatarId) => {
  selectAvatar(avatarId)
}

// Handle saving avatar selection
const handleSaveAvatarSelection = () => {
  saveAvatarSelection()
  showSnackbarMessage('Avatar updated!')
}

// Handle profile save with UI feedback
const handleSaveProfile = async () => {
  const result = await saveProfile()
  showSnackbarMessage(result.message)
}

// Load profile data on mount and user change
onMounted(async () => {
  const result = await loadProfileData()
  if (!result.success) {
    showSnackbarMessage(result.message)
  }
})

watch(() => currentUser.value, async () => {
  const result = await loadProfileData()
  if (!result.success) {
    showSnackbarMessage(result.message)
  }
})
</script>

<style scoped>
.profile {
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  font-family: monospace;
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
  object-fit: cover;
  border: 4px solid #6C619E;
  margin-bottom: 1rem;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-avatar-btn {
  background-color: #6C619E;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.change-avatar-btn:hover {
  background-color: #554d7a;
}

.avatar-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.avatar-modal-content {
  background: white;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.avatar-modal-content h3 {
  margin-top: 0;
  text-align: center;
  color: #333;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.avatar-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-option:hover {
  background-color: #f8f9fa;
  border-color: #6C619E;
}

.avatar-option.selected {
  background-color: #e3f2fd;
  border-color: #6C619E;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  border: 2px solid #ddd;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: bold;
}

.avatar-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #545b62;
}

.save-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #218838;
}

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.username-display {
  font-size: 2rem;
  color: #333;
}

.profile-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  font-weight: bold;
}

.genre-badge {
  background-color: #6C619E;
  color: white;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #C0C0C0;
  border-left: 4px solid #6C619E;
  max-width: 1100px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.section h2 {
  margin-top: 0;
  color: #333;
}

.info-vertical {
  display: flex;
  flex-direction: column;
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

.save-profile-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  cursor: pointer;
  font-size: 1.1rem;
  width: 100%;
  margin-top: 1rem;
}

.save-profile-btn:hover {
  background-color: #218838;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.not-found {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #dc3545;
}

.section textarea {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 0.5rem;
  border: 1px solid #ddd;
  font-family: monospace;
  background-color: white !important;
  color: #333 !important;
  outline: none;
  resize: vertical;
}

.section textarea:focus {
  border-color: #6C619E;
  box-shadow: 0 0 5px rgba(108, 97, 158, 0.3);
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #ddd;
  font-family: monospace;
}

.game-name {
  color: #333;
}

.game-score {
  color: #6C619E;
  font-weight: bold;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.user-game-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: white;
  border: 1px solid #ddd;
}

.user-game-thumb {
  width: 60px;
  height: 40px;
  object-fit: cover;
  flex-shrink: 0;
}

.user-game-info {
  flex-grow: 1;
}

.user-game-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.user-game-meta {
  font-size: 0.9rem;
  color: #666;
}

.no-games {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-games p {
  margin: 0;
}

/* Snackbar styles */
.snackbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  background-color: #333;
  color: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s ease;
}

.snackbar.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }

  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .profile-info {
    align-items: center !important;
    text-align: center;
  }

  .username-display {
    font-size: 1.5rem !important;
  }

  .section {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .section h2 {
    font-size: 1.3rem;
  }

  .games-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .user-game-card {
    padding: 0.8rem;
  }

  .save-profile-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .avatar-modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .avatar-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.8rem;
  }

  .avatar-preview {
    width: 60px;
    height: 60px;
  }

  .snackbar {
    left: 10px;
    right: 10px;
    transform: translateY(100%);
    padding: 0.8rem 1rem;
  }

  .snackbar.show {
    transform: translateY(0);
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .profile {
    padding: 0.5rem;
  }

  .profile-picture {
    width: 100px;
    height: 100px;
  }

  .username-display {
    font-size: 1.3rem !important;
  }

  .section {
    padding: 0.8rem;
  }

  .section h2 {
    font-size: 1.2rem;
  }

  .user-game-card {
    padding: 0.6rem;
    flex-direction: column;
    text-align: center;
  }

  .user-game-thumb {
    width: 80px;
    height: 50px;
  }

  .save-profile-btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }

  .avatar-modal-content {
    padding: 1rem;
  }

  .avatar-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .avatar-preview {
    width: 50px;
    height: 50px;
  }

  .avatar-name {
    font-size: 0.8rem;
  }

  .cancel-btn,
  .save-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>

