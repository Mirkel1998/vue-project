import { ref } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useQuizGame() {
  const questions = ref([
    { question: "What is the name of Han Solo's ship?", options: ["X-Wing", "TIE Fighter", "Millennium Falcon", "Star Destroyer"], correct: 2 },
    { question: "Who is Luke Skywalker's father?", options: ["Obi-Wan Kenobi", "Yoda", "Darth Vader", "Mace Windu"], correct: 2 },
    { question: "What is the weapon of a Jedi Knight?", options: ["Blaster", "Lightsaber", "Bowcaster", "Vibroblade"], correct: 1 },
    { question: "What is the name of the Wookiee in Star Wars?", options: ["Chewbacca", "Ewok", "Jabba", "Bossk"], correct: 0 },
    { question: "Who trained Luke Skywalker in 'The Empire Strikes Back'?", options: ["Obi-Wan Kenobi", "Yoda", "Qui-Gon Jinn", "Mace Windu"], correct: 1 },
  ]);

  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const isQuizFinished = ref(false);

  const { submitScore, fetchLeaderboard } = useLeaderboard("QuizGame");
  const { currentUser } = useAuth();
  const userStore = useUserStore();

  const selectAnswer = async (optionIndex) => {
    if (isQuizFinished.value) return;

    if (optionIndex === questions.value[currentQuestionIndex.value].correct) {
      score.value++;
    }

    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      isQuizFinished.value = true;
      // Submit score to leaderboard when quiz finishes
      if (currentUser.value && !userStore.profile) {
        await userStore.fetchUserProfile(currentUser.value.uid);
      }
      if (currentUser.value && userStore.profile && userStore.profile.username) {
        await submitScore(
          currentUser.value.uid,
          userStore.profile.username,
          score.value
        );
        fetchLeaderboard();
      }
    }
  };

  const resetQuiz = () => {
    currentQuestionIndex.value = 0;
    score.value = 0;
    isQuizFinished.value = false;
  };

  return {
    questions,
    currentQuestionIndex,
    score,
    isQuizFinished,
    selectAnswer,
    resetQuiz,
  };
}
