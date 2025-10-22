import { ref, computed } from "vue"
import { firebaseApp, db } from "./useFirebase"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "firebase/auth"
// Firestore helpers
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

const auth = getAuth(firebaseApp)

const currentUser = ref(null)
const isLoggedIn = computed(() => !!currentUser.value);
const authError = ref(null)
const loading = ref(false)

onAuthStateChanged(auth, (user) => {
    currentUser.value = user
})

const login = async (email, password) => {
    console.log("login attempt:", email)
    loading.value = true
    authError.value = null
    try {
       await signInWithEmailAndPassword(auth, email, password)
    }
    catch(error) {
        authError.value = error.message
    }
    finally {
        loading.value = false
    }
}

// new register function
const register = async (email, password, username) => {
  loading.value = true
  authError.value = null
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    if (username) {
      await updateProfile(user, { displayName: username })
    }
    // create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      username: username ? username : null,
      usernameLower: username ? username.toLowerCase() : null,
      createdAt: serverTimestamp()
    })
    // user is automatically signed in after registration
  } catch (error) {
    authError.value = error.message
  } finally {
    loading.value = false
  }
}

const logout = async (routerInstance) => {
    console.log ("logout of this mail:", currentUser.value?.email);
    loading.value = true
    authError.value = null;

    try {
        await signOut(auth)
        if (routerInstance) {
            routerInstance.push("/")
        }
    }
    catch (error) {
        authError.value = error.message
    }
    finally {
        loading.value = false 
    }
}

export function useAuth() {
    return {
        currentUser,
        isLoggedIn,
        authError,
        loading,
        login,
        register, // <-- added
        logout
    }
}