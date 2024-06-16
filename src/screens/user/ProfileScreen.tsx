import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/user/StackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;
type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

type Props = {
    route: ProfileScreenRouteProp;
    navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
    const [voterData, setVoterData] = useState<any>(null);
    const userId = route.params?.userId;

    useEffect(() => {
        const fetchVoterData = async () => {
            try {
                const response = await fetch(`http://192.168.0.107:3000/voters/${userId}`);
                const data = await response.json();
                setVoterData(data);
            } catch (error) {
                console.error('Error fetching voter data:', error);
            }
        };

        if (userId) {
            fetchVoterData();
        }
    }, [userId]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        navigation.navigate('Login');
    };

    if (!voterData) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text>ID: {parseInt(voterData.id.hex, 16)}</Text>
            <Text>Name: {voterData.name}</Text>
            <Text>Email: {voterData.email}</Text>
            <Text>Has Voted: {voterData.hasVoted ? 'Yes' : 'No'}</Text>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
});

export default ProfileScreen;
