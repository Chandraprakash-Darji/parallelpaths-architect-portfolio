import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config";

/**
 * Uploads a file (Blob or File) to Firebase Storage and returns the download URL.
 * @param {Blob|File} file - The file to upload.
 * @param {string} path - The storage path (e.g., 'projects/image-1.jpg').
 * @returns {Promise<string>} - The download URL.
 */
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Storage upload error:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};
