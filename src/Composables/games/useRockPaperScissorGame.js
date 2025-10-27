import { ref } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useRockPaperScissorGame() {
  const playerChoice = ref(null); // Player's choice
  const computerChoice = ref(null); // Computer's choice
  const result = ref(null); // Game result
  const score = ref(0); // Track player's score (wins)

  const { currentUser } = useAuth();
  const userStore = useUserStore();
  const { submitScore, fetchLeaderboard } = useLeaderboard("RockPaperScissors");

  const choices = ["Rock", "Paper", "Scissors"]; // Available choices

  const playGame = (choice) => {
    if (!choices.includes(choice)) {
      console.error("Invalid choice:", choice);
      return;
    }

    playerChoice.value = choice;
    computerChoice.value = choices[Math.floor(Math.random() * choices.length)];
    determineWinner();
  };

  const determineWinner = async () => {
    if (playerChoice.value === computerChoice.value) {
      result.value = "It's a tie!";
    } else if (
      (playerChoice.value === "Rock" && computerChoice.value === "Scissors") ||
      (playerChoice.value === "Paper" && computerChoice.value === "Rock") ||
      (playerChoice.value === "Scissors" && computerChoice.value === "Paper")
    ) {
      result.value = "You win!";
      score.value += 1;
      // Submit score and refresh leaderboard just like Ping Pong
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
    } else {
      result.value = "You lose!";
      // Reset score when player loses
      score.value = 0;
    }
  };

  const resetGame = () => {
    playerChoice.value = null;
    computerChoice.value = null;
    result.value = null;
    score.value = 0;
  };

  return {
    playerChoice,
    computerChoice,
    result,
    score,
    playGame,
    resetGame,
  };
}
