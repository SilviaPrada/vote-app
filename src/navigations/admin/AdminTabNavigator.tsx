import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VoterScreen from '../../screens/admin/VoterScreen';
import CandidateScreen from '../../screens/admin/CandidateScreen';
import VoteCountScreen from '../../screens/admin/VoteCountScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Voter"
                component={VoterScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="users" color={color} size={size} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Candidate"
                component={CandidateScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user" color={color} size={size} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="Vote Count"
                component={VoteCountScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="bar-chart" color={color} size={size} />
                    ),
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
