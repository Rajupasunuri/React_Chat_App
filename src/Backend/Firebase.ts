// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALLH_vq3Qsv3xE74IvFW2_Viw0gQBuKck",
  authDomain: "teachers-app-eec16.firebaseapp.com",
  projectId: "teachers-app-eec16",
  storageBucket: "teachers-app-eec16.appspot.com",
  messagingSenderId: "914291516897",
  appId: "1:914291516897:web:551b40cc553577dd86dea0",
  measurementId: "G-JQH62YDKF4"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(); // working with authentication services

export { db, auth };
