import { View, StyleSheet, Image, ScrollView, Linking, Platform, StatusBar } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function EventDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Parse the event data from params
  const event = JSON.parse(params.event as string);
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={typeof event.imageUrl === 'string' 
              ? { uri: event.imageUrl } 
              : event.imageUrl
            }
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventTime}>
            {new Date(event.date).toLocaleDateString('en-IE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}
          </Text>
          <Text style={styles.eventVenue}>{event.location}</Text>
          
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
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
          onPress={() => event.websiteUrl ? Linking.openURL(event.websiteUrl) : null}
          disabled={!event.websiteUrl}
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
    height: 600,
    position: 'relative',
    zIndex: 1,
    marginTop: -50,
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
  titleContainer: {
    backgroundColor: '#FFCC00',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 16,
  },
  bandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
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
  },
  websiteButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
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