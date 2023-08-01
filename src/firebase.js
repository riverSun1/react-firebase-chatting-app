import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database";
import "firebase/compat/storage";

// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAu0B64bMI0_5PYkGI82_H265lnMk1GGJ4",
  authDomain: "chat-35caf.firebaseapp.com",
  databaseURL: "https://chat-35caf-default-rtdb.firebaseio.com",
  projectId: "chat-35caf",
  storageBucket: "chat-35caf.appspot.com",
  messagingSenderId: "398515968462",
  appId: "1:398515968462:web:59eaedb03bb8b23d60739f",
  measurementId: "G-0SSE8B61WB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default firebase;