import { ref, onMounted, getCurrentInstance } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useFlappyBoxGame() {
  const canvasRef = ref(null);
  const gameCardRef = ref(null);
  const isGameRunning = ref(false);
  const score = ref(0);
  let animationFrameId;

  let ctx, width, height;
  let box, pipes;
  const gravity = 0.2;
  const jumpStrength = -6;
  const pipeWidth = 50;
  const pipeGap = 150;

  const { submitScore } = useLeaderboard("FlappyBox");
  const { currentUser } = useAuth();
  const userStore = useUserStore();
  const instance = getCurrentInstance();

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
    score.value = 0;
  };

  const drawBox = () => {
    ctx.fillStyle = "#6C619E";
    ctx.fillRect(box.x, box.y, box.size, box.size);
  };

  const drawPipes = () => {
    ctx.fillStyle = "#000000";
    pipes.forEach((pipe) => {
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
      ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, height - pipe.y - pipeGap);
    });
  };

  const movePipes = () => {
    pipes.forEach((pipe) => {
      pipe.x -= 2;
    });

    if (pipes[0].x + pipeWidth < 0) {
      pipes.shift();
      pipes.push({
        x: width,
        y: Math.random() * (height - pipeGap),
      });
      score.value += 1;
    }
  };

  const applyGravity = () => {
    box.velocity += gravity;
    box.y += box.velocity;

    if (box.y + box.size > height) {
      box.y = height - box.size;
      box.velocity = 0;
      stopGame();
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
      score.value = 0;
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

  const jump = () => {
    if (isGameRunning.value) {
      box.velocity = jumpStrength;
    }
  };

  const resetGame = () => {
    initializeGame();
    isGameRunning.value = false;
    score.value = 0;
  };

  onMounted(() => {
    initializeGame();
    window.addEventListener("keydown", (event) => {
      // Only prevent default if not typing in an input or textarea
      if (
        event.code === "Space" &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA"
      ) {
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
    resetGame,
    score,
  };
}

