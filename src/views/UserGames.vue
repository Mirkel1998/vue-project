<template>
  <div class="user-games">
    <h1>My Game List</h1>
    <div class="search-bar">
      <input
        type="text"
        placeholder="Search for a game..."
        v-model="searchQuery"
        @keyup.enter="searchGames"
      />
      <button @click="searchGames">Search</button>
      <button v-if="searchResults.length" @click="clearSearchResults" class="clear-btn">Clear</button>
    </div>

    <div v-if="searchResults.length" class="search-results">
      <h3>Search Results:</h3>
      <div class="card-list">
        <div
          v-for="game in searchResults"
          :key="game.id"
          class="game-card"
        >
          <img :src="game.background_image" :alt="game.name" class="game-thumb" />
          <div class="game-title">{{ game.name }}</div>
          <div class="game-meta">
            <span v-if="game.released">Year: {{ game.released }}</span><br>
            <span v-if="game.platforms && game.platforms.length">Platforms: {{ game.platforms.join(', ') }}</span><br>
            <span v-if="game.publisher">Publisher: {{ game.publisher }}</span>
          </div>
          <button @click="addGame(game)">Add</button>
        </div>
      </div>
    </div>

    <h3>Your Games:</h3>
    <div class="card-list">
      <div
        v-for="game in userGames"
        :key="game.id"
        class="game-card"
      >
        <img :src="game.background_image" :alt="game.name" class="game-thumb" />
        <div class="game-title">{{ game.name }}</div>
        <div class="game-meta">
          <span v-if="game.released">Year: {{ game.released }}</span><br>
          <span v-if="game.platforms && game.platforms.length">Platforms: {{ game.platforms.join(', ') }}</span><br>
          <span v-if="game.publisher">Publisher: {{ game.publisher }}</span>
        </div>
        <button @click="removeGame(game.id)">Remove</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'
import { db } from '@/Composables/useFirebase'
import { doc, setDoc } from 'firebase/firestore'

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY
const searchQuery = ref('')
const searchResults = ref([])
const userGames = ref([])

const { currentUser } = useAuth()
const userStore = useUserStore()

async function searchGames() {
  if (!searchQuery.value.trim()) return
  const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(searchQuery.value)}`
  const res = await fetch(url)
  const data = await res.json()
  searchResults.value = (data.results || []).map(game => ({
    id: game.id,
    name: game.name,
    background_image: game.background_image,
    released: game.released ? game.released.slice(0, 4) : '', // Year only
    platforms: game.platforms ? game.platforms.map(p => p.platform.name) : [],
    publisher: game.publishers && game.publishers.length ? game.publishers[0].name : ''
  }))
}

function clearSearchResults() {
  searchResults.value = []
}

function addGame(game) {
  if (!userGames.value.find(g => g.id === game.id)) {
    userGames.value.push(game)
  }
}

function removeGame(id) {
  userGames.value = userGames.value.filter(g => g.id !== id)
}

watch(userGames, async (games) => {
  if (currentUser.value) {
    const userDoc = doc(db, 'users', currentUser.value.uid)
    await setDoc(userDoc, { games }, { merge: true })
  }
}, { deep: true })

onMounted(async () => {
  if (currentUser.value) {
    await userStore.fetchUserProfile(currentUser.value.uid)
    if (userStore.profile && Array.isArray(userStore.profile.games)) {
      userGames.value = userStore.profile.games
    }
  }
})
</script>

<style scoped>
.user-games {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.clear-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-btn:hover {
  background: #b52a37;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.game-card {
  background: #C0C0C0;
  border-radius: 8px;
  border-left: 4px solid #6C619E;
  box-shadow: none;
  padding: 1.5rem 1rem 1rem 1rem;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  color: #111;
}

.game-thumb {
  width: 180px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.game-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #111;
}

.game-meta {
  font-size: 0.95em;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

button {
  margin-top: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 1rem;
  background-color: #6C619E;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #554d7a;
}
</style>
