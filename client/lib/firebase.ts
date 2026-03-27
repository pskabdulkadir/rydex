// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGX5376MHZu0JJ__MQbyVl8XdFHUVS6GM",
  authDomain: "tskgoruntuleme.firebaseapp.com",
  projectId: "tskgoruntuleme",
  storageBucket: "tskgoruntuleme.firebasestorage.app",
  messagingSenderId: "346360092609",
  appId: "1:346360092609:web:0ad2be403daf26ac974140"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
