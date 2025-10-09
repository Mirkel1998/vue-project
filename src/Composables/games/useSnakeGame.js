import { ref, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useSnakeGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  const score = ref(0);
  let animationFrameId;

  let ctx, width, height;
  let snake, food, direction, gridSize, cellSize;
  let touchStartX = 0;
  let touchStartY = 0;

  const { submitScore } = useLeaderboard("Snake");
  const { currentUser } = useAuth();
  const userStore = useUserStore();
  const instance = getCurrentInstance();

  const initializeGame = () => {
    const canvas = canvasRef.value;
    const gameCard = gameCardRef.value;
    ctx = canvas.getContext("2d");

    // Set canvas dimensions to match the game card
    const renderedWidth = gameCard.offsetWidth;
    const renderedHeight = gameCard.offsetHeight;

    // Set the canvas's internal resolution to match its rendered size
    canvas.width = renderedWidth;
    canvas.height = renderedHeight;

    // Initialize game variables
    width = canvas.width;
    height = canvas.height;
    gridSize = 20;
    cellSize = Math.min(width, height) / gridSize;

    snake = [{ x: 10, y: 10 }];
    food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    direction = { x: 0, y: 0 };
    score.value = 0;
  };

  const drawSnake = () => {
    ctx.fillStyle = "#6C619E";
    snake.forEach((segment) => {
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
  };

  const drawFood = () => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
  };

  const moveSnake = () => {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check for collisions with walls
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      stopGame();
      return;
    }

    // Check for collisions with itself
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      stopGame();
      return;
    }

    // Add new head to the snake
    snake.unshift(head);

    // Check if the snake eats the food
    if (head.x === food.x && head.y === food.y) {
      food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
      score.value += 1;
    } else {
      snake.pop();
    }
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawSnake();
    drawFood();
    moveSnake();
    animationFrameId = setTimeout(draw, 150);
  };

  const startGame = () => {
    if (!isGameRunning.value) {
      isGameRunning.value = true;
      direction = { x: 1, y: 0 };
      score.value = 0;
      draw();
    }
  };

  const stopGame = async () => {
    isGameRunning.value = false;
    clearTimeout(animationFrameId);
    await submitIfReady();
  };

  const submitIfReady = async () => {
    if (currentUser.value && !userStore.profile) {
      await userStore.fetchUserProfile(currentUser.value.uid);
    }
    if (currentUser.value && userStore.profile && userStore.profile.username) {
      await submitScore(
        currentUser.value.uid,
        userStore.profile.username,
        score.value
      );
    }
  };

  const resetGame = () => {
    initializeGame();
    isGameRunning.value = false;
    score.value = 0;
  };

  const changeDirection = (event) => {
    if (!isGameRunning.value) return;

    const { key } = event;

    // Only prevent default if not typing in an input or textarea
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key) &&
      event.target.tagName !== "INPUT" &&
      event.target.tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
    }

    if (key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -1 };
    if (key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: 1 };
    if (key === "ArrowLeft" && direction.x === 0) direction = { x: -1, y: 0 };
    if (key === "ArrowRight" && direction.x === 0) direction = { x: 1, y: 0 };
  };

  const handleTouchStart = (event) => {
    if (isGameRunning.value) {
      event.preventDefault();
    }
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    if (!isGameRunning.value) return;

    event.preventDefault();

    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction.x === 0) {
          direction = { x: 1, y: 0 };
        } else if (deltaX < 0 && direction.x === 0) {
          direction = { x: -1, y: 0 };
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && direction.y === 0) {
          direction = { x: 0, y: 1 };
        } else if (deltaY < 0 && direction.y === 0) {
          direction = { x: 0, y: -1 };
        }
      }
    }
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", changeDirection);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
  });

  onUnmounted(() => {
    stopGame();
    window.removeEventListener("keydown", changeDirection);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchend", handleTouchEnd);
  });

  return {
    canvasRef,
    gameCardRef,
    isGameRunning,
    startGame,
    resetGame,
    score,
  };
}
