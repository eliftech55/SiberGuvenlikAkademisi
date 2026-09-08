import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager,
    getFirestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqsZL3oo1X8hpI2Nvx_Xh24Yv36T7mjOI",
  authDomain: "cyberacademyquest.firebaseapp.com",
  projectId: "cyberacademyquest",
  storageBucket: "cyberacademyquest.firebasestorage.app",
  messagingSenderId: "555846748729",
  appId: "1:555846748729:web:b7b096b0fb742881d65be8",
  measurementId: "G-VWYXBLLRES"
};

// Initialize Firebase App (avoid duplicates)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence in browser
let dbInstance;
try {
    if (typeof window !== 'undefined') {
        dbInstance = initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
    } else {
        dbInstance = getFirestore(app);
    }
} catch (e) {
    // If persistence is already initialized or fails, fallback to standard getFirestore
    dbInstance = getFirestore(app);
}

export const db = dbInstance;
export default app;
