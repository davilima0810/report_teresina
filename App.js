import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect}from 'react';
import { StyleSheet, Text, View , TouchableOpacity , TextInput, Alert} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';

import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import Axios from 'axios';

export default function App() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({
    latitude: -5.0687006,
    longitude:-42.8133281,
    latitudeDelta: 0.014,
    longitudeDelta: 0.014
  });
  

  useEffect(() => {
    async function getLocationUser() {

      //Permissões de camera
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert("Premissão para acessar a câmera foi negada!");
      }    

      if (Platform.OS !== 'web' && !Constants.isDevice) {
        Alert("Oops, isso não funcionará no Snack em um emulador de Android. Experimente em seu dispositivo!");
        return;
      }
      //Permissões de Localização
      const local = await Location.requestForegroundPermissionsAsync();
      if (local.status !== 'granted') {
        Alert("A permissão para acessar a localização foi negada!");
      } 

      let locationUser = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: locationUser.coords.latitude,
        longitude: locationUser.coords.longitude,
        latitudeDelta: 0.014,
        longitudeDelta: 0.014
      });
    }

    getLocationUser()
  }, [])
  
  const PickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9,16],
      quality: 1
    });
    if(!result.cancelled){
      setImage(result.uri);
    }
  }

  async function uploadItems() {
    const data = new FormData();


    data.append('foto', { 
      type: 'image/jpeg',
      name: "denuncia.jpeg", 
      uri: image  
    });
    data.append('lat', location.latitude);
    data.append('lng', location.longitude);
    data.append('descricao', description.text)

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    }

    const resposta = await Axios.post("http://projetospref.com/services/denuncias/api", data ,{ headers });

    if (resposta.status === 201){
      alert("Sua denuncia foi enviada com sucesso!")
    }else{
      alert("Erro ao enviar denuncia")
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Localização</Text>
      <MapView style={{width: '100%', height: '40%'}} region={location} showsUserLocation></MapView>
      <Text style={styles.label}>Midia</Text>
      <TouchableOpacity style={styles.button} onPress={PickImage}>
        <Text style={styles.buttonText}>Tirar foto</Text>
      </TouchableOpacity>
      {/* {image && <Image source={{uri:image}} style={{ width: 100, height: 100 }}/>} */}

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={styles.input} multiline={true} numberOfLines={4} onChangeText={(text) => {
        setDescription({text})
      }} />

      <TouchableOpacity style={styles.send} onPress={uploadItems}>
        <Text style={styles.buttonText}>Enviar Denuncia</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: "5%",
    paddingRight: "5%"
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 3,
    backgroundColor: "#7159c1",
    justifyContent: "center",
    alignItems: "center",
  },
  send: {
    width: 200,
    height: 50,
    borderRadius: 3,
    backgroundColor: "#7159c1",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20
  },
  
  buttonText: {
    color: "#fff"
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 15,
    marginBottom: 10,
    marginTop: 15
  },
  input: {
    marginBottom: 20,
    marginTop: 5,
    width: "100%",
    height: 80,
    backgroundColor: "#e3e3e3"
  }
});
