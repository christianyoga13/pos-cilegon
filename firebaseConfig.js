import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSQdUqkVlB-OlqBMDG3MSXGuwLTPdt964",
  authDomain: "booking-lapangan-e0597.firebaseapp.com",
  projectId: "booking-lapangan-e0597",
  storageBucket: "booking-lapangan-e0597.appspot.com",
  messagingSenderId: "230229844936",
  appId: "1:230229844936:web:5e793ecb4dd04b539816fd",
  measurementId: "G-GDD977W1VJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
