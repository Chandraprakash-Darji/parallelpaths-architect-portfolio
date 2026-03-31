import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config";

const SETTINGS_COLLECTION = "settings";
const GLOBAL_DOC_ID = "global";

export const getSettings = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {}; // Return empty if not initialized
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {};
  }
};

export const updateSetting = async (key, value) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_DOC_ID);
    await setDoc(docRef, { [key]: value }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw new Error(`Failed to update ${key}`);
  }
};
