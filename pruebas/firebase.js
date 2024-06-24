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
  apiKey: "AIzaSyCO4gD9aCng3I4LOgTd6lP0wzOg01NV76w",
  authDomain: "aiwa-1db09.firebaseapp.com",
  projectId: "aiwa-1db09",
  storageBucket: "aiwa-1db09.appspot.com",
  messagingSenderId: "890212055814",
  appId: "1:890212055814:web:b447cfbdc92ff41cedbc87",
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

