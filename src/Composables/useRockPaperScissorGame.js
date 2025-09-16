import { ref } from "vue";

export function useRockPaperScissorGame() {
  const playerChoice = ref(null); // Player's choice
  const computerChoice = ref(null); // Computer's choice
  const result = ref(null); // Game result

  const choices = ["Rock", "Paper", "Scissors"]; // Available choices

  const playGame = (choice) => {
    if (!choices.includes(choice)) {
      console.error("Invalid choice:", choice);
      return;
    }

    console.log("Player choice:", choice); // Debugging log
    playerChoice.value = choice; // Set the player's choice
    computerChoice.value = choices[Math.floor(Math.random() * choices.length)]; // Random computer choice
    console.log("Computer choice:", computerChoice.value); // Debugging log
    determineWinner(); // Determine the winner
  };

  const determineWinner = () => {
    if (playerChoice.value === computerChoice.value) {
      result.value = "It's a tie!";
    } else if (
      (playerChoice.value === "Rock" && computerChoice.value === "Scissors") ||
      (playerChoice.value === "Paper" && computerChoice.value === "Rock") ||
      (playerChoice.value === "Scissors" && computerChoice.value === "Paper")
    ) {
      result.value = "You win!";
    } else {
      result.value = "You lose!";
    }
    console.log("Result:", result.value); // Debugging log
  };

  const resetGame = () => {
    console.log("Resetting game..."); // Debugging log
    playerChoice.value = null; // Reset player's choice
    computerChoice.value = null; // Reset computer's choice
    result.value = null; // Reset result
  };

  return {
    playerChoice,
    computerChoice,
    result,
    playGame,
    resetGame,
  };
}
