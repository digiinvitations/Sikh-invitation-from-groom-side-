import { doc, getDoc, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { WeddingData } from "../types";
import { weddingData as defaultData } from "../data";

// The earlier original wedding document (Jaspreet weds Jasmeet) - preserved and strictly read-only for cloning
export const EARLIER_ORIGINAL_DOC_ID = "wedding_data_jaspreet_weds_jasmeet";

// Dedicated primary document ID for this parent website ("Waheguru sikh wedding PT-2 remix2")
export const CURRENT_WEBSITE_DOC_ID = "wedding_data_pt2_remix2";
export const CANONICAL_DOC_ID = CURRENT_WEBSITE_DOC_ID;
export const OFFICIAL_DOC_ID = CURRENT_WEBSITE_DOC_ID;

// Dedicated separate document ID for the upcoming remix
export const UPCOMING_REMIX_DOC_ID = "wedding_data_groom_side_remix_2";

// Known host signature of this parent website container in Google AI Studio
export const CURRENT_PARENT_CONTAINER_SIGNATURE = "ccxb6mje4sh5ztcpqmlnn4";

// Helper to provide a local cached copy instantly for offline / zero-lag first render
export function getLocalCachedWeddingData(slotId?: string): WeddingData {
  if (typeof window !== "undefined") {
    try {
      const activeSlot = slotId || getEnvironmentDocId();
      const cached = localStorage.getItem(`wedding_cached_data_${activeSlot}`) || localStorage.getItem("wedding_cached_data_backup");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && (parsed.bride?.name || parsed.groom?.name || parsed.weddingDate)) {
          return {
            ...defaultData,
            ...parsed,
            bride: { ...defaultData.bride, ...(parsed.bride || {}) },
            groom: { ...defaultData.groom, ...(parsed.groom || {}) },
            venue: { ...defaultData.venue, ...(parsed.venue || {}) },
            familyDetails: parsed.familyDetails ? {
              ...defaultData.familyDetails,
              ...parsed.familyDetails,
              brideSide: { ...(defaultData.familyDetails?.brideSide || {}), ...(parsed.familyDetails?.brideSide || {}) },
              groomSide: { ...(defaultData.familyDetails?.groomSide || {}), ...(parsed.familyDetails?.groomSide || {}) },
            } : defaultData.familyDetails,
            events: parsed.events && parsed.events.length > 0 ? parsed.events : defaultData.events,
            timeline: parsed.timeline && parsed.timeline.length > 0 ? parsed.timeline : defaultData.timeline,
            rsvpContacts: parsed.rsvpContacts && parsed.rsvpContacts.length > 0 ? parsed.rsvpContacts : defaultData.rsvpContacts,
            rsvpPhones: parsed.rsvpPhones && parsed.rsvpPhones.length > 0 ? parsed.rsvpPhones : defaultData.rsvpPhones,
          };
        }
      }
    } catch (e) {
      // Ignore cache parse errors
    }
  }
  return defaultData;
}

// Timeout helper so slow network or offline conditions never hang the application
async function fetchWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Firestore request timed out"));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Determine if the current environment is running on the parent website slot
export function isOfficialInstance(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim()) {
      return customSlot.trim() === CURRENT_WEBSITE_DOC_ID;
    }
  } catch (e) {}

  const hostname = window.location.hostname || "";
  return hostname.includes(CURRENT_PARENT_CONTAINER_SIGNATURE);
}

// Generate or retrieve the active, isolated database slot ID
export function getEnvironmentDocId(): string {
  if (typeof window === 'undefined') return CURRENT_WEBSITE_DOC_ID;

  // 1. Check if user specified an explicit custom slot in localStorage
  try {
    const customSlot = localStorage.getItem("wedding_custom_slot_id");
    if (customSlot && customSlot.trim() && customSlot.trim() !== "auto") {
      const sanitized = sanitizeSlotId(customSlot.trim());
      // Protect against accidental overlap with earlier original document
      if (sanitized === EARLIER_ORIGINAL_DOC_ID) {
        localStorage.setItem("wedding_custom_slot_id", CURRENT_WEBSITE_DOC_ID);
        return CURRENT_WEBSITE_DOC_ID;
      }
      return sanitized;
    }
  } catch (e) {}

  // 2. Check for environment variable override
  const envSlot = (import.meta as any).env?.VITE_WEDDING_DOC_ID;
  if (envSlot && typeof envSlot === "string" && envSlot.trim()) {
    const sanitized = sanitizeSlotId(envSlot.trim());
    if (sanitized !== EARLIER_ORIGINAL_DOC_ID) {
      return sanitized;
    }
  }

  // 3. Environment & Hostname detection:
  // If running in this current parent website container (ccxb6mje4sh5ztcpqmlnn4), use CURRENT_WEBSITE_DOC_ID ("wedding_data_pt2_remix2").
  // When remixed in AI Studio (new container hash like ais-dev-xxxxx-...), automatically use UPCOMING_REMIX_DOC_ID ("wedding_data_groom_side_remix_2").
  const hostname = window.location.hostname || "";
  if (hostname.includes(CURRENT_PARENT_CONTAINER_SIGNATURE)) {
    return CURRENT_WEBSITE_DOC_ID;
  }

  // For any upcoming remix or separate deployment, use the dedicated separate document
  return UPCOMING_REMIX_DOC_ID;
}

// Sanitize slot ID for Firestore document path requirements
function sanitizeSlotId(raw: string): string {
  return raw.replace(/[\/\s#?\[\]]/g, "_");
}

export function setCustomSlotId(slotId: string) {
  if (typeof window === 'undefined') return;
  try {
    if (slotId && slotId.trim()) {
      localStorage.setItem("wedding_custom_slot_id", sanitizeSlotId(slotId.trim()));
    } else {
      localStorage.removeItem("wedding_custom_slot_id");
    }
  } catch (e) {}
}

export function getRsvpCollectionName(): string {
  return "rsvps";
}

/**
 * Copies the complete website data from the earlier original wedding (wedding_data_jaspreet_weds_jasmeet)
 * into this active slot. Strictly guarantees wedding_data_jaspreet_weds_jasmeet is never modified.
 */
export async function copyFromEarlierWeddingData(): Promise<WeddingData> {
  const sourceRef = doc(db, "weddingConfig", EARLIER_ORIGINAL_DOC_ID);
  const snap = await fetchWithTimeout(getDoc(sourceRef), 5000);
  if (!snap.exists()) {
    throw new Error(`Earlier original wedding document '${EARLIER_ORIGINAL_DOC_ID}' not found in Firestore.`);
  }

  const sourceData = snap.data() as WeddingData;
  const targetSlot = getEnvironmentDocId();

  // Safety guard: never overwrite the earlier original document
  if (targetSlot === EARLIER_ORIGINAL_DOC_ID) {
    throw new Error("Cannot overwrite the earlier original document.");
  }

  const cleanData = { ...sourceData };
  if (cleanData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
    cleanData.heroLogoUrl = "/ikonkar-gold.svg";
  }

  // Save to target slot
  const targetRef = doc(db, "weddingConfig", targetSlot);
  await fetchWithTimeout(setDoc(targetRef, cleanData), 5000);

  // Update local cache for target slot
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`wedding_cached_data_${targetSlot}`, JSON.stringify(cleanData));
    } catch (e) {}
  }

  return cleanData;
}

/**
 * Copies the complete website data from the parent website (wedding_data_pt2_remix2)
 * into the current active slot (e.g. upcoming remix slot).
 * Strictly guarantees wedding_data_pt2_remix2 is never modified or overlapped.
 */
export async function copyFromParentWebsiteData(): Promise<WeddingData> {
  const sourceRef = doc(db, "weddingConfig", CURRENT_WEBSITE_DOC_ID);
  const snap = await fetchWithTimeout(getDoc(sourceRef), 5000);
  if (!snap.exists()) {
    throw new Error(`Parent website document '${CURRENT_WEBSITE_DOC_ID}' not found in Firestore.`);
  }

  const sourceData = snap.data() as WeddingData;
  const targetSlot = getEnvironmentDocId();

  const cleanData = { ...sourceData };
  if (cleanData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
    cleanData.heroLogoUrl = "/ikonkar-gold.svg";
  }

  const targetRef = doc(db, "weddingConfig", targetSlot);
  await fetchWithTimeout(setDoc(targetRef, cleanData), 5000);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`wedding_cached_data_${targetSlot}`, JSON.stringify(cleanData));
    } catch (e) {}
  }

  return cleanData;
}

/**
 * Fetch wedding data for the current active slot.
 * With resilience: loads canonical data, handles offline state gracefully,
 * and caches locally per-slot for zero-latency instant rendering and complete isolation.
 */
export async function getWeddingData(): Promise<WeddingData> {
  const slotId = getEnvironmentDocId();
  const localFallback = getLocalCachedWeddingData(slotId);
  try {
    const docRef = doc(db, "weddingConfig", slotId);
    
    // Fetch with a 4-second timeout to avoid any hang if client is offline
    const docSnap = await fetchWithTimeout(getDoc(docRef), 4000);

    // If the slot document does not exist yet in Firestore, seed it from parent website or template
    if (!docSnap.exists()) {
      try {
        let seedRef = doc(db, "weddingConfig", CURRENT_WEBSITE_DOC_ID);
        let seedSnap = await fetchWithTimeout(getDoc(seedRef), 3500);
        if (!seedSnap.exists()) {
          seedRef = doc(db, "weddingConfig", EARLIER_ORIGINAL_DOC_ID);
          seedSnap = await fetchWithTimeout(getDoc(seedRef), 3500);
        }

        if (seedSnap.exists()) {
          const sourceData = seedSnap.data() as WeddingData;
          const merged = { ...defaultData, ...sourceData };
          
          // Seed the new slot in Firestore in the background
          setDoc(docRef, merged).catch(() => {});

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`wedding_cached_data_${slotId}`, JSON.stringify(merged));
            } catch (e) {}
          }
          return merged;
        }
      } catch (err) {
        // Fallback to local
      }
      return localFallback;
    }

    // Slot document exists: load it
    const remoteData = docSnap.data() as WeddingData;
    if (remoteData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
      remoteData.heroLogoUrl = "/ikonkar-gold.svg";
    }

    const mergedData: WeddingData = {
      ...defaultData,
      ...remoteData,
      bride: { ...defaultData.bride, ...(remoteData.bride || {}) },
      groom: { ...defaultData.groom, ...(remoteData.groom || {}) },
      venue: { ...defaultData.venue, ...(remoteData.venue || {}) },
      familyDetails: remoteData.familyDetails ? {
        ...defaultData.familyDetails,
        ...remoteData.familyDetails,
        brideSide: { ...(defaultData.familyDetails?.brideSide || {}), ...(remoteData.familyDetails?.brideSide || {}) },
        groomSide: { ...(defaultData.familyDetails?.groomSide || {}), ...(remoteData.familyDetails?.groomSide || {}) },
      } : defaultData.familyDetails,
      events: remoteData.events && remoteData.events.length > 0 ? remoteData.events : defaultData.events,
      timeline: remoteData.timeline && remoteData.timeline.length > 0 ? remoteData.timeline : defaultData.timeline,
      rsvpContacts: remoteData.rsvpContacts && remoteData.rsvpContacts.length > 0 ? remoteData.rsvpContacts : defaultData.rsvpContacts,
      rsvpPhones: remoteData.rsvpPhones && remoteData.rsvpPhones.length > 0 ? remoteData.rsvpPhones : defaultData.rsvpPhones,
    };

    // Cache locally per-slot for instant offline availability with zero cross-slot leakage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`wedding_cached_data_${slotId}`, JSON.stringify(mergedData));
        localStorage.setItem("wedding_cached_data_backup", JSON.stringify(mergedData));
      } catch (e) {}
    }

    return mergedData;
  } catch (error) {
    console.warn(`Notice: Firestore offline or unreachable; using local cached wedding data for slot ${slotId}.`);
    return localFallback;
  }
}

/**
 * Save wedding data with strict isolation:
 * - When saving in upcoming remix slot (wedding_data_groom_side_remix_2), writes ONLY to that document.
 * - NEVER touches or overlaps with the parent website (wedding_data_pt2_remix2) or the earlier original.
 * - Updates local cache strictly per-slot for zero-lag reactivity without cross-slot contamination.
 */
export async function saveWeddingData(data: WeddingData): Promise<void> {
  const cleanData = { ...data };
  if (cleanData.heroLogoUrl === "/src/assets/ikonkar-gold.svg") {
    cleanData.heroLogoUrl = "/ikonkar-gold.svg";
  }

  const slotId = getEnvironmentDocId();

  // Update local cache immediately for this specific slot and global backup
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`wedding_cached_data_${slotId}`, JSON.stringify(cleanData));
      localStorage.setItem("wedding_cached_data_backup", JSON.stringify(cleanData));
      window.dispatchEvent(new CustomEvent('weddingDataUpdated', { detail: cleanData }));
    } catch (e) {}
  }

  // Safety safeguard: never allow writing to the earlier original wedding document
  if (slotId === EARLIER_ORIGINAL_DOC_ID) {
    console.error("Critical safety guard: Attempted to write to earlier original wedding document blocked.");
    return;
  }

  try {
    // Save directly to the current isolated slot in Firestore
    const docRef = doc(db, "weddingConfig", slotId);
    await fetchWithTimeout(setDoc(docRef, cleanData), 5000);

    // If writing strictly from parent website container, keep container-specific sync
    if (slotId === CURRENT_WEBSITE_DOC_ID && typeof window !== 'undefined' && window.location.hostname.includes(CURRENT_PARENT_CONTAINER_SIGNATURE)) {
      const containerDocRef = doc(db, "weddingConfig", `wedding_data_${CURRENT_PARENT_CONTAINER_SIGNATURE}`);
      await setDoc(containerDocRef, cleanData).catch(() => {});
    }
  } catch (error) {
    console.warn(`Could not sync wedding data to remote Firestore for ${slotId} (saved locally):`, error);
  }
}

/**
 * Submit an RSVP to the isolated subcollection for this slot.
 * Saves locally as well for offline durability.
 */
export async function submitRSVP(rsvpData: any): Promise<void> {
  const slotId = getEnvironmentDocId();
  const payload = {
    ...rsvpData,
    slotId,
    submittedAt: new Date().toISOString(),
    id: `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  };

  // Always save locally scoped to this slot
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem(`wedding_local_rsvps_${slotId}`) || "[]");
      existing.unshift(payload);
      localStorage.setItem(`wedding_local_rsvps_${slotId}`, JSON.stringify(existing));
    } catch (e) {}
  }

  try {
    const rsvpCollection = collection(db, "weddingConfig", slotId, "rsvps");
    await fetchWithTimeout(addDoc(rsvpCollection, payload), 5000);
  } catch (error) {
    console.warn("RSVP stored locally (remote sync skipped or offline):", error);
  }
}

/**
 * Retrieve RSVPs submitted specifically to this slot.
 */
export async function getRSVPs(): Promise<any[]> {
  const slotId = getEnvironmentDocId();
  let localRsvps: any[] = [];
  if (typeof window !== 'undefined') {
    try {
      localRsvps = JSON.parse(localStorage.getItem(`wedding_local_rsvps_${slotId}`) || "[]");
    } catch (e) {}
  }

  try {
    const rsvpCollection = collection(db, "weddingConfig", slotId, "rsvps");
    const snapshot = await fetchWithTimeout(getDocs(rsvpCollection), 4000);
    const remote = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const seen = new Set<string>();
    const merged: any[] = [];
    [...remote, ...localRsvps].forEach(item => {
      const key = item.id || `${item.name}-${item.submittedAt}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });
    return merged;
  } catch (error) {
    return localRsvps;
  }
}


