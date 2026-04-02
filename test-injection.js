import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function injectTestProject() {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      title: "Automated Metadata Test",
      subtitle: "Bento Gallery Validation",
      description: "A specialized test project with rich image metadata to verify the interactive gallery component.",
      category: "Architecture",
      createdAt: serverTimestamp(),
      images: [
        {
          url: "https://images.unsplash.com/photo-1448375240586-882707db888b",
          title: "Root Visualization",
          desc: "The core architectural massing.",
          type: "image"
        },
        {
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
          title: "Detailed Perspective",
          desc: "Exploring the interaction between light and material.",
          type: "image"
        },
        {
          url: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
          title: "Twilight Horizon",
          desc: "Ambient lighting conditions during golden hour.",
          type: "image"
        }
      ]
    });
    console.log("Test project injected with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

injectTestProject();
