import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config";

const PROJECTS_COLLECTION = "projects";

export const fetchProjects = async () => {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to load projects");
  }
};

export const createProject = async (projectData) => {
  try {
    // Validate required fields
    if (!projectData.title || !projectData.philosophy || !projectData.images) {
      const missing = [];
      if (!projectData.title) missing.push("title");
      if (!projectData.philosophy) missing.push("philosophy");
      if (!projectData.images) missing.push("images");
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    console.log("--- Firestore Write: Creating Project ---");
    console.log("Payload:", JSON.stringify(projectData, null, 2));

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("Firestore Success: Project ID", docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Firestore Write Error (Create):", error);
    // Return original firebase error if available, else generic
    throw new Error(error.message || "Failed to create project entry");
  }
};

export const getProjectById = async (id) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching project:", error);
    throw new Error("Failed to load project details");
  }
};

export const updateProject = async (id, updatedData) => {
  try {
    console.log(`--- Firestore Write: Updating Project ${id} ---`);
    console.log("Payload:", JSON.stringify(updatedData, null, 2));

    const docRef = doc(db, PROJECTS_COLLECTION, id);
    const updatePayload = {
      ...updatedData,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updatePayload);
    
    console.log("Firestore Success: Project updated");
    return { success: true };
  } catch (error) {
    console.error("Firestore Write Error (Update):", error);
    throw new Error(error.message || "Failed to update project entry");
  }
};

export const deleteProject = async (id) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project entry");
  }
};
