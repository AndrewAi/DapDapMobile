import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Linking, Platform, StatusBar, FlatList } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Event, getEventImages } from '../../src/services/eventService';
import { format } from 'date-fns';

export default function EventDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Parse the event data from params
  const event = JSON.parse(params.event as string) as Event;
  
  useEffect(() => {
    // Debug log to check event data
    console.log('Event data:', event);
    console.log('Website URL:', event.website_url);
    
    // Load gallery images if the event has an ID
    if (event.id) {
      loadGalleryImages(event.id);
    }
  }, [event.id]);
  
  const loadGalleryImages = async (eventId: string) => {
    try {
      const images = await getEventImages(eventId);
      setGalleryImages(images);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  };
  
  const renderGalleryImage = ({ item }: { item: string }) => (
    <Image 
      source={{ uri: item }} 
      style={styles.galleryImage} 
      resizeMode="cover"
    />
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.images.poster }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventTime}>
            {format(new Date(event.date), 'EEEE, MMMM d, h:mm a')}
          </Text>
          <Text style={styles.eventVenue}>{event.location.name}</Text>
          
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{event.description.full}</Text>
          
          {galleryImages.length > 0 && (
            <View style={styles.gallerySection}>
              <Text style={styles.galleryTitle}>Gallery</Text>
              <FlatList
                data={galleryImages}
                renderItem={renderGalleryImage}
                keyExtractor={(item, index) => `gallery-image-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryList}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <IconButton
        icon="arrow-left"
        iconColor="white"
        size={24}
        style={styles.backButton}
        onPress={() => router.back()}
      />

      {/* Floating button container */}
      <View style={styles.floatingButtonContainer}>
        <Button
          mode="contained"
          style={styles.websiteButton}
          labelStyle={styles.websiteButtonText}
          onPress={() => event.website_url ? Linking.openURL(event.website_url) : null}
          disabled={!event.website_url}
        >
          Go to Event Website
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 16,
    left: 16,
    zIndex: 10,
    elevation: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  detailsSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 24,
    lineHeight: 24,
  },
  gallerySection: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  galleryList: {
    gap: 8,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  websiteButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
});