<template>
  <div class="about">
    <h1>This is an about page grabbing stuff from Firebase</h1>
    <h3>Games:</h3>
    <input type="text" placeholder="Enter game title" v-model="newGameTitle" />
    <button @click="addGame">Add Game</button>
    <div v-if="loading">Loading games...</div> <!-- Show loading message -->
    <ul v-else>
      <li v-for="game in games" :key="game.id">
        {{ game.gameName }}
        <button @click="deleteGame(game.id)">Delete Game</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useGames } from "@composables/useGames";

const { games, newGameTitle, loading, addGame, deleteGame } = useGames(); // Include loading state
</script>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}

input[type="text"] {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: var(--font-main);
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  transition: border-color 0.2s;
}

input[type="text"]:focus {
  outline: none;
  border-color: #6C619E;
}

button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: var(--font-main);
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
