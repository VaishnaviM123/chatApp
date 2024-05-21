import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reatcchat.firebaseapp.com",
  projectId: "reatcchat",
  storageBucket: "reatcchat.appspot.com",
  messagingSenderId: "717215956473",
  appId: "1:717215956473:web:df5aff2a21b5da68a99128"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };