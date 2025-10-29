import { ref } from 'vue'
import { db } from '@/Composables/useFirebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export function useCommunityUsers() {
  // State
  const users = ref([])
  const loading = ref(true)

  // Game list for score fetching
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

  // Avatar options
  const avatarOptions = [
    { id: 'avatar1', name: 'Avatar 1', src: '/avatars/avatar1.png' },
    { id: 'avatar2', name: 'Avatar 2', src: '/avatars/avatar2.png' },
    { id: 'avatar3', name: 'Avatar 3', src: '/avatars/avatar3.png' },
    { id: 'avatar4', name: 'Avatar 4', src: '/avatars/avatar4.png' },
    { id: 'avatar5', name: 'Avatar 5', src: '/avatars/avatar5.png' }
  ]

  // Load all users from Firestore
  const loadUsers = async () => {
    loading.value = true
    try {
      const snap = await getDocs(collection(db, "users"))
      const seen = new Set()
      
      users.value = snap.docs
        .map(doc => ({
          uid: doc.id,
          showScores: false,
          scores: [],
          scoresLoading: false,
          ...doc.data()
        }))
        .filter(user => {
          // Filter logic
          if (!user.username) return false
          if (!/^[A-Z]/.test(user.username)) return false
          if (seen.has(user.username)) return false
          seen.add(user.username)
          return true
        })
      
      return {
        success: true,
        users: users.value,
        count: users.value.length
      }
    } catch (error) {
      console.error('Error loading users:', error)
      return {
        success: false,
        error,
        message: 'Failed to load users'
      }
    } finally {
      loading.value = false
    }
  }

  // Get user avatar source
  const getUserAvatar = (user) => {
    const avatar = avatarOptions.find(a => a.id === (user.avatar || 'avatar1'))
    return avatar?.src || avatarOptions[0].src
  }

  // Toggle user scores visibility and load data if needed
  const toggleUserScores = async (user) => {
    user.showScores = !user.showScores
    
    if (user.showScores && user.scores.length === 0 && !user.scoresLoading) {
      user.scoresLoading = true
      
      try {
        // Fetch scores for all games
        user.scores = await Promise.all(games.map(async (game) => {
          const scoreDoc = await getDoc(doc(db, `leaderboards/${game.name}/scores`, user.uid))
          return {
            name: game.name,
            displayName: game.displayName,
            score: scoreDoc.exists() ? scoreDoc.data().score : null
          }
        }))
        
        // Fetch user's full profile to get their games list
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists() && userDoc.data().games) {
          user.games = userDoc.data().games
        } else {
          user.games = []
        }
        
        return {
          success: true,
          scores: user.scores,
          games: user.games
        }
      } catch (error) {
        console.error('Error loading user scores:', error)
        return {
          success: false,
          error,
          message: 'Failed to load user scores'
        }
      } finally {
        user.scoresLoading = false
      }
    }
    
    return { success: true }
  }

  // Check if user has any games
  const userHasGames = (user) => {
    return user.games && user.games.length > 0
  }

  // Get formatted score display
  const getScoreDisplay = (score) => {
    return score !== null ? score : '—'
  }

  return {
    // State
    users,
    loading,
    
    // Actions
    loadUsers,
    toggleUserScores,
    
    // Helpers
    getUserAvatar,
    userHasGames,
    getScoreDisplay
  }
}