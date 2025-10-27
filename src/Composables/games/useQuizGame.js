import { ref } from "vue";
import { useLeaderboard } from "@/Composables/useLeaderboard";
import { useAuth } from "@/Composables/useAuth";
import { useUserStore } from "@/piniaStores/users";

export function useQuizGame() {
  const questions = ref([
    { question: "What was the name of Cal Kestis's droid?", options: ["K-2so", "BD-1", "C1-10P", "IG-11"], correct: 1 },
    { question: "In how many parsecs did Han Solo complete the Kessel Run?", options: ["Less than 14", "More than 12", "Less than 12", "Exactly 69"], correct: 2 },
    { question: "Who was Caleb Dume?", options: ["Kanan Jarrus", "Wedge Antilles", "Willrow Hood", "Paige Tico"], correct: 0 },
    { question: "What race was Ayla Secura?", options: ["Twi'lek", "Togruta", "Hutt", "Zabrak"], correct: 0 },
    { question: "What kind of attack cruiser did the Republic use in the Clone Wars?", options: ["Star Destroyer", "Venator-class", "Imperial-class", "Mon Calamari"], correct: 1 },
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
