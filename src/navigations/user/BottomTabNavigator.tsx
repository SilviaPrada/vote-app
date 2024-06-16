import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeTabScreen from '../../screens/user/HomeTabScreen';
import VoteTabScreen from '../../screens/user/VoteTabScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="HomeTab" component={HomeTabScreen} options={{ headerShown: false, tabBarLabel: 'Home' }} />
            <Tab.Screen name="VoteTab" component={VoteTabScreen} options={{ headerShown: false, tabBarLabel: 'Vote' }} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
