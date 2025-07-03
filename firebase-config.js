const firebaseConfig = {
  apiKey: "AIzaSyAcGbLZWeEpEVJH4U1i_CrJoi3s-FYNlOY",
  authDomain: "points-table-79de2.firebaseapp.com",
  databaseURL: "https://points-table-79de2-default-rtdb.firebaseio.com",
  projectId: "points-table-79de2",
  storageBucket: "points-table-79de2.firebasestorage.app",
  messagingSenderId: "264011160943",
  appId: "1:264011160943:web:31f353ebff3e7835195c9a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();