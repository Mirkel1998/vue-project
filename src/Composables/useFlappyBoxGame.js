import { ref, onMounted } from "vue";

export function useFlappyBoxGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  let animationFrameId;

  let ctx, width, height;
  let box, pipes;
  const gravity = 0.2; // Reduced from 0.3 to make the fall slower
  const jumpStrength = -6; // Reduced from -10 to make the jump height lower
  const pipeWidth = 50;
  const pipeGap = 150;

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

    box = { x: 50, y: height / 2, size: 20, velocity: 0 };
    pipes = [
      { x: width, y: Math.random() * (height - pipeGap) },
    ];
  };

  const drawBox = () => {
    ctx.fillStyle = "#007bff";
    ctx.fillRect(box.x, box.y, box.size, box.size);
  };

  const drawPipes = () => {
    ctx.fillStyle = "#ff0000";
    pipes.forEach((pipe) => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, height - pipe.y - pipeGap);
    });
  };

  const movePipes = () => {
    pipes.forEach((pipe) => {
      pipe.x -= 2;
    });

    // Remove pipes that are off-screen and add new ones
    if (pipes[0].x + pipeWidth < 0) {
      pipes.shift();
      pipes.push({
        x: width,
        y: Math.random() * (height - pipeGap),
      });
    }
  };

  const applyGravity = () => {
    box.velocity += gravity;
    box.y += box.velocity;

    // Prevent the box from going out of bounds
    if (box.y + box.size > height) {
      box.y = height - box.size;
      box.velocity = 0;
      stopGame();
      // Removed the alert for hitting the ground
    } else if (box.y < 0) {
      box.y = 0;
      box.velocity = 0;
    }
  };

  const checkCollision = () => {
    for (const pipe of pipes) {
      if (
        box.x < pipe.x + pipeWidth &&
        box.x + box.size > pipe.x &&
        (box.y < pipe.y || box.y + box.size > pipe.y + pipeGap)
      ) {
        stopGame();
        // Removed the alert for hitting a pipe
        return;
      }
    }
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawBox();
    drawPipes();
    movePipes();
    applyGravity();
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

  const jump = () => {
    if (isGameRunning.value) {
      box.velocity = jumpStrength;
    }
  };

  const resetGame = () => {
    initializeGame(); // Reinitialize the game variables
    isGameRunning.value = false;
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        // Prevent the default behavior of the spacebar (scrolling)
        event.preventDefault();
        jump();
      }
    });
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
 
