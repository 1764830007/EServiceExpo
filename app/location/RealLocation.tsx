import UserCtx from "@/hooks/UserStore";
import * as Location from "expo-location";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function RealLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>();
  const [address, setAddress] =
    useState<Location.LocationGeocodedAddress | null>();
  //const [user, setUser, userCtx] = atom<User|null>(null);
  const userCtx = UserCtx.useStore();
  const userLoading = UserCtx.useLoading();
  const {loading, err, ok} = userLoading.fetchUser;
  // const [num, setNum] = atom(() => ({ a: 1, b: { b1: 2 } }));
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
      <Text>User Id: {userCtx.user.id}, user name:{userCtx.user.name}, user email:{userCtx.user.email}</Text>
      {/* <Text>Computed Count (Count * 2): {computedCount}</Text> */}
      {address && <Text>{address.city}</Text>}
      {location && (
        <Text>
          Lat: {location.coords.latitude}, Lon: {location.coords.longitude}
        </Text>
      )}
      {/* <Text>{ signal(num.val.b.b1) }</Text> */}
      <Button
        style={{ backgroundColor: "white" }}
        onPress={() => {
          userCtx.fetchUser();
          console.log("button pressed");
        }}
      >
        Modify User
      </Button>
    </View>
  );
}
