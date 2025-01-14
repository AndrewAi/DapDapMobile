import { Event } from '../types/event';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Crooked Trad',
    date: '2024-07-27T18:30:00',
    price: 'free',
    location: "Matt Molloy's Yard Bar",
    imageUrl: require('../../assets/images/crooked-trad-poster.jpg'),
    description: 'BACK BY POPULAR DEMAND, THE FABULOUS CROOKED TRAD FOR AN EXCITING EVENING OF HIGH ENERGY CELTIC ROCK',
    websiteUrl: 'https://www.facebook.com/crookedtrad',
    organizer: {
      name: "Crooked Trad",
      imageUrl: require('../../assets/images/crooked-trad-logo.jpg')
    }
  },
  {
    id: '2',
    title: 'Traditional Irish Music Session',
    date: '2024-01-06T20:00:00',
    price: 10,
    location: "McGing's Bar, High Street",
    imageUrl: 'https://picsum.photos/400/201',
    description: 'Join us for a night of traditional Irish music featuring local musicians. A perfect blend of jigs, reels, and Irish ballads.',
    websiteUrl: 'https://mcgingsbar.ie/events',
    organizer: {
      name: "McGing's Bar",
      imageUrl: 'https://picsum.photos/40/41'
    }
  },
  {
    id: '3',
    title: 'Westport Food Festival',
    date: '2024-02-15T11:00:00',
    price: 15,
    location: 'Westport Town Hall',
    imageUrl: 'https://picsum.photos/400/202',
    description: 'A celebration of local cuisine featuring the best restaurants and food producers in Westport. Cooking demonstrations, tastings, and live entertainment throughout the day.',
    websiteUrl: 'https://westportfoodfestival.com',
    organizer: {
      name: 'Westport Food Festival',
      imageUrl: 'https://picsum.photos/40/42'
    }
  },
  {
    id: '4',
    title: 'Comedy Night at The Clock',
    date: '2024-01-20T21:00:00',
    price: 'free',
    location: 'The Clock Tavern',
    imageUrl: 'https://picsum.photos/400/203',
    description: 'A night of laughs with local and national comedians. First Thursday of every month. Free entry but booking recommended as space is limited.',
    websiteUrl: 'https://theclocktavern.ie/events/comedy-night',
    organizer: {
      name: 'The Clock Tavern',
      imageUrl: 'https://picsum.photos/40/43'
    }
  }
]; 