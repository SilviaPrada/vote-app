import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/user/LoginScreen';
import HomeScreen from './src/screens/user/HomeScreen';
import { RootStackParamList } from './src/navigations/user/StackNavigator';
import ProfileScreen from './src/screens/user/ProfileScreen';
import { ElectionProvider } from './src/helper/ElectionContext';
import AdminTabNavigator from './src/navigations/admin/AdminTabNavigator';
import AdminScreen from './src/screens/admin/AdminScreen';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (token && userId) {
        setIsLoggedIn(true);
        if (userId === '12020') {
          setIsAdmin(true);
        }
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ElectionProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isLoggedIn ? (isAdmin ? 'Admin' : 'Home') : 'Login'}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ElectionProvider>
  );
};

export default App;

// import React, { useState } from 'react';
// import { Button, Image, View, Text, Alert, ScrollView } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
// import { useState } from 'react';

// const App: React.FC = () => {
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   const [base64Image, setBase64Image] = useState<string | null>(null);

//   const pickImage = async () => {
//     try {
//       // Request permissions for accessing media library
//       const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (permissionResult.status !== 'granted') {
//         Alert.alert("Permission to access media library is required!");
//         return;
//       }

//       // Launch image picker
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const imageResult = result.assets[0];
//         setImageUri(imageResult.uri);
//         await convertToBase64(imageResult.uri);
//       }
//     } catch (error) {
//       console.error("Error picking image:", error);
//       Alert.alert("An error occurred while picking the image. Please try again.");
//     }
//   };

//   const convertToBase64 = async (uri: string) => {
//     try {
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: FileSystem.EncodingType.Base64,
//       });
//       setBase64Image(base64);
//     } catch (error) {
//       console.error("Error converting image to base64:", error);
//       Alert.alert("An error occurred while converting the image. Please try again.");
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//       <Button title="Pick an image from camera roll" onPress={pickImage} />
//       {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
//       {base64Image && (
//         <View style={{ margin: 20 }}>
//           <Text>Base64 Image:</Text>
//           <Text style={{ flexWrap: 'wrap', width: '100%' }}>
//             {base64Image.substring(0, 100)}...
//           </Text>
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// export default App;
