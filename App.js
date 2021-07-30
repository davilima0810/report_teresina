import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Icon } from 'react-native-elements';

import * as ImagePicker from "expo-image-picker";

import * as Location from "expo-location";
// import MapView from "react-native-maps";
import Axios from "axios";

export default function App() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [location, setLocation] = useState({
    latitude: -5.0687006,
    longitude: -42.8133281,
    latitudeDelta: 0.014,
    longitudeDelta: 0.014,
  });

  const getLocationUser = useCallback(async () => {
    //Permissões de camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Premissão para acessar a câmera foi negada!");
    }

    if (Platform.OS === "web") {
      Alert.alert(
        "Oops, isso não funcionará no Snack em um emulador de Android. Experimente em seu dispositivo!"
      );
      return;
    }
    //Permissões de Localização
    const local = await Location.requestForegroundPermissionsAsync();
    if (local.status !== "granted") {
      Alert.alert("A permissão para acessar a localização foi negada!");
    }

    const locationUser = await Location.getCurrentPositionAsync({});

    setLocation({
      latitude: locationUser.coords.latitude,
      longitude: locationUser.coords.longitude,
      latitudeDelta: 0.014,
      longitudeDelta: 0.014,
    });
  }, []);

  useEffect(() => {
    getLocationUser();
  }, [getLocationUser]);

  const PickImage = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  }, []);

  const DeleteImage = useCallback(async () => {
    setImage(null);
    
  }, []);

  const uploadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = new FormData();

      data.append("foto", {
        type: "image/jpeg",
        name: "denuncia.jpeg",
        uri: image,
      });
      data.append("lat", location.latitude);
      data.append("lng", location.longitude);
      data.append("descricao", description);

      const headers = {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      };

      await Axios.post("http://", data, {
        headers,
      });

      setImage(null);
      setDescription("");

      Alert.alert("Sua denuncia foi enviada com sucesso!");
    } catch (error) {
      console.warn(error);
      Alert.alert("Erro ao enviar denuncia");
    } finally {
      setIsLoading(false);
    }
  }, [image, location, description]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Denuncias de Serviços Fiscais de Teresina</Text>
      <Text style={styles.label}>Midia</Text>
      <TouchableOpacity style={styles.button} onPress={PickImage}>
        <Text style={styles.buttonText}>
          {!!image ? "Foto salva"  : "Tirar foto"}
        </Text>
      </TouchableOpacity>
      {image && (
        <View style={{width: 200, height: 200 , marginTop: 20}}>
          <TouchableOpacity style={styles.circle} onPress={DeleteImage}>
            
              <Icon name='x-circle'
                type='feather'
                color='#999'
                style={{left: "0%"}}
                />
            
          </TouchableOpacity>
          <Image source={{ uri: image }} style={{  zIndex: 10, width: "100%", height: "100%" , alignSelf: "center" }} />
        </View>
      )}

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        multiline={true}
        value={description}
        numberOfLines={4}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        disabled={!image && !description}
        style={!image && !description ? styles.sendDisabled : styles.send}
        onPress={uploadItems}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size={20} />
        ) : (
          <Text style={styles.buttonText}>Enviar Denuncia</Text>
        )}
      </TouchableOpacity>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: "5%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 3,
    backgroundColor: "#7159c1",
    justifyContent: "center",
    alignItems: "center",
  },
  title:{
    textAlign: "center",
    width: "80%",
    fontSize: 20
  },
  send: {
    width: 200,
    height: 50,
    borderRadius: 3,
    backgroundColor: "#7159c1",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  sendDisabled: {
    width: 200,
    height: 50,
    borderRadius: 3,
    backgroundColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
  },
  circle:{
    width: "100%",
    alignItems: "flex-end",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 15,
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    marginBottom: 20,
    marginTop: 5,
    width: "100%",
    height: 80,
    backgroundColor: "#e3e3e3",
  },
});
