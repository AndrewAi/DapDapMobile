export interface Event {
  id: string;
  title: string;
  date: string;
  price: number | 'free';
  location: string;
  imageUrl: string | number;
  description: string;
  websiteUrl?: string;
  isFeatured?: boolean;
  organizer: {
    name: string;
    imageUrl: string | number;
  };
}

export type EventListItem = Pick<Event, 'id' | 'title' | 'date' | 'price' | 'imageUrl' | 'location' | 'description' | 'organizer'>; 