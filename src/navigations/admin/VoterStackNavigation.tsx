import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VoterScreen from '../../screens/admin/VoterScreen';
import ValidVoter from '../../screens/admin/ValidVoter';
import VoterHistory from '../../screens/admin/VoterHistory';

const Stack = createStackNavigator();

function VoterStackNavigation(): JSX.Element {
    return (
        <Stack.Navigator initialRouteName="VoterScreen">
            <Stack.Screen
                name="VoterScreen"
                component={VoterScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ValidVoter" 
                component={ValidVoter}
                options={{ headerShown: false }} />
            <Stack.Screen 
                name="VoterHistory" 
                component={VoterHistory}
                options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default VoterStackNavigation;
