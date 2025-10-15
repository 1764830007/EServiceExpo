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
import WebViewLogin from '../../components/login/WebViewLogin';
import { useLocalization } from '../../hooks/locales/LanguageContext';
import api from '../services/api';

interface Nation {
  NationName: string;
  ID: string;
  // Add other nation properties as needed
}

export default function Register() {
  const router = useRouter();
  const { t } = useLocalization();
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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mobileRegisterType, setMobileRegisterType] = useState<boolean>(true); // true for China (mobile), false for others (email)
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false); // Prevent double submission
  const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(true); // Button state management
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [registrationUrl, setRegistrationUrl] = useState<string>('');

  // Validation regex patterns (matching Xamarin ViewModel)
  const phoneRegex = /^1[3456789]\d{9}$/; // Chinese mobile phone pattern
  const emailRegex = /^\w+([-+.]\w+)*@\w+([-.\w]+)*\.\w+([-.\w]+)*$/;

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
          setMobileRegisterType(true); // China uses mobile registration
        }
      } catch (error) {
        console.error('Failed to fetch nations:', error);
        Alert.alert(t('common.Error'), t('errors.FailedToLoadCountryList'));
      } finally {
        setLoading(false);
      }
    };
    fetchNations();
  }, []);

  // Handle country selection change
  const handleCountryChange = (countryId: string) => {
    setFormData(prev => ({ ...prev, country: countryId }));
    
    // Update validation type based on country
    if (countryId === 'CN') {
      setMobileRegisterType(true); // China: mobile required, email optional
    } else {
      setMobileRegisterType(false); // Others: email required, mobile optional
    }
    
    // Clear previous errors when country changes
    setErrors({});
  };

  // Hide all error messages
  const hideErrorMessages = () => {
    setErrors({});
  };

  // Phone validation function
  const validatePhone = (phone: string): boolean => {
    return phoneRegex.test(phone);
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email);
  };

  // Email format validation function
  const validateEmailFormat = (email: string): boolean => {
    return emailRegex.test(email);
  };

  // Validate form and submit
  const validateAndSubmit = async () => {
    hideErrorMessages();
    const newErrors: Record<string, string> = {};
    
    // Check required fields first
    if (!formData.streetAddress || formData.streetAddress.trim() === '') {
      newErrors.streetAddress = t('registration.required');
    }
    if (!formData.surname || formData.surname.trim() === '') {
      newErrors.surname = t('registration.required');
    }
    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = t('registration.required');
    }
    if (!formData.givenName || formData.givenName.trim() === '') {
      newErrors.givenName = t('registration.required');
    }

    // Username length validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = t('registration.UsernameTips');
    }
    
    // Validate based on registration type
    if (mobileRegisterType) {
      // China: Mobile required and format validation
      if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
        newErrors.phoneNumber = t('registration.required');
      } else if (!validatePhone(formData.phoneNumber)) {
        Alert.alert(t('common.SubmitFailed'), t('registration.WrongPhoneFormat'));
        return;
      }
    } else {
      // Other countries: Email required and format validation
      if (!formData.email || formData.email.trim() === '') {
        newErrors.email = t('registration.required');
      } else if (!validateEmailFormat(formData.email)) {
        Alert.alert(t('common.SubmitFailed'), t('registration.WrongEmailFormat'));
        return;
      }
    }

    // If there are validation errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed with submission
    await submitRegistration();
  };

  const submitRegistration = async () => {
    // Prevent double submission and disable button
    if (isConfirmed) {
      return;
    }
    
    setIsConfirmed(true);
    setSubmitting(true);
    setIsButtonEnabled(false); // Disable button during submission
    
    try {
      // Format phone number with +86 prefix for China
      let formattedPhone = null;
      if (formData.phoneNumber && formData.phoneNumber.length > 1) {
        formattedPhone = mobileRegisterType ? `+86${formData.phoneNumber}` : formData.phoneNumber;
      }

      // Get selected nation from nationList
      const selectedNation = nationList.find(n => n.ID === formData.country);
      
      // Prepare registration data (matching Xamarin B2CRegisterRequest structure)
      const registrationData: any = {
        email: formData.email,
        signinname: formData.username,
        givenname: formData.givenName,
        surname: formData.surname,
        country: selectedNation?.ID || formData.country,
        streetAddress: formData.streetAddress,
        telephonenumber: formattedPhone,
        validatetype: mobileRegisterType ? 'telephonenumber' : 'email',
        isfrommobile: true, // Always true for React Native app
        isdarkmodel: false // Could be determined from theme context
      };

      // Only include postalcode if it's not empty
      if (formData.postalCode && formData.postalCode.trim() !== '') {
        registrationData.postalcode = formData.postalCode;
      }

      console.log('Registration data:', registrationData);
      
      // Call registration API (matching Xamarin API call structure)
      const response = await api.post('/services/app/EndCustomer/Register', registrationData);
      
      console.log('Registration response:', response.data);
      
      if (response.data && response.data.success === true) {
        // Success case - show WebView with the returned URL
        setIsConfirmed(false);
        const authUrl = response.data.result;
        
        console.log('Registration success, received URL:', authUrl);
        
        if (authUrl) {
          // Show WebView with the registration success URL
          setRegistrationUrl(authUrl);
          setShowWebView(true);
        } else {
          // Fallback if no URL is returned
          Alert.alert(
            t('common.Submittedsuccessfully'), 
            t('common.ValidationSuccessful'),
            [
              {
                text: t('common.Close'),
                onPress: () => router.push('/User/login')
              }
            ]
          );
        }
      } else {
        // Error case
        setIsConfirmed(false);
        const errorMessage = response.data?.error?.message || t('common.SubmitFailed');
        Alert.alert(t('common.Warning'), errorMessage);
      }
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setIsConfirmed(false);
      
      // Handle different types of errors
      let errorMessage = t('common.SubmitFailed');
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      Alert.alert(t('common.Warning'), errorMessage);
    } finally {
      setSubmitting(false);
      setIsButtonEnabled(true); // Re-enable button
    }
  };

  const handleSubmit = async () => {
    // Prevent double submission (matching Xamarin logic)
    if (!isConfirmed) {
      await validateAndSubmit();
    }
  };

  // WebView success handler
  const handleWebViewSuccess = () => {
    setShowWebView(false);
    setRegistrationUrl('');
    
    // Show success message and navigate to main app
    Alert.alert(
      t('common.Submittedsuccessfully'),
      t('common.ValidationSuccessful'),
      [
        {
          text: t('common.Close'),
          onPress: () => {
            // Navigate to the main app or login page
            router.push('/');
          }
        }
      ]
    );
  };

  // WebView error handler
  const handleWebViewError = (errorMessage: string) => {
    setShowWebView(false);
    setRegistrationUrl('');
    
    Alert.alert(
      t('common.Error'),
      errorMessage || t('common.SubmitFailed')
    );
  };

  // WebView close handler
  const handleWebViewClose = () => {
    setShowWebView(false);
    setRegistrationUrl('');
    
    // Navigate back to login page
    router.push('/User/login');
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
        case t('common.PhoneNumber'): return 'phoneNumber';
        case t('common.Email'): return 'email';
        case t('auth.Username'): return 'username';
        case t('auth.Givenname'): return 'givenName';
        case t('auth.Surname'): return 'surname';
        case t('registration.ContactAddress'): return 'streetAddress';
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
    <>
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{t('common.Country')}</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
          <View style={styles.pickerWrapper}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Picker
                selectedValue={formData.country}
                onValueChange={(value: string) => handleCountryChange(value)}
                style={styles.picker}
              >
                <Picker.Item label={t('common.ClickToSelect')} value="" />
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
              {formData.country === 'CN' 
                ? t('registration.CountryTips')
                : t('registration.CountryTips')
              }
            </Text>
          </View>
        )}

        {renderField(
          t('common.PhoneNumber'),
          formData.phoneNumber,
          (text) => setFormData(prev => ({ ...prev, phoneNumber: text })),
          mobileRegisterType ? t('common.ClickToEnterRequired') : t('common.ClickToEnterNotRequired'),
          mobileRegisterType, // Required for China
          'numeric'
        )}

        {renderField(
          t('common.Email'),
          formData.email,
          (text) => setFormData(prev => ({ ...prev, email: text })),
          !mobileRegisterType ? t('common.ClickToEnterRequired') : t('common.ClickToEnterNotRequired'),
          !mobileRegisterType, // Required for non-China countries
          'email-address'
        )}

        {renderField(
          t('auth.Username'),
          formData.username,
          (text) => setFormData(prev => ({ ...prev, username: text })),
          t('common.ClickToEnterRequired'),
          true
        )}

        {renderField(
          t('auth.Givenname'),
          formData.givenName,
          (text) => setFormData(prev => ({ ...prev, givenName: text })),
          t('common.ClickToEnterRequired'),
          true
        )}

        {renderField(
          t('auth.Surname'),
          formData.surname,
          (text) => setFormData(prev => ({ ...prev, surname: text })),
          t('common.ClickToEnterRequired'),
          true
        )}

        {renderField(
          t('registration.ContactAddress'),
          formData.streetAddress,
          (text) => setFormData(prev => ({ ...prev, streetAddress: text })),
          t('registration.RegisterStreetTips'),
          true
        )}

        {renderField(
          t('equipment.EquipmentPostalCode'),
          formData.postalCode,
          (text) => setFormData(prev => ({ ...prev, postalCode: text })),
          t('common.ClickToEnterNotRequired'),
          false
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          buttonColor="#007AFF"
          loading={submitting}
          disabled={submitting || !isButtonEnabled}
        >
          {submitting ? t('common.Loading') : t('common.Submit')}
        </Button>
      </View>
    </ScrollView>

    <WebViewLogin
      visible={showWebView}
      onClose={handleWebViewClose}
      onLoginSuccess={handleWebViewSuccess}
      onLoginError={handleWebViewError}
      initialUrl={registrationUrl}
    />
    </>
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