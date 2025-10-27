<template>
  <main class="community">
    <h1>Community</h1>
    <div v-if="loading" class="loading">Loading users...</div>
    <div v-else>
      <div v-if="users.length === 0" class="no-users">No users found.</div>
      <div class="user-list">
        <div v-for="user in users" :key="user.uid" class="user-item">
          <div class="user-columns">
            <!-- Left: Profile Info -->
            <div class="user-info-col">
              <div class="user-card-header">
                <div class="profile-picture-container">
                  <div class="profile-picture">
                    <img :src="getUserAvatar(user)" :alt="user.username" />
                  </div>
                </div>
                <div class="user-main">
                  <span class="username">{{ user.username }}</span>
                </div>
              </div>
              <div class="user-details">
                <div v-if="user.description"><span class="details-label">About:</span> {{ user.description }}</div>
                <div v-if="user.location"><span class="details-label">Location:</span> {{ user.location }}</div>
                <div v-if="user.favoriteGenre"><span class="details-label">Favorite Genre:</span> {{ user.favoriteGenre }}</div>
              </div>
              <button @click="toggleScores(user)" class="show-scores-btn">
                {{ user.showScores ? 'Hide' : 'Show More' }}
              </button>
            </div>
            <!-- Right: Game Scores (always present, but only filled if showScores) -->
            <div class="user-scores-col">
              <div v-if="user.showScores">
                <div v-if="user.scoresLoading" class="loading">Loading scores...</div>
                <div v-else>
                  <h4 class="games-title">Game Scores:</h4>
                  <div class="scores-list">
                    <div v-for="score in user.scores" :key="score.name" class="score-item">
                      <span class="game-name">{{ score.displayName }}</span>
                      <span class="game-score">{{ score.score !== null ? score.score : '—' }}</span>
                    </div>
                  </div>
                  
                  <!-- Add user's games section -->
                  <div v-if="user.games && user.games.length" class="user-games-section">
                    <h4 class="games-title">Favorite Games:</h4>
                    <div class="user-games-list">
                      <div v-for="game in user.games" :key="game.id" class="user-game-item">
                        <img :src="game.background_image" :alt="game.name" class="game-thumb" />
                        <div class="game-info">
                          <div class="game-title">{{ game.name }}</div>
                          <div class="game-meta">
                            <span v-if="game.released">{{ game.released }}</span>
                            <span v-if="game.publisher"> • {{ game.publisher }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="user.showScores" class="no-user-games">
                    <p>No games added yet.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/Composables/useFirebase'
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'

const { currentUser } = useAuth()
const userStore = useUserStore()
const users = ref([])
const loading = ref(true)

// Check if current user is admin
const isAdmin = computed(() => {
  const username = userStore.profile?.username
  return username === 'Mikkel' || username === 'Mikkel (admin)'
})

// Avatar options - same as in ProfileView
const avatarOptions = [
  { id: 'avatar1', name: 'Avatar 1', src: '/avatars/avatar1.png' },
  { id: 'avatar2', name: 'Avatar 2', src: '/avatars/avatar2.png' },
  { id: 'avatar3', name: 'Avatar 3', src: '/avatars/avatar3.png' },
  { id: 'avatar4', name: 'Avatar 4', src: '/avatars/avatar4.png' },
  { id: 'avatar5', name: 'Avatar 5', src: '/avatars/avatar5.png' }
]

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

// Function to get user avatar
const getUserAvatar = (user) => {
  const avatar = avatarOptions.find(a => a.id === (user.avatar || 'avatar1'))
  return avatar?.src || avatarOptions[0].src
}

onMounted(async () => {
  const snap = await getDocs(collection(db, "users"))
  const seen = new Set()
  users.value = snap.docs
    .map(doc => ({
      uid: doc.id,
      showScores: false,
      scores: [],
      scoresLoading: false,
      ...doc.data()
    }))
    .filter(user => {
      if (!user.username) return false
      if (!/^[A-Z]/.test(user.username)) return false
      if (seen.has(user.username)) return false
      seen.add(user.username)
      return true
    })
  loading.value = false
})

async function toggleScores(user) {
  user.showScores = !user.showScores
  if (user.showScores && user.scores.length === 0 && !user.scoresLoading) {
    user.scoresLoading = true
    
    // Fetch scores
    user.scores = await Promise.all(games.map(async (game) => {
      const scoreDoc = await getDoc(doc(db, `leaderboards/${game.name}/scores`, user.uid))
      return {
        name: game.name,
        displayName: game.displayName,
        score: scoreDoc.exists() ? scoreDoc.data().score : null
      }
    }))
    
    // Fetch user's full profile to get their games list
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists() && userDoc.data().games) {
      user.games = userDoc.data().games
    } else {
      user.games = []
    }
    
    user.scoresLoading = false
  }
}
</script>

<style scoped>
.community {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  text-align: left;
}

h1 {
  max-width: 650px;
  margin: 0 auto 2rem auto;
  color: white;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0 0 0;
  align-items: stretch;
}

.user-item {
  background-color: #C0C0C0;
  border-left: 4px solid #6C619E;
  padding: 1.5rem;
  width: 100%;
  max-width: 650px;
  min-width: 350px;
  box-sizing: border-box;
  margin: 0 auto;
  font-family: monospace;
}

.user-columns {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
  width: 100%;
}

.user-info-col {
  flex: 1.2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-scores-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.profile-picture-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-picture {
  width: 60px;
  height: 60px;
  border: 2px solid #6C619E;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #444;
}

.details-label {
  font-weight: bold;
  color: #222;
  margin-right: 0.25em;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 0.25rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #eee;
}

.game-name {
  color: #333;
}

.game-score {
  color: #6C619E;
  font-weight: bold;
}

.username {
  font-weight: bold;
  color: #6C619E;
  font-size: 1.3rem;
}

.user-desc {
  color: #555;
  font-size: 1rem;
}

.loading, .no-users {
  margin-top: 2rem;
  color: #888;
  text-align: left;
}

.show-scores-btn {
  background: none;
  border: none;
  color: #6C619E;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  text-align: left;
}

.user-games-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.games-title {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.user-games-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.user-game-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #eee;
}

.game-thumb {
  width: 40px;
  height: 25px;
  object-fit: cover;
  flex-shrink: 0;
}

.game-info {
  flex-grow: 1;
  min-width: 0;
}

.game-title {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-meta {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-user-games {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
  color: #666;
  text-align: center;
}

.no-user-games p {
  margin: 0;
  font-size: 0.9rem;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .community {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
    text-align: center;
    max-width: 100%;
    margin-bottom: 1.5rem;
  }

  .user-list {
    gap: 1rem;
    margin: 1rem 0 0 0;
  }

  .user-item {
    min-width: auto;
    max-width: 100%;
    padding: 1rem;
  }

  .user-columns {
    flex-direction: column;
    gap: 1rem;
  }

  .user-info-col,
  .user-scores-col {
    flex: 1;
  }

  .user-card-header {
    gap: 1rem;
    flex-direction: column;
    text-align: center;
  }

  .profile-picture {
    width: 80px;
    height: 80px;
  }

  .username {
    font-size: 1.2rem;
    text-align: center;
  }

  .user-details {
    text-align: center;
    font-size: 0.9rem;
  }

  .show-scores-btn {
    text-align: center;
    font-size: 0.9rem;
    padding: 0.5rem;
    background-color: #6C619E;
    color: white;
    width: 100%;
    margin-top: 0.5rem;
  }

  .games-title {
    font-size: 1rem;
    text-align: center;
  }

  .score-item {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }

  .user-games-list {
    max-height: 150px;
  }

  .user-game-item {
    padding: 0.4rem;
  }

  .game-title {
    font-size: 0.85rem;
  }

  .game-meta {
    font-size: 0.75rem;
  }
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .community {
    padding: 0.5rem;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  .user-item {
    padding: 0.8rem;
  }

  .user-card-header {
    gap: 0.8rem;
  }

  .profile-picture {
    width: 70px;
    height: 70px;
  }

  .username {
    font-size: 1.1rem;
  }

  .user-details {
    font-size: 0.85rem;
  }

  .show-scores-btn {
    font-size: 0.85rem;
    padding: 0.4rem;
  }

  .games-title {
    font-size: 0.95rem;
  }

  .score-item {
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
  }

  .user-games-list {
    max-height: 120px;
  }

  .game-thumb {
    width: 35px;
    height: 22px;
  }

  .game-title {
    font-size: 0.8rem;
  }

  .game-meta {
    font-size: 0.7rem;
  }
}
</style>
