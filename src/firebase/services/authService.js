import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config";

export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login Error:", error);
    // Throw the original error or a more descriptive one
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    throw new Error("Failed to secure sign out");
  }
};

export const subscribeToAuthChanges = (callback) => {
  // Returns the unsubscribe function
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
