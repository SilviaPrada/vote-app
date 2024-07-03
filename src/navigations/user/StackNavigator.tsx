import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../screens/user/LoginScreen';
import HomeScreen from '../../screens/user/HomeScreen';
import AdminScreen from '../../screens/admin/AdminScreen';
import ProfileScreen from '../../screens/user/ProfileScreen';
import AdminTabNavigator from '../admin/AdminTabNavigator';
import VoterStackNavigation from '../admin/VoterStackNavigation';

export type RootStackParamList = {
    Login: undefined;
    Home: { user: { userId: string; name: string; token: string } };
    //Admin: undefined;
    Profile: { userId: string };
    Admin: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigator;
