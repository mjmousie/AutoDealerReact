// src/hooks/useInventory.js
// ─────────────────────────────────────────────────────────────
// Custom hook encapsulating all Firestore operations for the
// `inventory` collection.  Components never import firebase
// directly — they only consume this hook.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase.config";
import { MAX_FEATURED, MAX_IMAGES } from "../utils/constants";

// ── Collection reference ──────────────────────────────────────
const INVENTORY_COL = "inventory";
const inventoryRef = collection(db, INVENTORY_COL);

// ─────────────────────────────────────────────────────────────
// Public inventory hook — for customer-facing pages
// Returns only cars that are NOT marked as sold.
// ─────────────────────────────────────────────────────────────
export function usePublicInventory(filters = {}) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Always exclude sold cars from the public feed
    const constraints = [where("isSold", "==", false), orderBy("createdAt", "desc")];

    const q = query(inventoryRef, ...constraints);

    // Real-time listener so sold/featured updates appear instantly
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Client-side filtering for make / max price / max mileage
        if (filters.make) {
          results = results.filter(
            (c) => c.make.toLowerCase() === filters.make.toLowerCase()
          );
        }
        if (filters.maxPrice) {
          results = results.filter((c) => c.price <= filters.maxPrice);
        }
        if (filters.maxMileage) {
          results = results.filter((c) => c.mileage <= filters.maxMileage);
        }

        setCars(results);
        setLoading(false);
      },
      (err) => {
        console.error("[usePublicInventory]", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.make, filters.maxPrice, filters.maxMileage]);

  return { cars, loading, error };
}

// ─────────────────────────────────────────────────────────────
// Featured cars hook — max 4, for the homepage hero section
// ─────────────────────────────────────────────────────────────
export function useFeaturedCars() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      inventoryRef,
      where("isFeatured", "==", true),
      where("isSold", "==", false),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs
          .slice(0, MAX_FEATURED)
          .map((d) => ({ id: d.id, ...d.data() }));
        setFeatured(results);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { featured, loading, error };
}

// ─────────────────────────────────────────────────────────────
// Single car by VIN — for the Detail page
// ─────────────────────────────────────────────────────────────
export function useCarByVin(vin) {
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!vin) return;

    let cancelled = false;

    async function fetchCar() {
      try {
        const q = query(inventoryRef, where("vin", "==", vin));
        const snapshot = await getDocs(q);

        if (cancelled) return;

        if (snapshot.empty) {
          setCar(null);
        } else {
          const d = snapshot.docs[0];
          setCar({ id: d.id, ...d.data() });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCar();

    return () => { cancelled = true; };
  }, [vin]);

  return { car, loading, error };
}

// ─────────────────────────────────────────────────────────────
// Admin inventory hook — sees ALL cars including sold ones
// Contains all mutating operations (add, update, delete)
// ─────────────────────────────────────────────────────────────
export function useAdminInventory() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Real-time listener (all cars, sold included) ────────────
  useEffect(() => {
    const q = query(inventoryRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCars(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ── Image upload pipeline ───────────────────────────────────
  // Accepts an array of already-compressed File objects (WebP).
  // Returns an array of public download URLs.
  const uploadImages = useCallback(async (files, vin) => {
    if (!files || files.length === 0) return [];
    if (files.length > MAX_IMAGES) {
      throw new Error(`Maximum ${MAX_IMAGES} images per vehicle.`);
    }

    setUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let completedFiles = 0;

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `inventory/${vin}/${filename}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Aggregate progress across all files
            const fileProgress = snapshot.bytesTransferred / snapshot.totalBytes;
            const overallProgress =
              ((completedFiles + fileProgress) / totalFiles) * 100;
            setUploadProgress(Math.round(overallProgress));
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            completedFiles++;
            resolve(url);
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // ── Add a new car ───────────────────────────────────────────
  /**
   * @param {Object} carData  - Form fields (make, model, year, price, etc.)
   * @param {File[]} imageFiles - Array of compressed WebP File objects
   * @returns {Promise<string>} - New Firestore document ID
   */
  const addCar = useCallback(
    async (carData, imageFiles = []) => {
      // Guard: check VIN uniqueness
      const vinCheck = query(inventoryRef, where("vin", "==", carData.vin));
      const existing = await getDocs(vinCheck);
      if (!existing.empty) {
        throw new Error(`A vehicle with VIN "${carData.vin}" already exists.`);
      }

      // Guard: featured cap
      if (carData.isFeatured) {
        const featuredCount = cars.filter(
          (c) => c.isFeatured && !c.isSold
        ).length;
        if (featuredCount >= MAX_FEATURED) {
          throw new Error(
            `Cannot feature this vehicle — the maximum of ${MAX_FEATURED} featured vehicles has been reached.`
          );
        }
      }

      let imageUrls = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles, carData.vin);
      }

      const docRef = await addDoc(inventoryRef, {
        make: carData.make.trim(),
        model: carData.model.trim(),
        year: Number(carData.year),
        price: Number(carData.price),
        mileage: Number(carData.mileage),
        vin: carData.vin.trim().toUpperCase(),
        description: carData.description?.trim() || "",
        isSold: false,
        isFeatured: Boolean(carData.isFeatured),
        images: imageUrls,
        createdAt: serverTimestamp(),
        bodyType: carData.bodyType?.trim() || "",
        engine: carData.engine?.trim() || "",
        transmission: carData.transmission?.trim() || "",
        drivetrain: carData.drivetrain?.trim() || "",
        condition: carData.condition?.trim() || "",
      });

      return docRef.id;
    },
    [cars, uploadImages]
  );

  // ── Update existing car fields ──────────────────────────────
  /**
   * @param {string} docId     - Firestore document ID
   * @param {Object} updates   - Partial fields to update
   * @param {File[]} newImages - Optional new images to append
   */
  const updateCar = useCallback(
    async (docId, updates, newImages = []) => {
      // Guard: featured cap (only if toggling on)
      if (updates.isFeatured === true) {
        const featuredCount = cars.filter(
          (c) => c.isFeatured && !c.isSold && c.id !== docId
        ).length;
        if (featuredCount >= MAX_FEATURED) {
          throw new Error(
            `Cannot feature this vehicle — the maximum of ${MAX_FEATURED} featured vehicles has been reached.`
          );
        }
      }

      let additionalUrls = [];
      if (newImages.length > 0) {
        // Get current car to check total image count
        const docSnap = await getDoc(doc(db, INVENTORY_COL, docId));
        const currentImages = docSnap.data()?.images || [];
        if (currentImages.length + newImages.length > MAX_IMAGES) {
          throw new Error(
            `Cannot add ${newImages.length} image(s) — this would exceed the ${MAX_IMAGES} image limit.`
          );
        }
        const vin = docSnap.data()?.vin;
        additionalUrls = await uploadImages(newImages, vin);
        updates.images = [...currentImages, ...additionalUrls];
      }

      await updateDoc(doc(db, INVENTORY_COL, docId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    },
    [cars, uploadImages]
  );

  // ── Mark as Sold (keeps record, hides from public) ──────────
  const markAsSold = useCallback(async (docId) => {
    await updateDoc(doc(db, INVENTORY_COL, docId), {
      isSold: true,
      isFeatured: false, // Sold cars can't be featured
      soldAt: serverTimestamp(),
    });
  }, []);

  // ── Toggle featured (with cap enforcement) ──────────────────
  const toggleFeatured = useCallback(
    async (docId, currentValue) => {
      if (!currentValue) {
        // Turning ON — check cap
        const featuredCount = cars.filter(
          (c) => c.isFeatured && !c.isSold
        ).length;
        if (featuredCount >= MAX_FEATURED) {
          throw new Error(
            `Max ${MAX_FEATURED} featured vehicles allowed. Unfeature another car first.`
          );
        }
      }
      await updateDoc(doc(db, INVENTORY_COL, docId), {
        isFeatured: !currentValue,
        updatedAt: serverTimestamp(),
      });
    },
    [cars]
  );

  // ── Delete a car (also removes all Storage images) ──────────
  const deleteCar = useCallback(async (docId) => {
    const docSnap = await getDoc(doc(db, INVENTORY_COL, docId));
    if (!docSnap.exists()) throw new Error("Vehicle not found.");

    const imageUrls = docSnap.data()?.images || [];

    // Delete images from Storage (non-blocking — best effort)
    const deleteImagePromises = imageUrls.map((url) => {
      try {
        const imgRef = ref(storage, url);
        return deleteObject(imgRef).catch(() => {}); // silently ignore missing files
      } catch {
        return Promise.resolve();
      }
    });

    await Promise.all(deleteImagePromises);
    await deleteDoc(doc(db, INVENTORY_COL, docId));
  }, []);

  // ── Remove a single image from a car ───────────────────────
  const deleteImage = useCallback(async (docId, imageUrl) => {
    // Remove from Storage
    try {
      const imgRef = ref(storage, imageUrl);
      await deleteObject(imgRef);
    } catch {
      // File may already be deleted — continue
    }

    // Remove URL from Firestore array
    const docSnap = await getDoc(doc(db, INVENTORY_COL, docId));
    const updatedImages = (docSnap.data()?.images || []).filter(
      (url) => url !== imageUrl
    );
    await updateDoc(doc(db, INVENTORY_COL, docId), {
      images: updatedImages,
      updatedAt: serverTimestamp(),
    });
  }, []);

  return {
    // State
    cars,
    loading,
    error,
    uploading,
    uploadProgress,
    // Actions
    addCar,
    updateCar,
    markAsSold,
    toggleFeatured,
    deleteCar,
    deleteImage,
    uploadImages,
  };
}
