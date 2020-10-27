// firebase.js
// import * as firebase from "firebase/app";
import firebase from 'firebase/app';
import Environment from "./environment";
// import "firebase/firestore";
import 'firebase/storage';

var firebaseConfig = {
  apiKey: Environment["FIREBASE_API_KEY"],
  authDomain: Environment["FIREBASE_AUTH_DOMAIN"],
  databaseURL: Environment["FIREBASE_DATABASE_URL"],
  projectId: Environment["FIREBASE_PROJECT_ID"],
  storageBucket: Environment["FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: Environment["FIREBASE_MESSAGING_SENDER_ID"],
};

// firebase.initializeApp({
//   apiKey: Environment["FIREBASE_API_KEY"],
//   authDomain: Environment["FIREBASE_AUTH_DOMAIN"],
//   databaseURL: Environment["FIREBASE_DATABASE_URL"],
//   projectId: Environment["FIREBASE_PROJECT_ID"],
//   storageBucket: Environment["FIREBASE_STORAGE_BUCKET"],
//   messagingSenderId: Environment["FIREBASE_MESSAGING_SENDER_ID"],
// });

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase;
