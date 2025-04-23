import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDssRGf6MUBM1jE5z1UKn5PTnt6-eErmhk",
  authDomain: "guitar-b2718.firebaseapp.com",
  databaseURL: "https://guitar-b2718-default-rtdb.firebaseio.com",
  projectId: "guitar-b2718",
  storageBucket: "guitar-b2718.firebasestorage.app",
  messagingSenderId: "656829636187",
  appId: "1:656829636187:web:ec377d2b1104cc4804297e",
  measurementId: "G-7ERY2BXVVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 