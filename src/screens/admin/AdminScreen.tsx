import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/user/StackNavigator';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AdminTabNavigator from '../../navigations/admin/AdminTabNavigator';
import { Menu, Provider, Button } from 'react-native-paper';

type AdminScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Admin'>;

type Props = {
    navigation: AdminScreenNavigationProp;
};

const AdminScreen: React.FC<Props> = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        navigation.navigate('Login');
        closeMenu();
    };

    useEffect(() => {
        const backAction = () => {
            Alert.alert("Hold on!", "Are you sure you want to exit the app?", [
                {
                    text: "Cancel",
                    onPress: () => null,
                    style: "cancel"
                },
                { text: "YES", onPress: () => BackHandler.exitApp() }
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                        <TouchableOpacity onPress={openMenu} style={{ marginRight: 16 }}>
                            <Icon name="ellipsis-v" size={24} color="#000" />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item onPress={handleLogout} title="Logout" />
                </Menu>
            ),
            headerLeft: () => null, // This removes the back button
        });
    }, [navigation, menuVisible]);

    return (
        <Provider>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Image source={require('../../../assets/logo-text-line-white.png')} style={styles.logo} />
                    <Menu
                        visible={menuVisible}
                        onDismiss={closeMenu}
                        anchor={
                            <TouchableOpacity onPress={openMenu} style={styles.profileIcon}>
                                <Icon name="ellipsis-v" size={24} color="#fff" />
                            </TouchableOpacity>
                        }
                    >
                        <Menu.Item onPress={handleLogout} title="Logout" />
                    </Menu>
                </View>
                <AdminTabNavigator />
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#EC8638',
    },
    logo: {
        width: 250,
        height: 43,
        resizeMode: 'contain'
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileIcon: {
        padding: 8,
    },
});

export default AdminScreen;
