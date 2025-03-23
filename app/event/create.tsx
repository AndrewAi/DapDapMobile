import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { addEvent } from '../../src/services/eventService';
import { uploadImage } from '../../src/services/storageService';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Handle date change
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!image) newErrors.image = 'Event image is required';
    
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
      
      // Upload image to Firebase Storage
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image, `events/${slug}/poster.jpg`);
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
          address: '', // Could add separate address field
        },
        price: price ? parseFloat(price) : 0,
        images: {
          poster: imageUrl,
          gallery: []
        },
        organizer: {
          name: 'You', // In a real app, this would be the current user
          imageUrl: null
        },
        createdAt: new Date()
      };
      
      // Save to Firestore
      await addEvent(newEvent);
      
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

  return (
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
        onPress={pickImage}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>+ Select Image</Text>
        )}
      </Pressable>
      {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}
      
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 40,
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
}); 