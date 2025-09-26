import * as Location from "expo-location";
// import { atom, signal } from "helux";
import { useComputed, useSignal, useSignalEffect } from "@preact/signals-react";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function RealLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>();
  const [address, setAddress] =
    useState<Location.LocationGeocodedAddress | null>();
  // const [num, setNum] = atom(() => ({ a: 1, b: { b1: 2 } }));
  const count = useSignal(0);
  const computedCount = useComputed(() => count.value * 2);

  useSignalEffect(() => {
    console.log("count changed:", count.value);
  })

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

    if (currentLocation) {
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
    if (!location) return;
    const currentAddress = await Location.reverseGeocodeAsync(location!.coords);
    setAddress(currentAddress[0]);
    console.log("address", address);
  };

  // useEffect(() => {
  //   getLocation();
  // }, []);

  return (
    <View>
      {/* use signals */}
      <Text>Count: {count}</Text>
      <Text>Computed Count (Count * 2): {computedCount}</Text>
      {address && <Text>{address.city}</Text>}
      {location && (
        <Text>
          Lat: {location.coords.latitude}, Lon: {location.coords.longitude}
        </Text>
      )}
      {/* <Text>{ signal(num.val.b.b1) }</Text> */}
      {/* <Button
        style={{ backgroundColor: "white" }}
        onPress={() => {
          console.log("button pressed");
          setNum((item) => {
            item.b.b1 += 10;
          });
        }}
      >
        test1
      </Button> */}
      <Button style={{backgroundColor: 'white'}}  
        onPress={() => count.value++ }>AddCount</Button>
    </View>
  );
}
