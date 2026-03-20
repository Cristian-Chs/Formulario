import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc, doc, where } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firebase";

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

export const saveSurveyResponse = async (userId: string, profile: any, responses: any) => {
  try {
    const docRef = await addDoc(collection(db, "survey_responses"), {
      userId,
      userProfile: {
        name: profile.displayName,
        email: profile.email,
        photo: profile.photoURL,
      },
      responses,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving survey response:", error);
    throw error;
  }
};

export const hasUserCompletedSurvey = async (userId: string) => {
  try {
    const q = query(collection(db, "survey_responses"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking completion:", error);
    return false;
  }
};

export const getAllResponses = async () => {
  try {
    const q = query(collection(db, "survey_responses"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching responses:", error);
    throw error;
  }
};

export const getQuestions = async () => {
  try {
    const q = query(collection(db, "questions"), orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
};

export const addQuestion = async (question: any) => {
  try {
    const docRef = await addDoc(collection(db, "questions"), {
      ...question,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
};

export const updateQuestion = async (id: string, question: any) => {
  try {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, { ...question, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (id: string) => {
  try {
    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};
