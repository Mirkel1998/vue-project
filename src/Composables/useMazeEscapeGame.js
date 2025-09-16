import { ref, onMounted, onUnmounted } from "vue";

export function useMazeEscapeGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);

  let ctx, width, height;
  let player, exit, maze;

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

    player = { x: 20, y: 20, size: 20 };
    exit = { x: width - 40, y: height - 40, size: 20 };

    // Define a more complicated maze with walls
    maze = [
      { x: 60, y: 0, width: 20, height: 100 },
      { x: 100, y: 80, width: 200, height: 20 },
      { x: 200, y: 200, width: 20, height: 100 },
      { x: 0, y: 300, width: 300, height: 20 },
      { x: 300, y: 100, width: 20, height: 200 },
      { x: 150, y: 150, width: 20, height: 100 },
      { x: 50, y: 200, width: 100, height: 20 },
      { x: 250, y: 250, width: 100, height: 20 },
      { x: 100, y: 350, width: 200, height: 20 },
      { x: 350, y: 50, width: 20, height: 300 },
    ];
  };

  const drawPlayer = () => {
    ctx.fillStyle = "#6C619E"; // Updated player color
    ctx.fillRect(player.x, player.y, player.size, player.size);
  };

  const drawExit = () => {
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(exit.x, exit.y, exit.size, exit.size);
  };

  const drawMaze = () => {
    ctx.fillStyle = "#000000"; // Updated maze walls (distraction) color to black
    maze.forEach((wall) => {
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
  };

  const checkCollision = (x, y) => {
    return maze.some(
      (wall) =>
        x < wall.x + wall.width &&
        x + player.size > wall.x &&
        y < wall.y + wall.height &&
        y + player.size > wall.y
    );
  };

  const movePlayer = (event) => {
    if (!isGameRunning.value) return;

    // Prevent the default behavior of arrow keys (scrolling)
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }

    let newX = player.x;
    let newY = player.y;

    if (event.key === "ArrowLeft") newX -= 20;
    if (event.key === "ArrowRight") newX += 20;
    if (event.key === "ArrowUp") newY -= 20;
    if (event.key === "ArrowDown") newY += 20;

    // Check for collisions with walls and boundaries
    if (
      newX >= 0 &&
      newX + player.size <= width &&
      newY >= 0 &&
      newY + player.size <= height &&
      !checkCollision(newX, newY)
    ) {
      player.x = newX;
      player.y = newY;
    }

    // Check if the player reaches the exit
    if (
      player.x < exit.x + exit.size &&
      player.x + player.size > exit.x &&
      player.y < exit.y + exit.size &&
      player.y + player.size > exit.y
    ) {
      stopGame(); // Stop the game when the player reaches the exit
    }
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawMaze();
    drawPlayer();
    drawExit();
    requestAnimationFrame(draw);
  };

  const startGame = () => {
    if (!isGameRunning.value) {
      isGameRunning.value = true;
      draw();
    }
  };

  const stopGame = () => {
    isGameRunning.value = false;
  };

  const resetGame = () => {
    initializeGame(); // Reinitialize the game variables
    isGameRunning.value = false; // Stop the game
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", movePlayer);
  });

  onUnmounted(() => {
    stopGame();
    window.removeEventListener("keydown", movePlayer);
  });

  return {
    canvasRef,
    gameCardRef,
    isGameRunning,
    startGame,
    stopGame,
    resetGame, // Expose resetGame
  };
}
