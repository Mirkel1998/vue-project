import { ref, onMounted, getCurrentInstance } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function usePingpongGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  const score = ref(0);
  let animationFrameId;

  let ctx, width, height, ballX, ballY, ballSpeedX, ballSpeedY, ballRadius;
  let paddleWidth, paddleHeight, paddleY, paddleX;

  const { currentUser } = useAuth();
  const userStore = useUserStore();
  const { submitScore } = useLeaderboard("Pingpong");
  const instance = getCurrentInstance();

  const initializeGame = () => {
    const canvas = canvasRef.value;
    ctx = canvas.getContext("2d");

    // Set fixed canvas dimensions
    const fixedWidth = 400;
    const fixedHeight = 400;

    canvas.width = fixedWidth;
    canvas.height = fixedHeight;

    // Remove the explicit CSS style setting to let CSS handle responsive sizing
    // canvas.style.width = `${fixedWidth}px`;
    // canvas.style.height = `${fixedHeight}px`;

    width = canvas.width;
    height = canvas.height;
    ballX = width / 2;
    ballY = height / 2;
    ballSpeedX = 4;
    ballSpeedY = -4;
    ballRadius = 10;

    paddleWidth = width * 0.2;
    paddleHeight = 10;
    paddleY = height - 20;
    paddleX = (width - paddleWidth) / 2;
    score.value = 0;
  };

  const drawBall = () => {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
  };

  const drawPaddle = () => {
    ctx.fillStyle = "#6C619E";
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
  };

  const moveBall = async () => {
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
      score.value += 1;
    }

    // Reset ball if it falls below the paddle
    if (ballY - ballRadius > height) {
      ballX = width / 2;
      ballY = height / 2;
      ballSpeedX = 4;
      ballSpeedY = -4;
      await submitIfReady();
      instance?.emit?.('gameOver', score.value)
      score.value = 0;
    }
  };

  const draw = async () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawBall();
    drawPaddle();
    await moveBall();
    animationFrameId = requestAnimationFrame(() => draw());
  };

  const startGame = () => {
    if (!isGameRunning.value) {
      isGameRunning.value = true;
      score.value = 0;
      draw();
    }
  };

  const stopGame = () => {
    isGameRunning.value = false;
    cancelAnimationFrame(animationFrameId);
  };

  const movePaddle = (event) => {
    const canvas = canvasRef.value;
    const rect = canvas.getBoundingClientRect();

    // Calculate the scale factor between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Get mouse position relative to canvas and adjust for scaling
    const mouseX = (event.clientX - rect.left) * scaleX;

    // Position paddle centered on mouse
    paddleX = mouseX - paddleWidth / 2;

    // Prevent paddle from going out of bounds
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleWidth > width) paddleX = width - paddleWidth;
  };

  const submitIfReady = async () => {
    if (currentUser.value && !userStore.profile) {
      await userStore.fetchUserProfile(currentUser.value.uid);
    }
    if (currentUser.value && userStore.profile && userStore.profile.username) {
      console.log('Submitting score:', {
        uid: currentUser.value?.uid,
        username: userStore.profile?.username,
        score: score.value
      });
      submitScore(
        currentUser.value.uid,
        userStore.profile.username,
        score.value
      );
    }
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
    score,
  };
}
