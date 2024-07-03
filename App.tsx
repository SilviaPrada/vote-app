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
import VoterStackNavigation from './src/navigations/admin/VoterStackNavigation';
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
        <ActivityIndicator size="large" color="#EC8638" />
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

