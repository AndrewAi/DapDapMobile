import { supabase } from '../config/supabase';

export interface Event {
  id?: string;
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
  price?: number;
  websiteUrl?: string;
  website_url?: string;
  user_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all events from Supabase
 */
export async function getEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error.message);
      return [];
    }

    return data.map(event => ({
      ...event,
      date: new Date(event.date),
      createdAt: event.created_at ? new Date(event.created_at) : undefined,
      updatedAt: event.updated_at ? new Date(event.updated_at) : undefined,
    })) as Event[];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Get a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching event by slug:', error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      date: new Date(data.date),
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    } as Event;
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return null;
  }
}

/**
 * Add a new event
 */
export async function addEvent(eventData: Omit<Event, 'id'>): Promise<string> {
  try {
    // Prepare data for Supabase (snake_case)
    const supabaseEvent = {
      title: eventData.title,
      slug: eventData.slug,
      date: eventData.date.toISOString(),
      location: eventData.location,
      description: eventData.description,
      images: eventData.images,
      organizer: eventData.organizer,
      price: eventData.price || 0,
      website_url: eventData.websiteUrl,
      user_id: eventData.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('events')
      .insert(supabaseEvent)
      .select('id')
      .single();

    if (error) {
      console.error('Error adding event:', error.message);
      throw new Error(error.message);
    }

    return data.id;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, eventData: Partial<Event>): Promise<void> {
  try {
    // Prepare data for Supabase
    const supabaseEvent: any = {
      ...eventData,
      updated_at: new Date().toISOString()
    };

    // Convert date if present
    if (eventData.date) {
      supabaseEvent.date = eventData.date.toISOString();
    }

    // Handle camelCase to snake_case conversion for websiteUrl
    if (eventData.websiteUrl !== undefined) {
      supabaseEvent.website_url = eventData.websiteUrl;
      delete supabaseEvent.websiteUrl;
    }

    const { error } = await supabase
      .from('events')
      .update(supabaseEvent)
      .eq('id', id);

    if (error) {
      console.error('Error updating event:', error.message);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error.message);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

/**
 * Add an image to the event gallery
 */
export async function addEventImage(eventId: string, imageUrl: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('event_images')
      .insert({
        event_id: eventId,
        image_url: imageUrl,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding event image:', error.message);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error adding event image:', error);
    return null;
  }
}

/**
 * Get all images for an event
 */
export async function getEventImages(eventId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('event_images')
      .select('image_url')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event images:', error.message);
      return [];
    }

    return data.map(item => item.image_url);
  } catch (error) {
    console.error('Error fetching event images:', error);
    return [];
  }
} 