import { ref } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useGuessTheColorGame() {
  const hexValue = ref("");
  const colorOptions = ref([]);
  const correctIndex = ref(-1);
  const message = ref("");
  const score = ref(0);

  const { submitScore, fetchLeaderboard } = useLeaderboard("GuessTheColor");
  const { currentUser } = useAuth();
  const userStore = useUserStore();

  const generateRandomHexColor = () => {
    const randomHex = () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
    return `#${randomHex()}${randomHex()}${randomHex()}`;
  };

  const initializeGame = () => {
    message.value = "";
    colorOptions.value = Array.from({ length: 3 }, generateRandomHexColor);
    correctIndex.value = Math.floor(Math.random() * colorOptions.value.length);
    hexValue.value = colorOptions.value[correctIndex.value];
    score.value = 0;
  };

  const selectColor = async (index) => {
    if (index === correctIndex.value) {
      message.value = "Correct!";
      score.value += 1;
      // Start a new round automatically
      setTimeout(() => {
        colorOptions.value = Array.from({ length: 3 }, generateRandomHexColor);
        correctIndex.value = Math.floor(Math.random() * colorOptions.value.length);
        hexValue.value = colorOptions.value[correctIndex.value];
        message.value = "";
      }, 800);
      // Submit score after each correct guess
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
      message.value = "Try Again!";
    }
  };

  return {
    hexValue,
    colorOptions,
    message,
    score,
    initializeGame,
    selectColor,
  };
}
