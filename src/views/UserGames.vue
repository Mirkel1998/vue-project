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

    <!-- Snackbar notification -->
    <div v-if="showSnackbar" class="snackbar" :class="{ show: showSnackbar }">
      {{ snackbarMessage }}
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

// Snackbar state
const showSnackbar = ref(false)
const snackbarMessage = ref('')

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
    showSnackbarMessage(`"${game.name}" added to your games!`)
  } else {
    showSnackbarMessage(`"${game.name}" is already in your games!`)
  }
}

function removeGame(id) {
  const game = userGames.value.find(g => g.id === id)
  userGames.value = userGames.value.filter(g => g.id !== id)
  if (game) {
    showSnackbarMessage(`"${game.name}" removed from your games!`)
  }
}

function showSnackbarMessage(message) {
  snackbarMessage.value = message
  showSnackbar.value = true
  setTimeout(() => {
    showSnackbar.value = false
  }, 3000) // Hide after 3 seconds
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
  position: relative;
}

h1 {
  color: white;
}

h3 {
  color: white;
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

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ddd;
}

.clear-btn {
  background: #dc3545;
  color: white;
  border: none;
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
  justify-content: center;
}

.game-card {
  background: #C0C0C0;
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
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #554d7a;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .user-games {
    padding: 1rem;
    max-width: 100%;
  }

  h1 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.3rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .search-bar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-bar input {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .search-bar button {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .card-list {
    gap: 1rem;
    justify-content: center;
  }

  .game-card {
    width: 100%;
    max-width: 300px;
    padding: 1rem;
  }

  .game-thumb {
    width: 150px;
    height: 85px;
  }

  .game-title {
    font-size: 1rem;
  }

  .game-meta {
    font-size: 0.85em;
  }

  button {
    padding: 0.5rem 1.2rem;
    font-size: 0.9rem;
    width: 100%;
    max-width: 120px;
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
  .user-games {
    padding: 0.5rem;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.2rem;
  }

  .game-card {
    max-width: 280px;
    padding: 0.8rem;
  }

  .game-thumb {
    width: 130px;
    height: 75px;
  }

  .game-title {
    font-size: 0.95rem;
  }

  .game-meta {
    font-size: 0.8em;
  }

  button {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }

  .snackbar {
    padding: 0.7rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
