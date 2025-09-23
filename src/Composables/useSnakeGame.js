import { ref, onMounted, onUnmounted } from "vue";

export function useSnakeGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  let animationFrameId;

  let ctx, width, height;
  let snake, food, direction, gridSize, cellSize;
  let touchStartX = 0;
  let touchStartY = 0;

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
      return; // Removed the alert for hitting itself
    }

    // Add new head to the snake
    snake.unshift(head);

    // Check if the snake eats the food
    if (head.x === food.x && head.y === food.y) {
      food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
    } else {
      snake.pop(); // Remove the tail if no food is eaten
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
      direction = { x: 1, y: 0 }; // Set initial direction to move right
      draw();
    }
  };

  const stopGame = () => {
    isGameRunning.value = false;
    clearTimeout(animationFrameId);
  };

  const resetGame = () => {
    initializeGame(); // Reinitialize the game variables
    isGameRunning.value = false; // Stop the game
  };

  const changeDirection = (event) => {
    if (!isGameRunning.value) return;

    const { key } = event;

    // Prevent the default behavior of arrow keys (scrolling)
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
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
    
    // Minimum swipe distance
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction.x === 0) {
          direction = { x: 1, y: 0 }; // Right
        } else if (deltaX < 0 && direction.x === 0) {
          direction = { x: -1, y: 0 }; // Left
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && direction.y === 0) {
          direction = { x: 0, y: 1 }; // Down
        } else if (deltaY < 0 && direction.y === 0) {
          direction = { x: 0, y: -1 }; // Up
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
  };
}

