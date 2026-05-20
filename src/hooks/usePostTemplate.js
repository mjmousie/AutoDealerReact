import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";

export const DEFAULT_TEMPLATE = `🚗 {{year}} {{make}} {{model}} {{trim}}

💰 {{price}}
🛣️ {{mileage}}
⚙️ {{transmission}} · {{drivetrain}}
🏷️ Condition: {{condition}}

{{description}}

📍 {{dealerName}}
📞 {{dealerPhone}}
🔗 Visit us at {{dealerAddress}}

#UsedCars #{{make}} #{{model}} #CarDealership`;

export function usePostTemplate() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const docSnap = await getDoc(doc(db, "settings", "postTemplate"));
        if (docSnap.exists()) {
          setTemplate(docSnap.data().template);
          setLastSaved(docSnap.data().updatedAt);
        }
      } catch (err) {
        console.error("[usePostTemplate] Load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, []);

  const saveTemplate = useCallback(async (newTemplate) => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "postTemplate"), {
        template: newTemplate,
        updatedAt: serverTimestamp(),
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("[usePostTemplate] Save failed:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { template, setTemplate, loading, saving, lastSaved, saveTemplate };
}
