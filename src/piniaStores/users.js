import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/Composables/useFirebase'
import { doc, getDoc } from 'firebase/firestore'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)

  async function fetchUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      profile.value = userDoc.data()
    } else {
      profile.value = null
    }
  }

  function clearProfile() {
    profile.value = null
  }

  return { profile, fetchUserProfile, clearProfile }
})
