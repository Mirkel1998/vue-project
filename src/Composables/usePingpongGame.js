import { ref, onMounted } from "vue";

export function usePingpongGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  let animationFrameId;

  let ctx, width, height, ballX, ballY, ballSpeedX, ballSpeedY, ballRadius;
  let paddleWidth, paddleHeight, paddleY, paddleX;

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
    ballX = width / 2;
    ballY = height / 2;
    ballSpeedX = 4;
    ballSpeedY = -4; // Set the initial Y speed to negative to make the ball move upward
    ballRadius = 10;

    paddleWidth = width * 0.2; // Paddle width as a percentage of canvas width
    paddleHeight = 10;
    paddleY = height - 20;
    paddleX = (width - paddleWidth) / 2;
  };

  const drawBall = () => {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#007bff";
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = () => {
    ctx.fillStyle = "#007bff";
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
  };

  const moveBall = () => {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with walls
    if (ballX + ballRadius > width || ballX - ballRadius < 0) {
      ballSpeedX = -ballSpeedX;
    }
    if (ballY - ballRadius < 0) {
      ballSpeedY = -ballSpeedY;
    }

    // Ball collision with paddle
    if (
      ballY + ballRadius > paddleY &&
      ballX > paddleX &&
      ballX < paddleX + paddleWidth
    ) {
      ballSpeedY = -ballSpeedY;
    }

    // Reset ball if it falls below the paddle
    if (ballY - ballRadius > height) {
      ballX = width / 2;
      ballY = height / 2;
      ballSpeedX = 4;
      ballSpeedY = -4; // Reset Y speed to negative
    }
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawBall();
    drawPaddle();
    moveBall();
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

  const movePaddle = (event) => {
    const rect = canvasRef.value.getBoundingClientRect();
    paddleX = event.clientX - rect.left - paddleWidth / 2;

    // Prevent paddle from going out of bounds
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > width) paddleX = width - paddleWidth;
  };

  onMounted(() => {
    initializeGame();
    canvasRef.value.addEventListener("mousemove", movePaddle);
  });

  return {
    canvasRef,
    gameCardRef,
    isGameRunning,
    startGame,
    stopGame,
  };
}
