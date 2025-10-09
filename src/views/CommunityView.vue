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
                    <svg width="60" height="60" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="38" fill="#fff"/>
                      <circle cx="40" cy="32" r="16" fill="#6C619E"/>
                      <ellipse cx="40" cy="62" rx="22" ry="12" fill="#6C619E"/>
                    </svg>
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
                {{ user.showScores ? 'Hide Scores' : 'Show Scores' }}
              </button>
            </div>
            <!-- Right: Game Scores (always present, but only filled if showScores) -->
            <div class="user-scores-col">
              <div v-if="user.showScores">
                <div v-if="user.scoresLoading" class="loading">Loading scores...</div>
                <div v-else class="scores-list">
                  <div v-for="score in user.scores" :key="score.name" class="score-item">
                    <span class="game-name">{{ score.displayName }}</span>
                    <span class="game-score">{{ score.score !== null ? score.score : '—' }}</span>
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
import { ref, onMounted } from 'vue'
import { db } from '@/Composables/useFirebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

const users = ref([])
const loading = ref(true)

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
    user.scores = await Promise.all(games.map(async (game) => {
      const scoreDoc = await getDoc(doc(db, `leaderboards/${game.name}/scores`, user.uid))
      return {
        name: game.name,
        displayName: game.displayName,
        score: scoreDoc.exists() ? scoreDoc.data().score : null
      }
    }))
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
.user-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0 0 0;
  align-items: stretch;
}
.user-item {
  background-color: #C0C0C0;
  border-radius: 8px;
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
  border-radius: 50%;
  background: #6C619E;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border-radius: 4px;
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
</style>
