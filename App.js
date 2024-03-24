import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { initializeApp } from "firebase/app";
import { getDatabase, push, ref, onValue, remove } from "firebase/database";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Input, Button, ListItem, Text } from "@rneui/themed";
import MapView, { Marker } from "react-native-maps";

const Stack = createNativeStackNavigator();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChH0pDdFW-bzvglxBYr6R0h-of_RVVJSg",
  authDomain: "osoitekirja-b2704.firebaseapp.com",
  projectId: "osoitekirja-b2704",
  storageBucket: "osoitekirja-b2704.appspot.com",
  messagingSenderId: "438694876262",
  appId: "1:438694876262:web:b1312c70693e6e52e989a7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export default function App() {

  function MapScreen(props) {

    const [placeCoordinates, setPlaceCoordinates] = useState({
      latitude: 60.1699,
      longitude: 24.9384,
      latitudeDelta: 0.0322,
      longitudeDelta: 0.0221,
    });

    useEffect(() => {
      const getCoordinates = async () => {
        try {
          const response = await fetch(
            `https://geocode.maps.co/search?q=${props.route.params.address}&api_key={API_KEY}`
          );
          const data = await response.json();

          const location = {
            latitude: data[0].lat,
            longitude: data[0].lon,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          };

          setPlaceCoordinates(location);

        } catch (error) {
          Alert.alert("Error", error.message);
        }
      }
      getCoordinates();
    }, []);

    return (
      <View>
        <MapView style={styles.kartta} region={placeCoordinates}>
          <Marker
            coordinate={placeCoordinates}
            title={props.route.params.address}
          />
        </MapView>
      </View>
    );
  }

  function HomeScreen( props ) {
    const [address, setAddress] = useState("");
    const [addressList, setAddressList] = useState([]);

    useEffect(() => {
      onValue(ref(database, "addresses/"), (snapshot) => {
        const addresses = [];
        snapshot.forEach((s) => {
          addresses.push(Object.assign({ id: s.key, ...s.val() }));
        });
        setAddressList(addresses);
      });
    }, []);

    const saveAddress = () => {
      push(ref(database, "addresses/"), { address });
    };

    const deleteAddress = (id) => {
      const addressRef = ref(database, `addresses/${id}`);
      remove(addressRef);
    };

    return (
      <View style={styles.container}>
        <Input
          placeholder="Type in address"
          label="PLACEFINDER"
          onChangeText={(text) => setAddress(text)}
          value={address}
        />
        <Button
          raised
          icon={{ name: "save" }}
          onPress={saveAddress}
          title="SAVE"
          buttonStyle={{ backgroundColor: "#FFC0CB" }}
        />
        <FlatList
          style={styles.list}
          data={addressList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <ListItem bottomDivider onLongPress={() => deleteAddress(item.id)}>
              <ListItem.Content>
                <ListItem.Title
                  onPress={() =>
                    props.navigation.navigate("Map", { address: item.address })
                  }
                >
                  {item.address}
                </ListItem.Title>
              </ListItem.Content>
              <Text style={{ color: "grey" }}>show on map</Text>
              <ListItem.Chevron />
            </ListItem>
          )}
        />
      </View>
    );
  }

  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    height: "100%",
    width: "100%",
  },
  kartta: {
    height: "100%",
    width: "100%",
  },
});

