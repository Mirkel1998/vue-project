<template>
  <div class="user-profile">
    <div class="profile-header">
      <div class="profile-picture-container">
        <img 
          :src="userData.profilePicture || 'https://via.placeholder.com/150x150/6C619E/FFFFFF?text=Profile'" 
          alt="Profile Picture" 
          class="profile-picture"
          @error="handleImageError"
        />
      </div>
      
      <div class="profile-info">
        <h1>{{ userData.displayName }}</h1>
        <p class="username">@{{ userData.username }}</p>
        <p class="join-date">Member since {{ formatDate(userData.joinDate) }}</p>
        <div class="profile-badges">
          <span class="badge genre-badge">{{ userData.favoriteGenre }}</span>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="section">
        <h2>About {{ userData.displayName }}</h2>
        <p class="description">
          {{ userData.description || 'This user hasn\'t added a description yet.' }}
        </p>
      </div>

      <div class="section">
        <h2>Profile Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Location:</label>
            <span>{{ userData.location || 'Not specified' }}</span>
          </div>
          <div class="info-item">
            <label>Favorite Genre:</label>
            <span>{{ userData.favoriteGenre || 'Not specified' }}</span>
          </div>
          <div class="info-item">
            <label>Games Played:</label>
            <span>{{ userData.gamesPlayed }}</span>
          </div>
          <div class="info-item">
            <label>Hours Played:</label>
            <span>{{ userData.hoursPlayed }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Favorite Games</h2>
        <div class="favorite-games">
          <div v-if="userData.favoriteGames.length === 0" class="no-games">
            No favorite games added yet.
          </div>
          <ul v-else class="games-list">
            <li v-for="(game, index) in userData.favoriteGames" :key="index" class="game-item">
              <span>{{ game }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="sendFriendRequest" class="friend-btn">Add Friend</button>
        <button @click="sendMessage" class="message-btn">Send Message</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// In a real app, this would fetch user data based on route params
const userData = reactive({
  displayName: 'Jane Smith',
  username: 'janesmith',
  profilePicture: '',
  description: 'Avid RPG player and streamer. Love exploring vast open worlds and collecting achievements!',
  location: 'Stockholm, Sweden',
  favoriteGenre: 'RPG',
  joinDate: new Date('2022-08-20'),
  level: 35,
  gamesPlayed: 73,
  hoursPlayed: 442,
  favoriteGames: ['Elden Ring', 'The Witcher 3', 'Skyrim', 'Baldur\'s Gate 3']
})

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150x150/6C619E/FFFFFF?text=Profile'
}

const sendFriendRequest = () => {
  alert('Friend request sent!')
}

const sendMessage = () => {
  alert('Message feature would open here')
}
</script>

<style scoped>
.user-profile {
  max-width: 800px;
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
}

.profile-info h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.username {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.join-date {
  color: #888;
  margin: 0 0 1rem 0;
}

.profile-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.level-badge {
  background-color: #28a745;
  color: white;
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
}

.section h2 {
  margin-top: 0;
  color: #333;
}

.description {
  margin: 0;
  padding: 1rem;
  background-color: white;
  border-radius: 4px;
  color: #333;
  line-height: 1.6;
  border-left: 4px solid #6C619E;
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

.info-item span {
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  color: #333;
  border-left: 4px solid #6C619E;
}

.no-games {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.games-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.game-item {
  padding: 0.75rem;
  background-color: white;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  color: #333;
  border-left: 4px solid #6C619E;
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
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
