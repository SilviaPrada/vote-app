import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';

type BigNumberType = {
    type: string;
    hex: string;
};

type Voter = {
    id: BigNumberType;
    name: string;
    email: string;
    password?: string;
    hasVoted: boolean;
    lastUpdated: BigNumberType;
};

type VoterHistory = [
    BigNumberType, // id
    string,       // name
    string,       // email
    boolean,      // hasVoted
    string,       // txHash
    BigNumberType // lastUpdated
];

const VoterScreen = () => {
    const [data, setData] = useState<Array<Voter | VoterHistory>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const fetchVoterHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<VoterHistory[]>('http://192.168.0.107:3000/all-voter-histories');
            console.log('Voter Histories:', response.data);
            setData(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
            } else {
                setError(String(error));
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchVoters = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<{ error: boolean; message: string; voters: Voter[] }>('http://192.168.0.107:3000/voters');
            console.log('Voters:', response.data);
            setData(response.data.voters);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
            } else {
                setError(String(error));
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (timestamp: string) => {
        if (!timestamp) return 'Invalid date';
        try {
            const unixTimestamp = BigNumber.from(timestamp).toNumber();
            const dateObj = new Date(unixTimestamp * 1000);
            return dateObj.toLocaleString(); // Adjust based on your localization preferences
        } catch (error) {
            return 'Invalid date';
        }
    };

    const updateVoter = async () => {
        if (!selectedVoter) return;
        try {
            setLoading(true);
            await axios.put(`http://192.168.0.107:3000/voters/${selectedVoter.id.hex}`, formData);
            Alert.alert('Success', 'Voter updated successfully');
            setShowUpdateForm(false);
            fetchVoters(); // Refresh the data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
            } else {
                setError(String(error));
            }
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Voter | VoterHistory }) => {
        if (Array.isArray(item)) {
            // Handling VoterHistory
            const [id, name, email, hasVoted, txHash, lastUpdated] = item;
            return (
                <View style={styles.item}>
                    <Text>ID: {id?.hex ?? 'N/A'}</Text>
                    <Text>Name: {name}</Text>
                    <Text>Has Voted: {hasVoted.toString()}</Text>
                    <Text>Email: {email}</Text>
                    <Text>Last Updated: {lastUpdated ? formatDateTime(lastUpdated.hex) : 'Invalid date'}</Text>
                </View>
            );
        } else {
            // Handling Voter
            return (
                <View style={styles.item}>
                    <Text>ID: {item.id?.hex ?? 'N/A'}</Text>
                    <Text>Name: {item.name}</Text>
                    <Text>Email: {item.email}</Text>
                    <Text>Has Voted: {item.hasVoted.toString()}</Text>
                    <Text>Last Updated: {item.lastUpdated ? formatDateTime(item.lastUpdated.hex) : 'Invalid date'}</Text>
                    <Button title="Update" onPress={() => {
                        setSelectedVoter(item);
                        setFormData({ name: item.name, email: item.email, password: '' });
                        setShowUpdateForm(true);
                    }} />
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vote Count Screen</Text>
            <Button title="Voter History" onPress={fetchVoterHistories} />
            <Button title="Valid Voter" onPress={fetchVoters} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}
            <FlatList
                data={data}
                keyExtractor={(item, index) => {
                    if (Array.isArray(item)) return item[0]?.hex ?? index.toString();
                    return item.id?.hex ?? index.toString();
                }}
                renderItem={renderItem}
            />
            {showUpdateForm && selectedVoter && (
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Update Voter</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                    />
                    <Button title="Submit" onPress={updateVoter} />
                    <Button title="Cancel" onPress={() => setShowUpdateForm(false)} />
                </View>
            )}
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
    error: {
        color: 'red',
        marginVertical: 8,
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    form: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 16,
        width: '100%',
    },
    formTitle: {
        fontSize: 20,
        marginBottom: 12,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        width: '100%',
    },
});

export default VoterScreen;
