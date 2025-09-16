import { ref, onMounted } from "vue";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { useFirebase } from "./useFirebase";

export function useGames() { 
  const { db } = useFirebase()
  const games = ref([])
  const newGameTitle = ref("")
  const loading = ref(true) // Add loading state

  const errorMessageEmptyTitle = "Title cannot be empty.";

  const gamesCollectionRef = collection(db, "games")

  onMounted(() => {
    onSnapshot(gamesCollectionRef, (snapshot) => {
      games.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      loading.value = false; // Set loading to false when data is fetched
    })
  })

  const addGame = async () => {
    if (newGameTitle.value.trim() === "") return
    await addDoc(gamesCollectionRef, { gameName: newGameTitle.value })
    newGameTitle.value = ""
  }

  const deleteGame = async (id) => {
    const gameDoc = doc(db, "games", id)
    await deleteDoc(gameDoc)
  }

  return {
    games,
    newGameTitle,
    loading, // Expose loading state
    addGame,
    deleteGame
  }
}