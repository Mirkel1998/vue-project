import { ref, onMounted } from "vue";

export function useAvoidEnemyGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  let animationFrameId;

  let ctx, width, height;
  let player, enemies;

  const initializeGame = () => {
    const canvas = canvasRef.value;
    ctx = canvas.getContext("2d");

    // Set fixed canvas dimensions
    const fixedWidth = 400;
    const fixedHeight = 400;

    canvas.width = fixedWidth;
    canvas.height = fixedHeight;

    width = canvas.width;
    height = canvas.height;

    // Initialize game variables
    player = { x: width / 2, y: height - 30, size: 20, speed: 8 }; // Increased player speed from 5 to 8
    enemies = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height / 2,
      size: 20,
      speed: 1 + Math.random() * 1.5, // Reduced enemy speed range from 2-4 to 1-2.5
    }));
  };

  const drawPlayer = () => {
    ctx.fillStyle = "#6C619E"; // Updated player color
    ctx.fillRect(player.x, player.y, player.size, player.size);
  };

  const drawEnemies = () => {
    ctx.fillStyle = "#000000"; // Updated enemy color to black
    enemies.forEach((enemy) => {
      ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
    });
  };

  const moveEnemies = () => {
    enemies.forEach((enemy) => {
      enemy.y += enemy.speed;
      if (enemy.y > height) {
        enemy.y = -enemy.size;
        enemy.x = Math.random() * width;
      }
    });
  };

  const checkCollision = () => {
    for (const enemy of enemies) {
      if (
        player.x < enemy.x + enemy.size &&
        player.x + player.size > enemy.x &&
        player.y < enemy.y + enemy.size &&
        player.y + player.size > enemy.y
      ) {
        stopGame();
        return;
      }
    }
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawPlayer();
    drawEnemies();
    moveEnemies();
    checkCollision();
    animationFrameId = requestAnimationFrame(draw);
  };

  const startGame = () => {
    if (!isGameRunning.value) {
      isGameRunning.value = true;
      draw();
    }
  };

  const stopGame = () => {
    isGameRunning.value = false;
    cancelAnimationFrame(animationFrameId);
  };

  const movePlayer = (event) => {
    if (!isGameRunning.value) return;

    // Prevent the default behavior of arrow keys (scrolling)
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" && player.x > 0) {
      player.x -= player.speed;
    } else if (event.key === "ArrowRight" && player.x + player.size < width) {
      player.x += player.speed;
    } else if (event.key === "ArrowUp" && player.y > 0) {
      player.y -= player.speed;
    } else if (event.key === "ArrowDown" && player.y + player.size < height) {
      player.y += player.speed;
    }
  };

  const resetGame = () => {
    initializeGame(); // Reinitialize the game variables
    isGameRunning.value = false; // Stop the game
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", movePlayer);
  });

  return {
    canvasRef,
    gameCardRef,
    isGameRunning,
    startGame,
    stopGame,
    resetGame, // Expose the resetGame function
  };
}

