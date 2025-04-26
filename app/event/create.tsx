import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Pressable, 
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { addEvent, addEventImage } from '../../src/services/eventService';
import { uploadImage, pickImage, ensureBucketExists } from '../../src/services/storageService';
import { useAuth } from '../../src/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEventScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Create the storage bucket if it doesn't exist
    const initStorage = async () => {
      try {
        const bucketExists = await ensureBucketExists();
        if (bucketExists) {
          console.log('Storage bucket is ready for image uploads');
        } else {
          console.warn('Failed to create storage bucket - image uploads may fail');
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };

    initStorage();
  }, []);

  // Handle date change
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Image picker
  const handlePickImage = async () => {
    try {
      const uri = await pickImage({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (uri) {
        setImage(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  // Image picker for gallery
  const handlePickGalleryImage = async () => {
    try {
      const uri = await pickImage({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (uri) {
        setGalleryImages([...galleryImages, uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const updatedImages = [...galleryImages];
    updatedImages.splice(index, 1);
    setGalleryImages(updatedImages);
  };

  // Render gallery image item
  const renderGalleryItem = ({ item, index }: { item: string, index: number }) => (
    <View style={styles.galleryItem}>
      <Image source={{ uri: item }} style={styles.galleryItemImage} />
      <Pressable
        style={styles.removeImageButton}
        onPress={() => removeGalleryImage(index)}
      >
        <Text style={styles.removeImageButtonText}>✕</Text>
      </Pressable>
    </View>
  );

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!image) newErrors.image = 'Event image is required';
    if (!user) newErrors.auth = 'You must be logged in to create an event';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Generate a slug from the title
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      
      // Upload image to Supabase Storage
      let imageUrl = '';
      if (image) {
        try {
          console.log('Uploading image to Supabase Storage...');
          imageUrl = await uploadImage(image, `events/${slug}/poster.jpg`);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert('Warning', 'Failed to upload image, but we can still create the event without an image.');
        }
      }
      
      // Create event object
      const newEvent = {
        title,
        slug,
        description: {
          short: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
          full: description
        },
        date,
        location: {
          name: location,
          address: '',
        },
        price: price ? parseFloat(price) : 0,
        images: {
          poster: imageUrl,
          gallery: []
        },
        organizer: {
          name: user?.user_metadata?.full_name || 'Anonymous',
          imageUrl: user?.user_metadata?.avatar_url || '',
        },
        user_id: user?.id,
        websiteUrl: '',
      };
      
      // Save event to database
      const eventId = await addEvent(newEvent);
      
      // Upload gallery images if any
      if (galleryImages.length > 0 && eventId) {
        for (let i = 0; i < galleryImages.length; i++) {
          try {
            const galleryImageUrl = await uploadImage(
              galleryImages[i], 
              `events/${slug}/gallery-${i}.jpg`
            );
            await addEventImage(eventId, galleryImageUrl);
          } catch (error) {
            console.error('Error uploading gallery image:', error);
          }
        }
      }
      
      // Navigate back to event list
      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>Sign In Required</Text>
          <Text style={styles.messageText}>You need to sign in to create an event.</Text>
          <Pressable 
            style={styles.submitButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.submitButtonText}>Return to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Create New Event</Text>
        
        {/* Title */}
        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter event title"
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        
        {/* Date */}
        <Text style={styles.label}>Event Date & Time</Text>
        <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
          <Text>{format(date, 'PPP p')}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={onChangeDate}
          />
        )}
        
        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={[styles.input, errors.location ? styles.inputError : null]}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter venue name"
        />
        {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
        
        {/* Price */}
        <Text style={styles.label}>Ticket Price (€)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter ticket price"
          keyboardType="numeric"
        />
        
        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.textArea, errors.description ? styles.inputError : null]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your event"
          multiline
          numberOfLines={4}
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        
        {/* Image Picker */}
        <Text style={styles.label}>Event Poster</Text>
        <Pressable 
          style={styles.imagePicker} 
          onPress={handlePickImage}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <Text style={styles.imagePickerText}>+ Select Image</Text>
          )}
        </Pressable>
        {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}
        
        {/* Gallery Images */}
        <Text style={styles.label}>Gallery Images</Text>
        <View style={styles.galleryContainer}>
          {galleryImages.length > 0 && (
            <FlatList
              data={galleryImages}
              renderItem={renderGalleryItem}
              keyExtractor={(_, index) => `gallery-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryList}
            />
          )}
          <Pressable 
            style={styles.addGalleryButton} 
            onPress={handlePickGalleryImage}
          >
            <Text style={styles.imagePickerText}>+ Add Gallery Image</Text>
          </Pressable>
        </View>
        
        {/* Submit Button */}
        <Pressable 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Event</Text>
          )}
        </Pressable>
        
        {/* Cancel Button */}
        <Pressable 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#007AFF',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 24,
  },
  galleryContainer: {
    marginBottom: 16,
  },
  galleryList: {
    paddingVertical: 8,
    gap: 8,
  },
  galleryItem: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    position: 'relative',
  },
  galleryItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addGalleryButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
}); 