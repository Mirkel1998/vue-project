import { ref } from "vue";

export function useGuessTheColorGame() {
  const hexValue = ref("");
  const colorOptions = ref([]);
  const correctIndex = ref(-1);
  const message = ref("");

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
  };

  const selectColor = (index) => {
    if (index === correctIndex.value) {
      message.value = "Correct!";
    } else {
      message.value = "Try Again!";
    }
  };

  return {
    hexValue,
    colorOptions,
    message,
    initializeGame,
    selectColor,
  };
}
