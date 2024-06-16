import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminScreen from '../../screens/admin/AdminScreen';
import VoterScreen from '../../screens/admin/VoterScreen';
import CandidateScreen from '../../screens/admin/CandidateScreen';
import VoteCountScreen from '../../screens/admin/VoteCountScreen';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon from react-native-vector-icons

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Admin"
                component={AdminScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Voter"
                component={VoterScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="users" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Candidate"
                component={CandidateScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="VoteCount"
                component={VoteCountScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="bar-chart" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
