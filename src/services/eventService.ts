import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Event {
  title: string;
  slug: string;
  date: Date;
  location: {
    name: string;
    address: string;
  };
  description: {
    short: string;
    full: string;
  };
  images: {
    poster: string;
    gallery: string[];
  };
  organizer: {
    name: string;
    imageUrl: string;
  };
  websiteUrl?: string;
}

export async function getEvents(): Promise<Event[]> {
  try {
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Fix image URLs if needed
      let posterUrl = null;
      if (data.images?.poster) {
        // Check if URL needs to be fixed
        const url = data.images.poster;
        if (url.includes('firebasestorage') && !url.includes('?alt=media')) {
          // Add the alt=media parameter if missing
          posterUrl = `${url}?alt=media`;
        } else {
          posterUrl = url;
        }
      }
      
      console.log('Event data:', {
        title: data.title,
        posterUrl,
        originalUrl: data.images?.poster
      });
      
      return {
        ...data,
        date: data.date.toDate(),
        images: {
          poster: posterUrl,
          gallery: data.images?.gallery || [],
        },
        organizer: {
          name: data.organizer?.name || 'Unknown Organizer',
          imageUrl: data.organizer?.imageUrl || null,
        },
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
      } as Event;
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn(`No event found with slug: ${slug}`);
      return null;
    }

    const data = snapshot.docs[0].data();
    
    // Fix image URLs if needed
    let posterUrl = null;
    if (data.images?.poster) {
      // Check if URL needs to be fixed
      const url = data.images.poster;
      if (url.includes('firebasestorage') && !url.includes('?alt=media')) {
        // Add the alt=media parameter if missing
        posterUrl = `${url}?alt=media`;
      } else {
        posterUrl = url;
      }
    }
    
    return {
      ...data,
      date: data.date.toDate(),
      images: {
        poster: posterUrl,
        gallery: data.images?.gallery || [],
      },
      organizer: {
        name: data.organizer?.name || 'Unknown Organizer',
        imageUrl: data.organizer?.imageUrl || null,
      },
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
    } as Event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function addEvent(eventData: any): Promise<string> {
  try {
    const eventRef = doc(collection(db, 'events'));
    await setDoc(eventRef, {
      id: eventRef.id,
      ...eventData
    });
    return eventRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
} 