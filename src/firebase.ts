import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDc99bkmPd7kXktvAm7gLlRuPIhf7mOaV4",
  authDomain: "daroui.firebaseapp.com",
  projectId: "daroui",
  storageBucket: "daroui.firebasestorage.app",
  messagingSenderId: "821701960446",
  appId: "1:821701960446:web:fdc48a59205f7bffd6fbaf",
  measurementId: "G-Q0TKP8XK0K"
};


const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);