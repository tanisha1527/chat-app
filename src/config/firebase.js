
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyABqkeU_FhgrNH6QudgVLfrdsMwtI0QrEQ",
  authDomain: "chat-app-dd079.firebaseapp.com",
  projectId: "chat-app-dd079",
  storageBucket: "chat-app-dd079.firebasestorage.app",
  messagingSenderId: "587589542582",
  appId: "1:587589542582:web:deeff0c164f3ca95b7fc17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async(username,email,password) => {
     try {
          const res = await createUserWithEmailAndPassword(auth,email,password);
          const user = res.user;
          await setDoc(doc(db,"users",user.uid),{
               id:user.uid,
               username:username.toLowerCase(),
               email,
               name:"",
               avatar:"",
               bio:"Hey, There i am using chat app",
               lastSeen:Date.now()
          })
          await setDoc(doc(db,"chats",user.uid),{
              chatData:[]
          })
     } catch (error) {
         console.error(error);
         toast.error(error.code.split('/')[1].split('-').join(" "));
      
     }
}

const login = async (email,password) => {
       try {
          await signInWithEmailAndPassword(auth,email,password);
       } catch (error) {
          console.error(error);
          toast.error(error.code.split('/')[1].split('-').join(" "));
       }
}

const logout = async  () => {
     try {
         await signOut(auth)  
     } catch (error) {
         console.error(error);
         toast.error(error.code.split('/')[1].split('-').join(" "));
     }
}

export {signup,login,logout,auth,db}