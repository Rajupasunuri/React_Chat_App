// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8GHEQjWIpznStfmHSrLJG-aZexkujqTA",
  authDomain: "react-typescript-cf404.firebaseapp.com",
  projectId: "react-typescript-cf404",
  storageBucket: "react-typescript-cf404.appspot.com",
  messagingSenderId: "408821201284",
  appId: "1:408821201284:web:7427aeaad5c90e813145d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(); // working with authentication services

export { db, auth };
