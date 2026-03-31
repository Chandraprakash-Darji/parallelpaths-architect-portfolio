import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, getDoc, doc } from "firebase/firestore";
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
    if (!projectData.title || !projectData.description || !projectData.images) {
      throw new Error("Missing required project fields");
    }

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      title: projectData.title.trim(),
      description: projectData.description.trim(),
      images: projectData.images, // Array of URLs
      splineUrl: projectData.splineUrl || null,
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project entry");
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
