<script setup>
import { ref } from 'vue'
import { usePingpongGame } from "@/Composables/games/usePingpongGame";
import { useRockPaperScissorGame } from "@/Composables/games/useRockPaperScissorGame";
import { useQuizGame } from "@/Composables/games/useQuizGame";
import { useAvoidEnemyGame } from "@/Composables/games/useAvoidEnemyGame";
import { useFlappyBoxGame } from "@/Composables/games/useFlappyBoxGame";
import { useSpaceShooterGame } from "@/Composables/games/useSpaceShooterGame";
import { useMazeEscapeGame } from "@/Composables/games/useMazeEscapeGame";
import { useGuessTheColorGame } from "@/Composables/games/useGuessTheColorGame";
import { useTicTacToeGame } from "@/Composables/games/useTicTacToeGame";
import { useSnakeGame } from "@/Composables/games/useSnakeGame";
import LeaderBoard from "@/components/LeaderBoard.vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

const pingpongLeaderboardRef = ref(null)
const rpsLeaderboardRef = ref(null)

const {
  canvasRef: pingpongCanvasRef,
  gameCardRef: pingpongGameCardRef,
  isGameRunning: isPingpongRunning,
  startGame: startPingpong,
  stopGame: stopPingpong,
  score: pingpongScore,
} = usePingpongGame();

const {
  playerChoice,
  computerChoice,
  result,
  score: rpsScore,
  playGame,
  resetGame,
} = useRockPaperScissorGame();

const {
  questions,
  currentQuestionIndex,
  score: quizScore,
  isQuizFinished,
  selectAnswer,
  resetQuiz,
} = useQuizGame();

const {
  canvasRef: avoidEnemyCanvasRef,
  gameCardRef: avoidEnemyGameCardRef,
  isGameRunning: isAvoidEnemyRunning,
  startGame: startAvoidEnemy,
  resetGame: resetAvoidEnemy,
  score: avoidEnemyScore,
} = useAvoidEnemyGame();

const {
  canvasRef: flappyBoxCanvasRef,
  gameCardRef: flappyBoxGameCardRef,
  isGameRunning: isFlappyBoxRunning,
  startGame: startFlappyBox,
  resetGame: resetFlappyBox,
  score: flappyBoxScore,
} = useFlappyBoxGame();

const {
  canvasRef: spaceShooterCanvasRef,
  gameCardRef: spaceShooterGameCardRef,
  isGameRunning: isSpaceShooterRunning,
  startGame: startSpaceShooter,
  resetGame: resetSpaceShooter,
  score: spaceShooterScore,
} = useSpaceShooterGame();

const {
  canvasRef: mazeEscapeCanvasRef,
  gameCardRef: mazeEscapeGameCardRef,
  isGameRunning: isMazeEscapeRunning,
  startGame: startMazeEscape,
  resetGame: resetMazeEscape,
  score: mazeEscapeScore,
} = useMazeEscapeGame();

const {
  hexValue,
  colorOptions,
  message,
  score,
  initializeGame: initializeGuessTheColor,
  selectColor,
} = useGuessTheColorGame();

const {
  board,
  currentPlayer,
  message: ticTacToeMessage,
  score: ticTacToeScore,
  makeMove,
  resetGame: resetTicTacToe,
} = useTicTacToeGame();

const {
  canvasRef: snakeCanvasRef,
  gameCardRef: snakeGameCardRef,
  isGameRunning: isSnakeRunning,
  startGame: startSnake,
  resetGame: resetSnake,
  score: snakeScore,
} = useSnakeGame();

pingpongLeaderboardRef.value?.fetchLeaderboard()
</script>

<template>
  <main>
    <h1>Game Hub</h1>
    <div class="game-grid">
      <div class="game-card" ref="pingpongGameCardRef">
        <h2>Ping Pong</h2>
        <canvas ref="pingpongCanvasRef"></canvas>
        <div class="score-display">
          Score: {{ pingpongScore }}
        </div>
        <div class="controls">
          <button @click="startPingpong" :disabled="isPingpongRunning">Start</button>
          <button @click="stopPingpong" :disabled="!isPingpongRunning">Stop</button>
        </div>
        <LeaderBoard ref="pingpongLeaderboardRef" :game="'Pingpong'" />
      </div>
      <div class="game-card">
        <h2>Rock Paper Scissors</h2>
        <div class="choices">
          <button @click="playGame('Rock')">Rock</button>
          <button @click="playGame('Paper')">Paper</button>
          <button @click="playGame('Scissors')">Scissors</button>
        </div>
        <div class="results">
          <p><strong>Player Choice:</strong> {{ playerChoice || 'None' }}</p>
          <p><strong>Computer Choice:</strong> {{ computerChoice || 'None' }}</p>
          <p><strong>Result:</strong> {{ result || 'No result yet' }}</p>
        </div>
        <div class="score-display">
          Score: {{ rpsScore }}
        </div>
        <button @click="resetGame" class="reset-button">Reset</button>
        <LeaderBoard :game="'RockPaperScissors'" />
      </div>
      <div class="game-card">
        <h2>Star Wars Quiz</h2>
        <div v-if="!isQuizFinished">
          <p class="quiz-question">
            <strong>Question {{ currentQuestionIndex + 1 }}:</strong>
            {{ questions[currentQuestionIndex].question }}
          </p>
          <div class="choices">
            <button
              v-for="(option, index) in questions[currentQuestionIndex].options"
              :key="index"
              @click="selectAnswer(index)"
            >
              {{ option }}
            </button>
          </div>
          <div class="score-display">
            Score: {{ quizScore }}
          </div>
        </div>
        <div v-else>
          <p class="quiz-result-title"><strong>Quiz Finished!</strong></p>
          <p class="quiz-result-score">You scored {{ quizScore }} out of {{ questions.length }}.</p>
          <button @click="resetQuiz" class="reset-button">Play Again</button>
        </div>
        <LeaderBoard :game="'QuizGame'" />
      </div>
      <div class="game-card" ref="avoidEnemyGameCardRef">
        <h2>Avoid the Enemy</h2>
        <canvas ref="avoidEnemyCanvasRef"></canvas>
        <div class="controls">
          <button @click="startAvoidEnemy" :disabled="isAvoidEnemyRunning">Start</button>
          <button @click="resetAvoidEnemy" :disabled="isAvoidEnemyRunning">Reset</button>
        </div>
        <div class="score-display">
          Score: {{ avoidEnemyScore }}
        </div>
        <LeaderBoard :game="'AvoidEnemy'" />
      </div>
      <div class="game-card" ref="flappyBoxGameCardRef">
        <h2>Flappy Box</h2>
        <canvas ref="flappyBoxCanvasRef"></canvas>
        <div class="score-display">
          Score: {{ flappyBoxScore }}
        </div>
        <div class="controls">
          <button @click="startFlappyBox" :disabled="isFlappyBoxRunning">Start</button>
          <button @click="resetFlappyBox" :disabled="isFlappyBoxRunning">Reset</button>
        </div>
        <LeaderBoard :game="'FlappyBox'" />
      </div>
      <div class="game-card" ref="spaceShooterGameCardRef">
        <h2>Space Shooter</h2>
        <canvas ref="spaceShooterCanvasRef"></canvas>
        <div class="score-display">
          Score: {{ spaceShooterScore }}
        </div>
        <div class="controls">
          <button @click="startSpaceShooter" :disabled="isSpaceShooterRunning">Start</button>
          <button @click="resetSpaceShooter" :disabled="isSpaceShooterRunning">Reset</button>
        </div>
        <LeaderBoard :game="'SpaceShooter'" />
      </div>
      <div class="game-card" ref="mazeEscapeGameCardRef">
        <h2>Maze Escape</h2>
        <canvas ref="mazeEscapeCanvasRef"></canvas>
        <div class="controls">
          <button @click="startMazeEscape" :disabled="isMazeEscapeRunning">Start</button>
          <button @click="resetMazeEscape" :disabled="isMazeEscapeRunning">Reset</button>
        </div>
        <div class="score-display">
          Score: {{ mazeEscapeScore }}
        </div>
        <LeaderBoard :game="'MazeEscape'" />
      </div>
      <div class="game-card">
        <h2>Guess the Color (Hex)</h2>
        <p>Hex Value: <strong>{{ hexValue }}</strong></p>
        <div class="color-options">
          <div
            v-for="(color, index) in colorOptions"
            :key="index"
            :style="{ backgroundColor: color }"
            class="color-swatch"
            @click="selectColor(index)"
          ></div>
        </div>
        <div class="score-display">
          Score: {{ score }}
        </div>
        <p>{{ message }}</p>
        <button @click="initializeGuessTheColor">New Game</button>
        <LeaderBoard :game="'GuessTheColor'" />
      </div>
      <div class="game-card">
        <h2>Tic-Tac-Toe</h2>
        <div class="tic-tac-toe-board">
          <div
            v-for="(cell, index) in board"
            :key="index"
            class="tic-tac-toe-cell"
            @click="makeMove(index)"
          >
            {{ cell }}
          </div>
        </div>
        <div class="score-display">
          Score: {{ ticTacToeScore }}
        </div>
        <p>{{ ticTacToeMessage }}</p>
        <button @click="resetTicTacToe">New Game</button>
        <LeaderBoard :game="'TicTacToe'" />
      </div>
      <div class="game-card" ref="snakeGameCardRef">
        <h2>Snake</h2>
        <canvas ref="snakeCanvasRef"></canvas>
        <div class="score-display">
          Score: {{ snakeScore }}
        </div>
        <div class="controls">
          <button @click="startSnake" :disabled="isSnakeRunning">Start</button>
          <button @click="resetSnake" :disabled="isSnakeRunning">Reset</button>
        </div>
        <LeaderBoard :game="'Snake'" />
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.game-grid {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2rem;
  flex-wrap: wrap;
}

.game-card {
  background-color: #C0C0C0;
  border: 1px solid #aaa;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

canvas {
  display: block;
  border: 1px solid #ddd;
  width: 100%;
  height: 250px;
}

button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: var(--font-main);
  background-color: #6C619E;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #554d7a;
}

.quiz-question {
  margin: 0.5rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.quiz-result-title {
  margin: 1rem 0;
  color: #4a148c;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

.quiz-result-score {
  margin: 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.reset-button {
  margin-top: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 1rem 0;
}

.grid-cell {
  width: 80px;
  height: 80px;
  background-color: #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.grid-cell.active {
  background-color: #007bff;
}

.grid-cell:hover {
  background-color: #bbb;
}

.color-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.color-swatch {
  width: 80px;
  height: 80px;
  border: 2px solid #333;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

p {
  color: #333;
}

.tic-tac-toe-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  width: 150px;
  margin: 1rem auto;
}

.tic-tac-toe-cell {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #6C619E;
  border: 1px solid #333;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tic-tac-toe-cell:hover {
  background-color: #ddd;
}

.score-display {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #6C619E;
}
</style>

