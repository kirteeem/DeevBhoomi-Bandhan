import { api } from "./axios";
import type { WizardFormData } from "../types/wizard";

/** Interface definitions matching the backend data envelope contracts */
export interface ProfileApiResponse {
  success: boolean;
  data: {
    profile: any; // Mapped accurately dynamically using profileToWizardData
  };
}

// Updated interface to precisely match what your backend controller responds with
export interface PhotoItemResponse {
  id: string;
  url: string;
  isProfilePhoto: boolean;
}

/**
 * Fetches the active authenticated user profile payload.
 * Used during wizard mount sequence initialization.
 */
export const fetchMyProfile = async (): Promise<any> => {
  const { data } = await api.get<ProfileApiResponse>("/profiles/me");
  return data.data.profile;
};

/**
 * Persists the core progressive wizard payload (Draft or Complete submission).
 * Dispatched dynamically by the footer action controller ribbon.
 */
export const updateMyProfile = async (profileData: Partial<WizardFormData>): Promise<any> => {
  const { data } = await api.patch<ProfileApiResponse>("/profiles/me", profileData);
  return data.data;
};

/**
 * Transmits binary file blobs to the asset processing destination engine.
 * Calibrated specifically to handle premium drag & drop configurations.
 */
export const uploadProfilePhoto = async (
  file: File,
  isProfilePhoto: boolean
): Promise<PhotoItemResponse> => {
  const formData = new FormData();

  // Changed key name from "photo" to "image" to perfectly match your backend Multer setup
  formData.append("image", file);
  formData.append("isProfilePhoto", String(isProfilePhoto));

  // Destructure and return "data" directly since the backend does not wrap it in another object
  const { data } = await api.post<PhotoItemResponse>(
    "/profiles/upload-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * Spends one of the member's 5 free profile unlocks (or confirms a premium
 * unlock) to permanently reveal a profile's full details.
 */
export const unlockProfile = async (
  userId: string
): Promise<{
  detailsUnlocked: boolean;
  freeUnlocksRemaining: number;
  planUnlocksRemaining: number;
}> => {
  const { data } = await api.post(`/profiles/${userId}/unlock`);
  return data.data;
};

export interface ContactDetails {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  city?: string;
}

/**
 * Checks whether the current viewer has already unlocked this member's
 * contact info (address/phone/email) — via Premium reveal, mutual accepted
 * interest, or their own profile. Never triggers a spend.
 */
export const fetchContactDetails = async (
  userId: string
): Promise<{
  contactUnlocked: boolean;
  contact?: ContactDetails;
  freeUnlocksRemaining: number;
  planUnlocksRemaining: number;
}> => {
  const { data } = await api.get(`/profiles/${userId}/contact`);
  return data.data;
};

/**
 * Spends one of the member's 10 Premium contact reveals to permanently
 * unlock a profile's address, phone, and email.
 */
export const unlockContactDetails = async (
  userId: string
): Promise<{
  contactUnlocked: boolean;
  freeUnlocksRemaining: number;
  planUnlocksRemaining: number;
}> => {
  const { data } = await api.post(`/profiles/${userId}/contact/unlock`);
  return data.data;
};