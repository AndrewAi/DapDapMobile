import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface Event {
  title: string;
  date: Date;
  location: {
    name: string;
    address: string;
  };
  description: {
    short: string;
    full: string;
  };
  organizer: {
    name: string;
    imageUrl: string;
  };
}

export async function getEvents(): Promise<Event[]> {
  try {
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: data.date.toDate(), // Convert Firestore Timestamp to Date
      } as Event;
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
} 