import { ref, onMounted } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useAvoidEnemyGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  let animationFrameId;

  let ctx, width, height;
  let player, enemies;

  const score = ref(0);
  let timerInterval = null;

  const { submitScore } = useLeaderboard("AvoidEnemy");
  const { currentUser } = useAuth();
  const userStore = useUserStore();

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
    player = { x: width / 2, y: height - 30, size: 20, speed: 8 };
    enemies = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height / 2,
      size: 20,
      speed: 1 + Math.random() * 1.5,
    }));
  };

  const drawPlayer = () => {
    ctx.fillStyle = "#6C619E";
    ctx.fillRect(player.x, player.y, player.size, player.size);
  };

  const drawEnemies = () => {
    ctx.fillStyle = "#000000";
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
      score.value = 0;
      draw();
      timerInterval = setInterval(() => {
        score.value += 1;
      }, 1000);
    }
  };

  const stopGame = async () => {
    isGameRunning.value = false;
    cancelAnimationFrame(animationFrameId);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
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

  const movePlayer = (event) => {
    if (!isGameRunning.value) return;

    // Only prevent default if not typing in an input or textarea
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) &&
      event.target.tagName !== "INPUT" &&
      event.target.tagName !== "TEXTAREA"
    ) {
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
    initializeGame();
    isGameRunning.value = false;
    score.value = 0;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
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
    resetGame,
    score,
  };
}

