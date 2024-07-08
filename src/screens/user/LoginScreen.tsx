import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/user/StackNavigator';
import { API_URL } from '@env';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
    navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setId('');
            setPassword('');
        });

        return unsubscribe;
    }, [navigation]);

    const handleLogin = async () => {
        if (id === '12020' && password === 'admin120') {
            await AsyncStorage.setItem('userId', id);
            navigation.navigate('Admin');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ voterId: id, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (!data.error) {
                await AsyncStorage.setItem('token', data.loginResult.token);
                await AsyncStorage.setItem('userId', String(data.loginResult.userId));
                navigation.navigate('Home', { user: data.loginResult });
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error: any) {
            console.error('Login Error:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Login untuk mengakses </Text>
            <TextInput
                style={styles.input}
                placeholder="Voter ID"
                value={id}
                onChangeText={setId}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {/* <Button title="Login" onPress={handleLogin} /> */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 35,
        backgroundColor: '#fff',
    }, logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 25,
    },
    title: {
        color: "#EC8638",
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#EC8638',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#EC8638',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default LoginScreen;
