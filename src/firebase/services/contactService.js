import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../config";

const CONTACTS_COLLECTION = "contacts";

export const submitContactForm = async (data) => {
  try {
    // Basic validation
    if (!data.name || !data.email || !data.message) {
      throw new Error("Missing required fields");
    }

    // Submit to Firestore
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      name: data.name.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Firestore Write Error (Contact):");
    console.error("Status:", error.code);
    console.error("Message:", error.message);
    throw new Error(error.message || "Failed to submit contact form");
  }
};

export const fetchContacts = async () => {
  try {
    const q = query(collection(db, CONTACTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error("Failed to load contacts");
  }
};
