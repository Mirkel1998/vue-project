import { ref } from 'vue'
import { db } from '@/Composables/useFirebase'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'

export function useAdminUsers() {
  // State
  const users = ref([])
  const loadingUsers = ref(false)
  const deletingUsers = ref([])
  
  // Game list for cleanup
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

  // Load all users from Firestore
  const loadUsers = async () => {
    loadingUsers.value = true
    try {
      const snap = await getDocs(collection(db, "users"))
      users.value = snap.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })).filter(user => user.username) // Only users with usernames
      
      return {
        success: true,
        message: `Loaded ${users.value.length} users successfully`,
        count: users.value.length
      }
    } catch (error) {
      console.error('Error loading users:', error)
      return {
        success: false,
        message: 'Failed to load users',
        error
      }
    } finally {
      loadingUsers.value = false
    }
  }

  // Delete user and all associated data
  const deleteUser = async (user) => {
    if (!user || !user.uid) {
      return {
        success: false,
        message: 'Invalid user data'
      }
    }

    deletingUsers.value.push(user.uid)
    
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', user.uid))
      
      // Delete user's scores from all game leaderboards
      const deletePromises = games.map(async (game) => {
        try {
          await deleteDoc(doc(db, `leaderboards/${game.name}/scores`, user.uid))
        } catch (e) {
          // Score might not exist for this game, continue
          console.log(`No score found for ${user.username} in ${game.name}`)
        }
      })
      
      await Promise.all(deletePromises)
      
      // Remove user from local array
      users.value = users.value.filter(u => u.uid !== user.uid)
      
      return {
        success: true,
        message: `User "${user.username}" has been permanently deleted`
      }
      
    } catch (error) {
      console.error('Error deleting user:', error)
      return {
        success: false,
        message: `Failed to delete user "${user.username}". Please try again.`,
        error
      }
    } finally {
      deletingUsers.value = deletingUsers.value.filter(id => id !== user.uid)
    }
  }

  // Check if user is admin (cannot be deleted)
  const isAdminUser = (user) => {
    return user.username === 'Mikkel' || user.username === 'Mikkel (admin)'
  }

  // Check if user is currently being deleted
  const isUserBeingDeleted = (userId) => {
    return deletingUsers.value.includes(userId)
  }

  return {
    // State
    users,
    loadingUsers,
    deletingUsers,
    
    // Actions
    loadUsers,
    deleteUser,
    
    // Helpers
    isAdminUser,
    isUserBeingDeleted
  }
}