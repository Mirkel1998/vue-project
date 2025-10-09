import { ref, onMounted, onUnmounted } from "vue";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { useFirebase } from "./useFirebase";

export function useGames() {
  const { db } = useFirebase()
  const games = ref([])
  const newGameTitle = ref("")
  const loading = ref(true)
  const error = ref(null)

  const gamesCollectionRef = collection(db, "games")
  let unsubscribe

  onMounted(() => {
    unsubscribe = onSnapshot(gamesCollectionRef, (snapshot) => {
      games.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      loading.value = false
    })
  })
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  const addGame = async () => {
    if (newGameTitle.value.trim() === "") return
    try {
      await addDoc(gamesCollectionRef, { gameName: newGameTitle.value })
      newGameTitle.value = ""
    } catch (e) {
      error.value = "Failed to add game."
    }
  }

  const deleteGame = async (id) => {
    try {
      const gameDoc = doc(db, "games", id)
      await deleteDoc(gameDoc)
    } catch (e) {
      error.value = "Failed to delete game."
    }
  }

  return {
    games,
    newGameTitle,
    loading,
    error,
    addGame,
    deleteGame
  }
}
