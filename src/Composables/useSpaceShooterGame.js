import { ref, onMounted, onUnmounted } from "vue";

export function useSpaceShooterGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  let animationFrameId;

  let ctx, width, height;
  let player, bullets, enemies;
  const bulletSpeed = 5;
  const enemySpeed = 2;

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
    enemies = Array.from({ length: 5 }, () => ({
      x: Math.random() * (width - 20),
      y: Math.random() * height / 2,
      width: 20,
      height: 20,
    }));
  };

  const drawPlayer = () => {
    ctx.fillStyle = "#007bff";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  };

  const drawBullets = () => {
    ctx.fillStyle = "#ff0000";
    bullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  };

  const drawEnemies = () => {
    ctx.fillStyle = "#00ff00";
    enemies.forEach((enemy) => {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  };

  const moveBullets = () => {
    bullets.forEach((bullet, index) => {
      bullet.y -= bulletSpeed;
      if (bullet.y + bullet.height < 0) {
        bullets.splice(index, 1); // Remove bullets that go off-screen
      }
    });
  };

  const moveEnemies = () => {
    enemies.forEach((enemy) => {
      enemy.y += enemySpeed;
      if (enemy.y > height) {
        enemy.y = -enemy.height;
        enemy.x = Math.random() * (width - enemy.width);
      }
    });
  };

  const checkCollisions = () => {
    bullets.forEach((bullet, bulletIndex) => {
      enemies.forEach((enemy, enemyIndex) => {
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          // Remove bullet and enemy on collision
          bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);

          // Add a new enemy
          enemies.push({
            x: Math.random() * (width - 20),
            y: -20,
            width: 20,
            height: 20,
          });
        }
      });
    });

    // Check for collisions between the player and enemies
    enemies.forEach((enemy) => {
      if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
      ) {
        stopGame(); // Stop the game if the player is hit
        // Removed the alert for game over
      }
    });
  };

  const draw = () => {
    if (!isGameRunning.value) return;
    ctx.clearRect(0, 0, width, height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    moveBullets();
    moveEnemies();
    checkCollisions();
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

  const resetGame = () => {
    initializeGame(); // Reinitialize the game variables
    isGameRunning.value = false; // Stop the game
  };

  const movePlayer = (event) => {
    if (!isGameRunning.value) return;

    if (event.key === "ArrowLeft" && player.x > 0) {
      player.x -= 10;
    } else if (event.key === "ArrowRight" && player.x + player.width < width) {
      player.x += 10;
    }
  };

  const shootBullet = (event) => {
    if (!isGameRunning.value || event.code !== "Space") return;

    // Prevent the default behavior of the spacebar (scrolling)
    event.preventDefault();

    bullets.push({
      x: player.x + player.width / 2 - 2.5,
      y: player.y,
      width: 5,
      height: 10,
    });
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", movePlayer);
    window.addEventListener("keydown", shootBullet);
  });

  onUnmounted(() => {
    stopGame();
    window.removeEventListener("keydown", movePlayer);
    window.removeEventListener("keydown", shootBullet);
  });

  return {
    canvasRef,
    gameCardRef,
    isGameRunning,
    startGame,
    resetGame, // Expose resetGame instead of stopGame
  };
}
  

