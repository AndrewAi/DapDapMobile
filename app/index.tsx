// app/index.js
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { getEvents, Event } from '../src/services/eventService';
import { format } from 'date-fns';
import { router } from 'expo-router';

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      console.log('Loaded events:', JSON.stringify(data, null, 2));
      setEvents(data);
    } catch (err) {
      console.error('Error in loadEvents:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  function renderEvent({ item: event }: { item: Event }) {
    return (
      <View style={styles.eventCard}>
        {/* Commenting out organizer section for now
        <View style={styles.organizerSection}>
          {event.organizer.imageUrl ? (
            <Image 
              source={{ uri: event.organizer.imageUrl }}
              style={styles.organizerImage}
              onError={(error) => console.error('Organizer image error:', error.nativeEvent.error, 'URL:', event.organizer.imageUrl)}
            />
          ) : (
            <View style={[styles.organizerImage, styles.placeholderImage]} />
          )}
          <Text style={styles.organizerName}>{event.organizer.name}</Text>
        </View>
        */}
        {event.images.poster ? (
          <Image
            source={{ uri: event.images.poster }}
            style={styles.eventImage}
            resizeMode="cover"
            onLoadStart={() => console.log('Starting to load image:', event.images.poster)}
            onLoad={() => console.log('Successfully loaded image:', event.images.poster)}
            onError={(error) => {
              console.error('Event image error details:', {
                url: event.images.poster,
                error: error.nativeEvent.error,
                eventTitle: event.title
              });
            }}
          />
        ) : (
          <View style={[styles.eventImage, styles.placeholderImage]} />
        )}
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{format(event.date, 'PPP')}</Text>
        <Text style={styles.location}>{event.location.name}</Text>
        <Pressable 
          style={styles.viewButton}
          onPress={() => {
            router.push({
              pathname: '/event/[id]',
              params: {
                id: event.slug,
                event: JSON.stringify(event)
              }
            });
          }}
        >
          <Text style={styles.viewButtonText}>View Event</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DapDap Events</Text>
      
      {/* Add Create Event button */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push('/event/create')}
      >
        <Text style={styles.createButtonText}>Create New Event</Text>
      </Pressable>
      
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={event => event.title}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  organizerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});