<template>
  <div class="profile" v-if="!loading && profileData">
    <div class="profile-header">
      <div class="profile-picture-container">
        <div class="profile-picture" style="width:150px;height:150px;border-radius:50%;background:#6C619E;display:flex;align-items:center;justify-content:center;">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="#fff"/>
            <circle cx="40" cy="32" r="16" fill="#6C619E"/>
            <ellipse cx="40" cy="62" rx="22" ry="12" fill="#6C619E"/>
          </svg>
        </div>
      </div>
      <div class="profile-info" style="display: flex; align-items: center; gap: 1rem;">
        <h1 style="margin: 0;">
          <span class="username-display" style="font-size:2rem; color:#ffffff;">
            {{ profileData.username }}
          </span>
        </h1>
        <div v-if="profileData.favoriteGenre" class="profile-badges">
          <span class="badge genre-badge">{{ profileData.favoriteGenre }}</span>
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
const profileData = reactive({
  username: '',
  description: '',
  location: '',
  favoriteGenre: '',
  gamesPlayed: 0,
  hoursPlayed: 0
})

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

const loadProfileData = async () => {
  loading.value = true
  if (currentUser.value) {
    await userStore.fetchUserProfile(currentUser.value.uid)
    if (userStore.profile) {
      Object.assign(profileData, userStore.profile)
      if (!profileData.gamesPlayed) profileData.gamesPlayed = 0
      if (!profileData.hoursPlayed) profileData.hoursPlayed = 0
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

const saveProfile = async () => {
  if (!currentUser.value) return
  try {
    const userDoc = doc(db, 'users', currentUser.value.uid)
    await setDoc(userDoc, { ...profileData }, { merge: true })
    await userStore.fetchUserProfile(currentUser.value.uid)
    alert('Profile saved successfully!')
  } catch (e) {
    alert('Failed to save profile: ' + e.message)
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
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #6C619E;
  margin-bottom: 1rem;
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
  border-radius: 20px;
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
  border-radius: 8px;
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
  border-radius: 4px;
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
  border-radius: 4px;
  font-family: monospace;
}

.game-name {
  color: #333;
}

.game-score {
  color: #6C619E;
  font-weight: bold;
}
</style>

