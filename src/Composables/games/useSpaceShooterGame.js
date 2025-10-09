import { ref, onMounted, onUnmounted } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useSpaceShooterGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  const score = ref(0);
  let animationFrameId;

  let ctx, width, height;
  let player, bullets, enemies;
  let leftPressed = false,
    rightPressed = false,
    spacePressed = false;

  const { submitScore } = useLeaderboard("SpaceShooter");
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

    player = { x: width / 2 - 20, y: height - 40, width: 40, height: 20 };
    bullets = [];
    enemies = [];
    score.value = 0;

    // Spawn initial enemies
    for (let i = 0; i < 5; i++) {
      enemies.push({
        x: Math.random() * (width - 40),
        y: Math.random() * 100,
        width: 40,
        height: 20,
        speed: 2 + Math.random() * 2,
      });
    }
  };

  const drawPlayer = () => {
    ctx.fillStyle = "#6C619E";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  };

  const drawBullets = () => {
    ctx.fillStyle = "#000";
    bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.width, b.height));
  };

  const drawEnemies = () => {
    ctx.fillStyle = "#ff0000";
    enemies.forEach((e) => ctx.fillRect(e.x, e.y, e.width, e.height));
  };

  const movePlayer = () => {
    if (leftPressed) player.x -= 5;
    if (rightPressed) player.x += 5;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > width) player.x = width - player.width;
  };

  const moveBullets = () => {
    bullets.forEach((b) => (b.y -= 7));
    // Remove bullets that are off screen
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i].y + bullets[i].height < 0) bullets.splice(i, 1);
    }
  };

  const moveEnemies = () => {
    enemies.forEach((e) => (e.y += e.speed));
    // Respawn enemies that go off screen
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].y > height) {
        enemies[i].x = Math.random() * (width - 40);
        enemies[i].y = -20;
        enemies[i].speed = 2 + Math.random() * 2;
      }
    }
  };

  const checkCollisions = () => {
    // Bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const b = bullets[i],
          e = enemies[j];
        if (
          b.x < e.x + e.width &&
          b.x + b.width > e.x &&
          b.y < e.y + e.height &&
          b.y + b.height > e.y
        ) {
          // Remove bullet and respawn enemy
          bullets.splice(i, 1);
          enemies[j].x = Math.random() * (width - 40);
          enemies[j].y = -20;
          enemies[j].speed = 2 + Math.random() * 2;
          score.value += 1; // Increment score
          break;
        }
      }
    }
    // Enemy-player collisions (game over)
    for (let e of enemies) {
      if (
        player.x < e.x + e.width &&
        player.x + player.width > e.x &&
        player.y < e.y + e.height &&
        player.y + player.height > e.y
      ) {
        stopGame();
      }
    }
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    movePlayer();
    moveBullets();
    moveEnemies();
    checkCollisions();
    animationFrameId = requestAnimationFrame(draw);
  };

  const startGame = () => {
    if (!isGameRunning.value) {
      isGameRunning.value = true;
      score.value = 0;
      initializeGame();
      draw();
    }
  };

  const stopGame = async () => {
    isGameRunning.value = false;
    cancelAnimationFrame(animationFrameId);
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
    stopGame();
    initializeGame();
    score.value = 0;
  };

  const handleKeyDown = (e) => {
    // Only prevent default if not typing in an input or textarea
    if (
      (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === " ") &&
      e.target.tagName !== "INPUT" &&
      e.target.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
    }

    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
    if (e.key === " " && isGameRunning.value) {
      // Spacebar to shoot
      bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
      });
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  });

  onUnmounted(() => {
    stopGame();
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
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


