import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function RealLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>();
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>();

  // get location permission
  const getPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return false;
    }
    return true;
  };
  // get current location
  const getLocation = async () => {
    const permission = await getPermission();
    if (!permission) return;

    let currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    if(currentLocation) {
      setLocation(currentLocation);
      console.log("location:", currentLocation);
      const { latitude, longitude } = currentLocation.coords;
      // The Geocoding API has been removed in SDK 49, use Place Autocomplete service instead
      //const response = await Location.reverseGeocodeAsync({latitude, longitude});
      //console.log("user's location:", response);
    }
  };
  // get address from location
  const getAddress = async () => {
    //await getLocation();
    if(!location) return;
    const currentAddress = await Location.reverseGeocodeAsync(location!.coords);
    setAddress(currentAddress[0]);
    console.log("address", address);
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View>
      {address && (<Text>{address.city}</Text>) }
      {location && (<Text>Lat: {location.coords.latitude}, Lon: {location.coords.longitude}</Text>) }
    </View>
  );
}
