import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFki4tSLlPOuEXeS04suOWqO0cnMUOPU0",
  authDomain: "birthdayreminderang.firebaseapp.com",
  projectId: "birthdayreminderang",
  storageBucket: "birthdayreminderang.firebasestorage.app",
  messagingSenderId: "127349893398",
  appId: "1:127349893398:web:cf03fb3b186c5d02440837",
  measurementId: "G-5FV51QHF9Z"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);