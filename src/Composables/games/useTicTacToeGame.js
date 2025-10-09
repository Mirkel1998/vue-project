import { ref } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useTicTacToeGame() {
  const board = ref(Array(9).fill(null)); // 3x3 grid represented as a 1D array
  const currentPlayer = ref("X"); // Player starts as "X"
  const winner = ref(null); // Track the winner
  const message = ref("");
  const score = ref(0); // Track player wins

  const { submitScore, fetchLeaderboard } = useLeaderboard("TicTacToe");
  const { currentUser } = useAuth();
  const userStore = useUserStore();

  const checkWinner = () => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6], // Diagonals
    ];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board.value[a] && board.value[a] === board.value[b] && board.value[a] === board.value[c]) {
        return board.value[a];
      }
    }

    return board.value.every(cell => cell) ? "Draw" : null; // Check for a draw
  };

  const makeMove = async (index) => {
    if (board.value[index] || winner.value) return; // Ignore if cell is occupied or game is over

    board.value[index] = currentPlayer.value;
    winner.value = checkWinner();

    if (winner.value) {
      if (winner.value === "Draw") {
        message.value = "It's a draw!";
      } else {
        message.value = `${winner.value} wins!`;
        if (winner.value === "X") {
          score.value += 1; // Only increment score for player wins
          // Submit score to leaderboard
          if (currentUser.value && !userStore.profile) {
            await userStore.fetchUserProfile(currentUser.value.uid);
          }
          if (currentUser.value && userStore.profile && userStore.profile.username) {
            await submitScore(
              currentUser.value.uid,
              userStore.profile.username,
              score.value
            );
            fetchLeaderboard();
          }
        }
      }
    } else {
      currentPlayer.value = currentPlayer.value === "X" ? "O" : "X"; // Switch player
      if (currentPlayer.value === "O") makeComputerMove();
    }
  };

  const makeComputerMove = () => {
    const emptyCells = board.value
      .map((cell, index) => (cell === null ? index : null))
      .filter(index => index !== null);

    if (emptyCells.length > 0) {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      makeMove(randomIndex);
    }
  };

  const resetGame = () => {
    board.value = Array(9).fill(null);
    currentPlayer.value = "X";
    winner.value = null;
    message.value = "";
  };

  return {
    board,
    currentPlayer,
    winner,
    message,
    score,
    makeMove,
    resetGame,
  };
}
