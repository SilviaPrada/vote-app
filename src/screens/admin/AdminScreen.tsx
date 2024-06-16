import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/user/StackNavigator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type AdminScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminTab'> & BottomTabNavigationProp<any>;

type Props = {
    navigation: AdminScreenNavigationProp;
};

const AdminScreen: React.FC<Props> = ({ navigation }) => {
    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Admin</Text>
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

export default AdminScreen;
