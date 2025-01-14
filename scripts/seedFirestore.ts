import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fetch from 'node-fetch';

// Initialize Firebase Admin with your service account
const serviceAccount = require('../config/serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'dapdap-4c69f.firebasestorage.app'
});

const db = getFirestore();
const bucket = getStorage().bucket();

async function uploadImageFromUrl(imageUrl: string, path: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const file = bucket.file(path);
    await file.save(Buffer.from(buffer));
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${path}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

const events = [
  {
    title: "Crooked Trad",
    slug: "crooked-trad-july-2024",
    status: "published",
    date: admin.firestore.Timestamp.fromDate(new Date("2024-07-27T18:30:00")),
    price: {
      type: "free",
      amount: null,
      currency: "EUR"
    },
    location: {
      name: "Matt Molloy's Yard Bar",
      address: "Bridge Street, Westport, Co. Mayo",
      coordinates: {
        latitude: 53.7988,
        longitude: -9.5227
      }
    },
    images: {
      poster: "https://picsum.photos/800/600?random=1",
      gallery: []
    },
    description: {
      short: "High energy Celtic rock at Matt Molloy's",
      full: "BACK BY POPULAR DEMAND, THE FABULOUS CROOKED TRAD FOR AN EXCITING EVENING OF HIGH ENERGY CELTIC ROCK"
    },
    organizer: {
      id: "crookedtrad",
      name: "Crooked Trad",
      imageUrl: "https://picsum.photos/200/200?random=2"
    },
    category: ["music", "live", "traditional"],
    tags: ["trad", "irish music", "live music", "westport"],
    websiteUrl: "https://www.facebook.com/crookedtrad",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Traditional Irish Music Session",
    slug: "trad-session-august-2024",
    status: "published",
    date: admin.firestore.Timestamp.fromDate(new Date("2024-08-02T20:00:00")),
    price: {
      type: "free",
      amount: null,
      currency: "EUR"
    },
    location: {
      name: "The Porter House",
      address: "The Octagon, Westport, Co. Mayo",
      coordinates: {
        latitude: 53.7982,
        longitude: -9.5225
      }
    },
    images: {
      poster: "https://example.com/session-poster.jpg",
      gallery: []
    },
    description: {
      short: "Weekly traditional Irish music session",
      full: "Join us for our weekly traditional Irish music session featuring local musicians. All welcome to join in or just enjoy the music!"
    },
    organizer: {
      id: "porterhouse",
      name: "The Porter House",
      imageUrl: "https://example.com/porterhouse-logo.jpg"
    },
    category: ["music", "session", "traditional"],
    tags: ["trad", "irish music", "session", "westport"],
    websiteUrl: "https://www.facebook.com/theporterhousewestport",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Westport Folk & Bluegrass Festival",
    slug: "folk-bluegrass-fest-2024",
    status: "published",
    date: admin.firestore.Timestamp.fromDate(new Date("2024-09-15T12:00:00")),
    price: {
      type: "paid",
      amount: 25,
      currency: "EUR"
    },
    location: {
      name: "Westport Town Hall Theatre",
      address: "The Octagon, Westport, Co. Mayo",
      coordinates: {
        latitude: 53.7984,
        longitude: -9.5220
      }
    },
    images: {
      poster: "https://example.com/bluegrass-poster.jpg",
      gallery: []
    },
    description: {
      short: "Annual Folk and Bluegrass Festival",
      full: "The Westport Folk and Bluegrass Festival returns for its 15th year! Featuring local and international artists, workshops, and sessions throughout the town."
    },
    organizer: {
      id: "westportfest",
      name: "Westport Festivals",
      imageUrl: "https://example.com/westport-festivals-logo.jpg"
    },
    category: ["music", "festival", "folk"],
    tags: ["folk", "bluegrass", "festival", "westport"],
    websiteUrl: "https://www.westportfolkfest.com",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

const organizers = [
  {
    id: "crookedtrad",
    name: "Crooked Trad",
    imageUrl: "https://picsum.photos/200/200?random=2",
    description: "High energy Celtic rock band based in Westport",
    website: "https://www.facebook.com/crookedtrad",
    social: {
      facebook: "https://www.facebook.com/crookedtrad",
      instagram: "https://www.instagram.com/crookedtrad"
    },
    contactInfo: {
      email: "bookings@crookedtrad.com"
    }
  },
  {
    id: "porterhouse",
    name: "The Porter House",
    imageUrl: "https://example.com/porterhouse-logo.jpg",
    description: "Traditional Irish pub in the heart of Westport",
    website: "https://www.facebook.com/theporterhousewestport",
    social: {
      facebook: "https://www.facebook.com/theporterhousewestport"
    },
    contactInfo: {
      email: "info@theporterhouse.ie",
      phone: "+353 98 26725"
    }
  },
  {
    id: "westportfest",
    name: "Westport Festivals",
    imageUrl: "https://example.com/westport-festivals-logo.jpg",
    description: "Organizing Westport's premier music and cultural events",
    website: "https://www.westportfolkfest.com",
    social: {
      facebook: "https://www.facebook.com/westportfolkfest",
      instagram: "https://www.instagram.com/westportfolkfest",
      twitter: "https://twitter.com/westportfolkfest"
    },
    contactInfo: {
      email: "info@westportfolkfest.com",
      phone: "+353 98 25678"
    }
  }
];

async function cleanupAllDocuments() {
  try {
    // Delete all events
    const events = await db.collection('events').get();
    const eventDeletions = events.docs.map(doc => doc.ref.delete());
    await Promise.all(eventDeletions);
    console.log(`Deleted ${events.docs.length} events`);

    // Delete all organizers
    const organizers = await db.collection('organizers').get();
    const organizerDeletions = organizers.docs.map(doc => doc.ref.delete());
    await Promise.all(organizerDeletions);
    console.log(`Deleted ${organizers.docs.length} organizers`);

    // Delete all files in storage
    const [files] = await bucket.getFiles();
    const fileDeletions = files.map(file => file.delete());
    await Promise.all(fileDeletions);
    console.log(`Deleted ${files.length} files from storage`);
  } catch (error) {
    console.error('Error cleaning up documents:', error);
  }
}

async function seedDatabase() {
  try {
    // Clean up all existing documents and files first
    await cleanupAllDocuments();

    // Upload images and update URLs in data
    for (const event of events) {
      // Upload poster image
      const posterPath = `events/${event.slug}/poster.jpg`;
      event.images.poster = await uploadImageFromUrl(event.images.poster, posterPath);

      // Upload organizer image
      const organizerPath = `organizers/${event.organizer.id}/profile.jpg`;
      event.organizer.imageUrl = await uploadImageFromUrl(event.organizer.imageUrl, organizerPath);

      // Add event to Firestore
      await db.collection('events').add(event);
      console.log(`Added event: ${event.title}`);
    }

    // Add organizers with uploaded images
    for (const organizer of organizers) {
      const organizerPath = `organizers/${organizer.id}/profile.jpg`;
      organizer.imageUrl = await uploadImageFromUrl(organizer.imageUrl, organizerPath);
      
      await db.collection('organizers').doc(organizer.id).set(organizer);
      console.log(`Added organizer: ${organizer.name}`);
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase(); 