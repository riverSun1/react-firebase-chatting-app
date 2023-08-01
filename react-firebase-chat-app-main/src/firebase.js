import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/database";
import "firebase/compat/storage";

// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyADQV8VH1bGNTYrFkqUFIVbqUuqpmsrvPo",
  authDomain: "react-firebase-chat-app-2dddf.firebaseapp.com",
  projectId: "react-firebase-chat-app-2dddf",
  storageBucket: "react-firebase-chat-app-2dddf.appspot.com",
  messagingSenderId: "164408538298",
  appId: "1:164408538298:web:da784e311737253c373e83",
  measurementId: "G-FNYBH9W5ZF",
  databaseURL:
    "https://react-firebase-chat-app-2dddf-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default firebase;
