import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../config/firebase';

// Log Firebase config for debugging
console.log('Firebase Storage Bucket:', app.options.storageBucket);
const storage = getStorage(app);

export async function uploadImage(uri: string, path: string): Promise<string> {
  try {
    console.log('Starting image upload for path:', path);
    console.log('Image URI:', uri);
    
    // Create blob from URI using XMLHttpRequest (recommended by Expo)
    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.error('XHR error:', e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    
    console.log('Blob created, size:', blob.size);
    
    // Create storage reference
    const storageRef = ref(storage, path);
    console.log('Storage reference created for path:', path);
    
    // Upload file
    console.log('Uploading blob...');
    await uploadBytes(storageRef, blob);
    console.log('Upload completed');
    
    // We're done with the blob, close and release it
    if ('close' in blob) {
      (blob as any).close();
    }
    
    // Get download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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