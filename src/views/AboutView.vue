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

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>
