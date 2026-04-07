import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, push, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA8vZK67J-CSHSiz6RgCS6TI1YpxVENkmk",
  authDomain: "nossa-casa-92ffe.firebaseapp.com",
  databaseURL: "https://nossa-casa-92ffe-default-rtdb.firebaseio.com",
  projectId: "nossa-casa-92ffe",
  storageBucket: "nossa-casa-92ffe.firebasestorage.app",
  messagingSenderId: "13377388728",
  appId: "1:13377388728:web:f32a6cf2c794d8a30db44d",
  measurementId: "G-Z0DF6RQ26R"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, update, push, remove };
