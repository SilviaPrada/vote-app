import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
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

const ValidVoterScreen = () => {
    const [voterData, setVoterData] = useState<Voter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState<Array<Voter>>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchVoters();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [voterData]);

    const fetchVoters = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<{ error: boolean; message: string; voters: Voter[] }>('http://192.168.0.103:3000/voters');
            console.log('Voters:', response.data);
            setVoterData(response.data.voters);
            setFilteredData(response.data.voters); // Initialize filteredData with all voters
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
            await axios.put(`http://192.168.0.103:3000/voters/${selectedVoter.id.hex}`, formData);
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

    const addVoter = async () => {
        try {
            setLoading(true);
            const existingVoters = await axios.get<{ error: boolean; message: string; voters: Voter[] }>('http://192.168.0.103:3000/voters');
            const existingIds = existingVoters.data.voters.map(voter => voter.id.hex);

            if (existingIds.includes(formData.id)) {
                Alert.alert('Error', 'Voter ID already exists');
                setLoading(false);
                return;
            }

            await axios.post('http://192.168.0.103:3000/voters', formData);
            Alert.alert('Success', 'Voter added successfully');
            setShowAddForm(false);
            fetchVoters(); // Refresh the voter data
            setFormData({ id: '', name: '', password: '', email: '' }); // Reset form data
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

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredData(voterData);
        } else {
            const filtered = voterData.filter(item => {
                return (
                    item.name.toLowerCase().includes(text.toLowerCase()) ||
                    BigNumber.from(item.id.hex).toString().includes(text) ||
                    item.email.toLowerCase().includes(text.toLowerCase()) ||
                    item.hasVoted.toString().toLowerCase().includes(text.toLowerCase())
                );
            });
            setFilteredData(filtered);
        }
    };

    const deleteVoter = async (id: string) => {
        try {
            setLoading(true);
            await axios.delete(`http://192.168.0.103:3000/voters/${id}`);
            Alert.alert('Success', 'Voter deleted successfully');
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

    const renderItem = ({ item }: { item: Voter }) => {
        return (
            <View style={styles.item}>
                <Text>ID: {BigNumber.from(item.id.hex).toString()}</Text>
                <Text>Name: {item.name}</Text>
                <Text>Email: {item.email}</Text>
                <Text>Has Voted: {item.hasVoted.toString()}</Text>
                <Text>Last Updated: {item.lastUpdated ? formatDateTime(item.lastUpdated.hex) : 'Invalid date'}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.updateButton} onPress={() => {
                        setSelectedVoter(item);
                        setFormData({ id: item.id.hex, name: item.name, email: item.email, password: '' });
                        setShowUpdateForm(true);
                    }}>
                        <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteVoter(item.id.hex)}>
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const keyExtractor = (item: Voter) => {
        return `${item.id.hex}-${item.email}`;
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by name, email, status or ID"
                value={searchQuery}
                onChangeText={handleSearch}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#EC8638" />
            ) : error ? (
                <Text style={styles.errorText}>Error: {error}</Text>
            ) : (
                <FlatList
                    data={filteredData} // Display filtered data
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                />
            )}
            {showUpdateForm && (
                <View style={styles.form}>
                    <Text>Update Voter</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={formData.name}
                        onChangeText={text => setFormData({ ...formData, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={formData.email}
                        onChangeText={text => setFormData({ ...formData, email: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={formData.password}
                        secureTextEntry
                        onChangeText={text => setFormData({ ...formData, password: text })}
                    />
                    <TouchableOpacity style={styles.updateButton} onPress={updateVoter}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowUpdateForm(false)}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
            {showAddForm && (
                <View style={styles.form}>
                    <Text>Add Voter</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ID"
                        value={formData.id}
                        onChangeText={text => setFormData({ ...formData, id: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={formData.name}
                        onChangeText={text => setFormData({ ...formData, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={formData.email}
                        onChangeText={text => setFormData({ ...formData, email: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={formData.password}
                        secureTextEntry
                        onChangeText={text => setFormData({ ...formData, password: text })}
                    />
                    <TouchableOpacity style={styles.updateButton} onPress={addVoter}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        setShowAddForm(false);
                        setFormData({ id: '', name: '', email: '', password: '' });
                    }}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity style={styles.addButton} onPress={() => {
                setShowAddForm(true);
                setFormData({ id: '', name: '', email: '', password: '' }); // Reset form data before showing add form
            }}>
                <Text style={styles.buttonText}>Add New Voter</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    item: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    searchBar: {
        height: 40,
        borderColor: '#EC8638',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    form: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 16,
    },
    updateButton: {
        backgroundColor: '#EC8638',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    cancelButton: {
        backgroundColor: 'gray',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    addButton: {
        backgroundColor: '#EC8638',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 15,
    },
});

export default ValidVoterScreen;
