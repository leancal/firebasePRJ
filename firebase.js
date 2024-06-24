import firebase from 'firebase/compat/app';
import "firebase/compat/auth";
import "firebase/compat/firestore"
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHTakR03yBI5SW-AP7KIwsRW8VEJCdJpc",
  authDomain: "aiwa-auth.firebaseapp.com",
  projectId: "aiwa-auth",
  storageBucket: "aiwa-auth.appspot.com",
  messagingSenderId: "884134524419",
  appId: "1:884134524419:web:55120ae51020411d9b0036"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app)
const auth = firebase.auth()
const storage = getStorage(app);

export { auth, db };
//export default db;
export { app, firebaseConfig, storage };
export default app;

