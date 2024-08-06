// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwKGOhwmHdjjXXW0jM3mZydixU54IeZc0",
  authDomain: "inventory-management-pro-bfb20.firebaseapp.com",
  projectId: "inventory-management-pro-bfb20",
  storageBucket: "inventory-management-pro-bfb20.appspot.com",
  messagingSenderId: "335383261181",
  appId: "1:335383261181:web:4f2d63da17c692756b3394",
  measurementId: "G-ENRQM0VFKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)
const auth = getAuth(app)

export {app, firestore, auth}