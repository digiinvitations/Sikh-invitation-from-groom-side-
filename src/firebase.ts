import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfG-dTlC3EBkk9p2TJBy3X92-HO4PZOWU",
  authDomain: "english-wedding-template.firebaseapp.com",
  projectId: "english-wedding-template",
  storageBucket: "english-wedding-template.firebasestorage.app",
  messagingSenderId: "467267427353",
  appId: "1:467267427353:web:0c968d348d43d3784b9e88",
  measurementId: "G-5Q99QW9WJ7"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Use experimentalForceLongPolling to avoid WebChannel streaming timeouts in sandboxed iframes & proxies
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

