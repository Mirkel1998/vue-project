import { ref, onUnmounted } from 'vue'
import { db } from '@/Composables/useFirebase'
import { doc, setDoc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'

export function useLeaderboard(gameName) {
  const scores = ref([])
  let unsubscribe = null


    // Submit or update a user's score
  async function submitScore(userId, username, score) {
    try {
      const docRef = doc(db, `leaderboards/${gameName}/scores`, userId)
      const existing = await getDoc(docRef)
      const prevScore = existing.exists() ? existing.data().score : null

      if (prevScore === null || score > prevScore) {
        await setDoc(docRef, { userId, username, score, timestamp: Date.now() }, { merge: true })
        console.log('Score submitted to Firestore!', { userId, username, score })
      } else {
        console.log('Score not high enough to update.')
      }
    } catch (e) {
      console.error('Error writing score to Firestore:', e)
    }
  }

  function fetchLeaderboard(topN = 10) {
    // Query the "scores" subcollection
    const q = query(
      collection(db, `leaderboards/${gameName}/scores`),
      orderBy('score', 'desc'),
      limit(topN)
    )
    // Unsubscribe previous listener if any
    if (unsubscribe) unsubscribe()
    unsubscribe = onSnapshot(q, snapshot => {
      scores.value = snapshot.docs.map(doc => doc.data())
    })
  }

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return { scores, submitScore, fetchLeaderboard }
}
