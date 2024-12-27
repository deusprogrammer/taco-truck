// filepath: /Users/michaelmain/Documents/workspace/taco-truck/src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, setLogLevel } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBvjGOSkVU0s3N16QBkW-8YRzDkjF1RkS4",
  authDomain: "cg-taco-truck.firebaseapp.com",
  projectId: "cg-taco-truck",
  storageBucket: "cg-taco-truck.firebasestorage.app",
  messagingSenderId: "843337842416",
  appId: "1:843337842416:web:a78220628e82b3f9768c35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

setLogLevel('debug')

export { db, collection, addDoc, doc, setDoc };