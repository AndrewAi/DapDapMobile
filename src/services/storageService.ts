import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';

const storage = getStorage();

export async function uploadImage(uri: string, path: string): Promise<string> {
  try {
    // Convert uri to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Upload file
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function getImageUrl(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
} 