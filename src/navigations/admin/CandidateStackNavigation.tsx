import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CandidateScreen from '../../screens/admin/CandidateScreen';
import ValidCandidate from '../../screens/admin/ValidCandidate';
import CandidateHistory from '../../screens/admin/CandidateHistory';

const Stack = createStackNavigator();

function CandidateStackNavigation(): JSX.Element {
    return (
        <Stack.Navigator initialRouteName="CandidateScreen">
            <Stack.Screen
                name="CandidateScreen"
                component={CandidateScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="ValidCanidate" 
                component={ValidCandidate}
                options={{ headerShown: false }} />
            <Stack.Screen 
                name="CandidateHistory" 
                component={CandidateHistory}
                options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default CandidateStackNavigation;
