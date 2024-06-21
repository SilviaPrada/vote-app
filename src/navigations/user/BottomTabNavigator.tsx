import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeTabScreen from '../../screens/user/HomeTabScreen';
import VoteTabScreen from '../../screens/user/VoteTabScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: string;

                    if (route.name === 'HomeTab') {
                        iconName = 'home';
                    } else if (route.name === 'VoteTab') {
                        iconName = 'thumbs-up';
                    } else {
                        iconName = 'question'; // Default icon if route name doesn't match
                    }

                    return <Icon name={iconName} color={color} size={size} />;
                },
                tabBarActiveTintColor: '#EC8638',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeTabScreen}
                options={{ headerShown: false, tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="VoteTab"
                component={VoteTabScreen}
                options={{ headerShown: false, tabBarLabel: 'Vote' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
