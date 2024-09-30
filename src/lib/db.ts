import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export const addDocument = (collectionName: string, data: any) => {
  return addDoc(collection(db, collectionName), data);
};

export const updateDocument = (
  collectionName: string,
  id: string,
  data: any,
) => {
  const docRef = doc(db, collectionName, id);
  return updateDoc(docRef, data);
};

export const deleteDocument = (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef);
};

export const getDocument = (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  return getDoc(docRef);
};

export const getDocuments = (collectionName: string, conditions?: any[]) => {
  let q = collection(db, collectionName);
  if (conditions) {
    conditions.forEach((condition) => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
  }
  return getDocs(q);
};
