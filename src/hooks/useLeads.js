import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const deleteLead = useCallback(async (docId) => {
    await deleteDoc(doc(db, "leads", docId));
  }, []);

  return { leads, loading, error, deleteLead };
}
