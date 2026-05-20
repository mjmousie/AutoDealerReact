// ═══════════════════════════════════════════════════════════════
// Handles test-drive lead submission to Firestore `leads` collection.
// Admin notification is triggered via a Firestore-triggered
// Cloud Function (see setup note below).
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";

const LEADS_COL = "leads";

/**
 * @returns {{ submit, loading, success, error, reset }}
 *
 * Cloud Function note:
 * Deploy a Firestore onCreate trigger on `leads/{docId}` that sends
 * an email via SendGrid / Nodemailer / Resend to the admin.
 * The lead document contains all fields needed for the email body.
 *
 * Example Cloud Function (functions/index.js):
 *   exports.onNewLead = onDocumentCreated("leads/{docId}", async (event) => {
 *     const lead = event.data.data();
 *     await sendEmail({ to: ADMIN_EMAIL, subject: "New Test Drive Request", ... });
 *   });
 */
export function useLeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Submit a test-drive request.
   * @param {Object} formData
   * @param {string} formData.name
   * @param {string} formData.email
   * @param {string} formData.phone
   * @param {string} formData.preferredDate   - ISO date string (YYYY-MM-DD)
   * @param {string} formData.preferredTime   - e.g. "2:00 PM"
   * @param {string} formData.message
   * @param {Object} car - { vin, year, make, model, id }
   */
  const submit = useCallback(async (formData, car) => {
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, LEADS_COL), {
        // Customer info
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || "",
        // Appointment
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        message: formData.message?.trim() || "",
        // Vehicle reference
        vehicleVin: car.vin,
        vehicleTitle: `${car.year} ${car.make} ${car.model}`,
        vehicleId: car.id,
        // Status
        status: "new",        // new | contacted | booked | closed
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err) {
      console.error("[useLeadForm]", err);
      setError("Failed to submit your request. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSuccess(false);
    setError(null);
  }, []);

  return { submit, loading, success, error, reset };
}