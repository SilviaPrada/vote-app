import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import VoterScreen from '../../screens/admin/VoterScreen';
import CandidateScreen from '../../screens/admin/CandidateScreen';
import VoteCountScreen from '../../screens/admin/VoteCountScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import VoterStackNavigation from './VoterStackNavigation';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: string;

                    if (route.name === 'Voter') {
                        iconName = 'users';
                    } else if (route.name === 'Candidate') {
                        iconName = 'user';
                    } else if (route.name === 'Vote Count') {
                        iconName = 'bar-chart';
                    } else {
                        // Default value to avoid undefined
                        iconName = 'circle';
                    }

                    return <Icon name={iconName} color={color} size={size} />;
                },
                tabBarActiveTintColor: '#EC8638',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Voter" component={VoterStackNavigation} />
            <Tab.Screen name="Candidate" component={CandidateScreen} />
            <Tab.Screen name="Vote Count" component={VoteCountScreen} />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
