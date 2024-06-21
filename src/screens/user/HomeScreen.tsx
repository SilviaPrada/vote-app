import React, { useEffect } from 'react';
import { Image, View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/user/StackNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon from react-native-vector-icons
import BottomTabNavigator from '../../navigations/user/BottomTabNavigator';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    route: HomeScreenRouteProp;
    navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ route, navigation }) => {
    const user = route.params?.user;

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token || !user) {
                navigation.navigate('Login');
            }
        };

        checkToken();
    }, [user]);

    const handleProfile = () => {
        navigation.navigate('Profile', { userId: user.userId }); // Pass userId to ProfileScreen
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Error: User data not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Image source={require('../../../assets/logo-text-line-white.png')} style={styles.logo} />
                <TouchableOpacity onPress={handleProfile} style={styles.profileIcon}>
                    <Icon name="user" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            <BottomTabNavigator />
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
    }, logo: {
        width: 250, 
        height: 43, 
        resizeMode: 'contain'
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 10,
        padding: 16,
        backgroundColor: '#EC8638',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileIcon: {
        padding: 8,
    },
});

export default HomeScreen;
