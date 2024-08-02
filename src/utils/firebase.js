import { initializeApp } from 'firebase/app';
import { getFirestore,getDoc,doc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, setPersistence, browserSessionPersistence,signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBscJ3_jff-PIS7A9iVn4AhV2vUZN1c9NQ",
    authDomain: "game-app-df13a.firebaseapp.com",
    projectId: "game-app-df13a",
    storageBucket: "game-app-df13a.appspot.com",
    messagingSenderId: "237232378248",
    appId: "1:237232378248:web:278e934ac71322ce4b2a3d",
    measurementId: "G-460HXE22F5"
  };
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  
  const signInWithGoogle = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      throw error;
    }
  };
  
  export { firestore, auth, googleProvider, signInWithGoogle, onAuthStateChanged ,signOut,signInWithPopup,getDoc,doc};