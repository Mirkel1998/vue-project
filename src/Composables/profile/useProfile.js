import { ref, reactive } from 'vue'
import { useAuth } from '@/Composables/useAuth'
import { useUserStore } from '@/piniaStores/users'
import { db } from '@/Composables/useFirebase'
import { setDoc, doc, getDoc } from 'firebase/firestore'

export function useProfile() {
  // State
  const loading = ref(true)
  const userScores = ref([])
  const userGames = ref([])
  
  const profileData = reactive({
    username: '',
    description: '',
    location: '',
    favoriteGenre: '',
    avatar: 'avatar1',
    gamesPlayed: 0,
    hoursPlayed: 0
  })

  // Dependencies
  const { currentUser } = useAuth()
  const userStore = useUserStore()

  // Game list for scores
  const games = [
    { name: "Pingpong", displayName: "Ping Pong" },
    { name: "Snake", displayName: "Snake" },
    { name: "FlappyBox", displayName: "Flappy Box" },
    { name: "SpaceShooter", displayName: "Space Shooter" },
    { name: "AvoidEnemy", displayName: "Avoid the Enemy" },
    { name: "RockPaperScissors", displayName: "Rock Paper Scissors" },
    { name: "QuizGame", displayName: "Star Wars Quiz" },
    { name: "MazeEscape", displayName: "Maze Escape" },
    { name: "GuessTheColor", displayName: "Guess the Color" },
    { name: "TicTacToe", displayName: "Tic Tac Toe" },
  ]

  // Load profile data from Firestore
  const loadProfileData = async () => {
    loading.value = true
    
    if (!currentUser.value) {
      loading.value = false
      return { success: false, message: 'No user logged in' }
    }

    try {
      // Fetch user profile
      await userStore.fetchUserProfile(currentUser.value.uid)
      
      if (userStore.profile) {
        Object.assign(profileData, userStore.profile)
        if (!profileData.gamesPlayed) profileData.gamesPlayed = 0
        if (!profileData.hoursPlayed) profileData.hoursPlayed = 0
        if (!profileData.avatar) profileData.avatar = 'avatar1'
        
        // Load user's games list
        if (userStore.profile.games && Array.isArray(userStore.profile.games)) {
          userGames.value = userStore.profile.games
        }
      }

      // Initialize user scores
      userScores.value = games.map(g => ({ ...g, score: null }))

      // Fetch scores for each game
      for (let i = 0; i < games.length; i++) {
        const game = games[i]
        const scoreDoc = await getDoc(doc(db, `leaderboards/${game.name}/scores`, currentUser.value.uid))
        userScores.value[i].score = scoreDoc.exists() ? scoreDoc.data().score : null
      }

      loading.value = false
      return { success: true, message: 'Profile loaded successfully' }
    } catch (error) {
      loading.value = false
      return { success: false, message: `Failed to load profile: ${error.message}` }
    }
  }

  // Save profile data to Firestore
  const saveProfile = async () => {
    if (!currentUser.value) {
      return { success: false, message: 'No user logged in' }
    }

    try {
      const userDoc = doc(db, 'users', currentUser.value.uid)
      await setDoc(userDoc, { ...profileData }, { merge: true })
      await userStore.fetchUserProfile(currentUser.value.uid)
      return { success: true, message: 'Profile saved successfully!' }
    } catch (error) {
      return { success: false, message: `Failed to save profile: ${error.message}` }
    }
  }

  // Update avatar
  const selectAvatar = (avatarId) => {
    profileData.avatar = avatarId
    return { success: true, message: 'Avatar updated' }
  }

  return {
    // State
    loading,
    profileData,
    userScores,
    userGames,
    
    // Actions
    loadProfileData,
    saveProfile,
    selectAvatar,
    
    // Dependencies
    currentUser,
    userStore
  }
}