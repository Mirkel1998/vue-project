<template>
  <div class="profile" v-if="!loading && profileData">
    <!-- Snackbar notification -->
    <div v-if="showSnackbar" class="snackbar" :class="{ show: showSnackbar }">
      {{ snackbarMessage }}
    </div>

    <div class="profile-header">
      <div class="profile-picture-container">
        <div class="profile-picture" @click="showAvatarSelector = true" :style="getProfilePictureStyle()">
          <img :src="getCurrentAvatar()" :alt="profileData.username" />
        </div>
        <button @click="showAvatarSelector = true" class="change-avatar-btn">Change Avatar</button>
      </div>
      <div class="profile-info" style="display: flex; align-items: center; gap: 1rem;">
        <h1 style="margin: 0;">
          <span class="username-display" style="font-size:2rem; color:#333;">
            {{ profileData.username }}
          </span>
        </h1>
        <div v-if="profileData.favoriteGenre" class="profile-badges">
          <span class="badge genre-badge">{{ profileData.favoriteGenre }}</span>
        </div>
      </div>
    </div>

    <!-- Avatar Selector Modal -->
    <div v-if="showAvatarSelector" class="avatar-modal" @click="showAvatarSelector = false">
      <div class="avatar-modal-content" @click.stop>
        <h3>Choose Your Avatar</h3>
        <div class="avatar-grid">
          <div 
            v-for="avatar in avatarOptions" 
            :key="avatar.id"
            class="avatar-option"
            :class="{ selected: profileData.avatar === avatar.id }"
            @click="selectAvatar(avatar.id)"
          >
            <div class="avatar-preview">
              <img :src="avatar.src" :alt="avatar.name" />
            </div>
            <span class="avatar-name">{{ avatar.name }}</span>
          </div>
        </div>
        <div class="avatar-modal-actions">
          <button @click="showAvatarSelector = false" class="cancel-btn">Cancel</button>
          <button @click="saveAvatarSelection" class="save-btn">Save</button>
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
          <p>No games added yet. <router-link to="/user-games" style="color: #6C619E;">Add some games!</router-link></p>
        </div>
      </div>

      <button @click="saveProfile" class="save-profile-btn">
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
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'
import { db } from '@/Composables/useFirebase'
import { setDoc, doc, getDoc } from 'firebase/firestore'

const { currentUser } = useAuth()
const userStore = useUserStore()

const loading = ref(true)
const showAvatarSelector = ref(false)

// Snackbar state
const showSnackbar = ref(false)
const snackbarMessage = ref('')

const profileData = reactive({
  username: '',
  description: '',
  location: '',
  favoriteGenre: '',
  avatar: 'avatar1', // default avatar
  gamesPlayed: 0,
  hoursPlayed: 0
})

// Avatar options - these will load your images from the assets folder
const avatarOptions = [
  { id: 'avatar1', name: 'Avatar 1', src: '/src/assets/avatars/avatar1.png' },
  { id: 'avatar2', name: 'Avatar 2', src: '/src/assets/avatars/avatar2.png' },
  { id: 'avatar3', name: 'Avatar 3', src: '/src/assets/avatars/avatar3.png' },
  { id: 'avatar4', name: 'Avatar 4', src: '/src/assets/avatars/avatar4.png' },
  { id: 'avatar5', name: 'Avatar 5', src: '/src/assets/avatars/avatar5.png' }
]

// List of your games
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
];

const userScores = ref(games.map(g => ({ ...g, score: null })));
const userGames = ref([]);

// Avatar functions
const getCurrentAvatar = () => {
  const avatar = avatarOptions.find(a => a.id === (profileData.avatar || 'avatar1'))
  return avatar?.src || avatarOptions[0].src
}

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

const selectAvatar = (avatarId) => {
  profileData.avatar = avatarId
}

const saveAvatarSelection = () => {
  showAvatarSelector.value = false
}

const loadProfileData = async () => {
  loading.value = true
  if (currentUser.value) {
    await userStore.fetchUserProfile(currentUser.value.uid)
    if (userStore.profile) {
      Object.assign(profileData, userStore.profile)
      if (!profileData.gamesPlayed) profileData.gamesPlayed = 0
      if (!profileData.hoursPlayed) profileData.hoursPlayed = 0
      if (!profileData.avatar) profileData.avatar = 'avatar1'
      
      // Load user's games list
      if (userStore.profile.games && Array.isArray(userStore.profile.games)) {
        userGames.value = userStore.profile.games
      }
    }
    // Fetch scores for each game
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const scoreDoc = await getDoc(doc(db, `leaderboards/${game.name}/scores`, currentUser.value.uid));
      userScores.value[i].score = scoreDoc.exists() ? scoreDoc.data().score : null;
    }
  }
  loading.value = false
}

onMounted(loadProfileData)
watch(() => currentUser.value, loadProfileData)

function showSnackbarMessage(message) {
  snackbarMessage.value = message
  showSnackbar.value = true
  setTimeout(() => {
    showSnackbar.value = false
  }, 3000) // Hide after 3 seconds
}

const saveProfile = async () => {
  if (!currentUser.value) return
  try {
    const userDoc = doc(db, 'users', currentUser.value.uid)
    await setDoc(userDoc, { ...profileData }, { merge: true })
    await userStore.fetchUserProfile(currentUser.value.uid)
    showSnackbarMessage('Profile saved successfully!')
  } catch (e) {
    showSnackbarMessage('Failed to save profile: ' + e.message)
  }
}
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
</style>

