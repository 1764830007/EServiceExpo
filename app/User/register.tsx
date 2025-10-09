import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Button } from 'react-native-paper';

interface Nation {
  NationName: string;
  // Add other nation properties as needed
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    country: '',
    phoneNumber: '',
    email: '',
    username: '',
    givenName: '',
    surname: '',
    streetAddress: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nationList, setNationList] = useState<Nation[]>([
    { NationName: 'China' },
    { NationName: 'United States' },
    // Add more nations as needed
  ]);

  const handleSubmit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.country) newErrors.country = 'required';
    if (!formData.email) newErrors.email = 'required';
    if (!formData.username) newErrors.username = 'required';
    if (!formData.givenName) newErrors.givenName = 'required';
    if (!formData.surname) newErrors.surname = 'required';
    if (!formData.streetAddress) newErrors.streetAddress = 'required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Implement registration API call
      console.log('Form submitted:', formData);
      // On success, navigate back to login
      router.push('/User/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    required: boolean = false,
    keyboardType: 'default' | 'email-address' | 'numeric' = 'default'
  ) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredStar}>*</Text>}
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Text style={styles.editIconText}>✎</Text>
        </TouchableOpacity>
      </View>
      {errors[label.toLowerCase()] && (
        <Text style={styles.errorText}>{errors[label.toLowerCase()]}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Country</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.country}
              onValueChange={(value: string) => 
                setFormData(prev => ({ ...prev, country: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Click to Select" value="" />
              {nationList.map((nation, index) => (
                <Picker.Item
                  key={index}
                  label={nation.NationName}
                  value={nation.NationName}
                />
              ))}
            </Picker>
          </View>
        </View>

        {renderField(
          'Phone Number',
          formData.phoneNumber,
          (text) => setFormData(prev => ({ ...prev, phoneNumber: text })),
          'Click to Enter (Optional)',
          false,
          'numeric'
        )}

        {renderField(
          'Email',
          formData.email,
          (text) => setFormData(prev => ({ ...prev, email: text })),
          'Click to Enter (Required)',
          true,
          'email-address'
        )}

        {renderField(
          'Username',
          formData.username,
          (text) => setFormData(prev => ({ ...prev, username: text })),
          'Click to Enter (Required)',
          true
        )}

        {renderField(
          'Given Name',
          formData.givenName,
          (text) => setFormData(prev => ({ ...prev, givenName: text })),
          'Click to Enter (Required)',
          true
        )}

        {renderField(
          'Surname',
          formData.surname,
          (text) => setFormData(prev => ({ ...prev, surname: text })),
          'Click to Enter (Required)',
          true
        )}

        {renderField(
          'Street Address',
          formData.streetAddress,
          (text) => setFormData(prev => ({ ...prev, streetAddress: text })),
          'Enter your street address',
          true
        )}

        {renderField(
          'Postal Code',
          formData.postalCode,
          (text) => setFormData(prev => ({ ...prev, postalCode: text })),
          'Click to Enter (Optional)',
          false
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          buttonColor="#007AFF"
        >
          Submit
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  requiredStar: {
    color: '#ff0000',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  pickerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  editIcon: {
    padding: 8,
  },
  editIconText: {
    fontSize: 20,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});