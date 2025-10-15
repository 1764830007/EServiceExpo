import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import api from '../services/api';

interface Nation {
  NationName: string;
  ID: string;
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
  const [nationList, setNationList] = useState<Nation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNations = async () => {
      setLoading(true);
      try {
        const res = await api.get('/services/app/GeoService/Nations?type=0');
        // If your API returns { result: [...] }
        const nations = (res.data.result || []).map((item: { text: string; value: string }) => ({
          NationName: item.text,
          ID: item.value,
        }));
        setNationList(nations);
        // Set default country to 'CN' if present
        const cn = nations.find((n:Nation) => n.ID === 'CN');
        if (cn) {
          setFormData((prev) => ({ ...prev, country: 'CN' }));
        }
      } catch (error) {
        console.error('Failed to fetch nations:', error);
        Alert.alert('Error', 'Failed to load country list.');
      } finally {
        setLoading(false);
      }
    };
    fetchNations();
  }, []);

  const handleSubmit = async () => {
    // Validate form with conditional logic based on country
    const newErrors: Record<string, string> = {};
    const isChina = formData.country === 'CN';
    
    if (!formData.country) newErrors.country = 'required';
    
    // China: Phone required, Email optional
    // Other countries: Email required, Phone optional
    if (isChina) {
      if (!formData.phoneNumber) newErrors.phoneNumber = 'required';
      // Email is optional for China
    } else {
      if (!formData.email) newErrors.email = 'required';
      // Phone is optional for other countries
    }
    
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
    keyboardType: 'default' | 'email-address' | 'numeric' = 'default',
    fieldKey?: string // Add optional field key for error mapping
  ) => {
    // Map label to field key for error handling
    const errorKey = fieldKey || (() => {
      switch (label) {
        case 'Phone Number': return 'phoneNumber';
        case 'Email': return 'email';
        case 'Username': return 'username';
        case 'Given Name': return 'givenName';
        case 'Surname': return 'surname';
        case 'Street Address': return 'streetAddress';
        default: return label.toLowerCase();
      }
    })();

    return (
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
        {errors[errorKey] && (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.fieldContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Country</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <View style={styles.pickerWrapper}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Picker
                selectedValue={formData.country}
                onValueChange={(value: string) =>
                  setFormData(prev => ({ ...prev, country: value }))
                }
                style={styles.picker}
              >
                <Picker.Item label="Click to Select" value="" />
                {nationList.map((nation) => (
                  <Picker.Item
                    key={nation.ID}
                    label={nation.NationName}
                    value={nation.ID}
                  />
                ))}
              </Picker>
            )}
          </View>
        </View>

        {/* Country-specific validation info */}
        {formData.country && (
          <View style={styles.validationInfo}>
            <Text style={styles.validationText}>
              {formData.country === '44' 
                ? 'For China: Phone number is required, email is optional'
                : 'Phone number is optional, email is required'
              }
            </Text>
          </View>
        )}

        {renderField(
          'Phone Number',
          formData.phoneNumber,
          (text) => setFormData(prev => ({ ...prev, phoneNumber: text })),
          formData.country === 'CN' ? 'Click to Enter (Required)' : 'Click to Enter (Optional)',
          formData.country === 'CN', // Required for China
          'numeric'
        )}

        {renderField(
          'Email',
          formData.email,
          (text) => setFormData(prev => ({ ...prev, email: text })),
          formData.country === 'CN' ? 'Click to Enter (Optional)' : 'Click to Enter (Required)',
          formData.country !== 'CN', // Required for non-China countries
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
    height: 60,
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
  validationInfo: {
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  validationText: {
    color: '#006699',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
});