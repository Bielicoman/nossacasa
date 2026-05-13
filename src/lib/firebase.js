import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey-PleaseReplaceWithRealKey",
  authDomain: "nossacasa-app.firebaseapp.com",
  projectId: "nossacasa-app",
  storageBucket: "nossacasa-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── DATABASE SCHEMA PLAN ───
/*
  Collection: `users`
  Doc ID: `uid`
  Data:
    - name: string
    - email: string
    - currentHouseId: string | null
    - photoURL: string

  Collection: `houses`
  Doc ID: `houseId`
  Data:
    - name: string
    - createdBy: uid
    - members: array of uids
    - inviteCode: string

  Collection: `houses/{houseId}/items`
  Doc ID: `itemId`
  Data:
    - name: string
    - price: number
    - room: string
    - purchased: boolean
    - addedBy: uid
    - createdAt: timestamp
    - imageUrl: string | null
    - linkUrl: string | null
    - notes: string | null
*/
