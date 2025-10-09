<template>
  <div class="leaderboard">
    <h3>Leaderboard</h3>
    <ol>
      <li v-for="entry in scores" :key="entry.userId">
        {{ entry.username || entry.userId }}: {{ entry.score }}
      </li>
    </ol>
  </div>
</template>

<script setup>
import { onMounted, defineExpose } from 'vue'
import { useLeaderboard } from '@/Composables/useLeaderboard'

const props = defineProps({ game: String })
const { scores, fetchLeaderboard } = useLeaderboard(props.game)

onMounted(() => {
  fetchLeaderboard()
})

// Expose the refresh method
defineExpose({ fetchLeaderboard })
</script>

<style scoped>
.leaderboard {
  color: #000000;
}
</style>
