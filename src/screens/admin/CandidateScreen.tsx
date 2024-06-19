import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';

type BigNumberType = {
    type: string;
    hex: string;
};

type Candidate = {
    id: BigNumberType;
    name: string;
    visi: string;
    misi: string;
    lastUpdated: BigNumberType;
};

type CandidateHistory = [
    BigNumberType, // id
    string,       // name
    string,       // email
    string,
    BigNumberType // lastUpdated
];

const CandidateScreen = () => {
    const [data, setData] = useState<Array<Candidate | CandidateHistory>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [formData, setFormData] = useState({ id: '', name: '', visi: '', misi: '' });

    const fetchCandidateHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            setData([]);
            const response = await axios.get<CandidateHistory[]>('http://192.168.0.107:3000/all-candidate-histories');
            console.log('Candidate Histories:', response.data);
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

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            setData([]);
            const response = await axios.get<{ error: boolean; message: string; candidates: Candidate[] }>('http://192.168.0.107:3000/candidates');
            console.log('Candidates:', response.data);
            setData(response.data.candidates);
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

    const updateCandidate = async () => {
        if (!selectedCandidate) return;
        try {
            setLoading(true);
            await axios.put(`http://192.168.0.107:3000/candidates/${selectedCandidate.id.hex}`, formData);
            Alert.alert('Success', 'Candidate updated successfully');
            setShowUpdateForm(false);
            fetchCandidates(); // Refresh the data
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

    const addCandidate = async () => {
        try {
            setLoading(true);
            const existingCandidates = await axios.get<{ error: boolean; message: string; candidates: Candidate[] }>('http://192.168.0.107:3000/candidates');
            const existingIds = existingCandidates.data.candidates.map(candidate => candidate.id.hex);

            if (existingIds.includes(formData.id)) {
                Alert.alert('Error', 'Candidate ID already exists');
                setLoading(false);
                return;
            }

            await axios.post('http://192.168.0.107:3000/candidates', formData);
            Alert.alert('Success', 'Candidate added successfully');
            setShowAddForm(false);
            fetchCandidates(); // Refresh the data
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

    const deleteCandidate = async (id: string) => {
        try {
            setLoading(true);
            await axios.delete(`http://192.168.0.107:3000/candidates/${id}`);
            Alert.alert('Success', 'Candidate deleted successfully');
            fetchCandidates(); // Refresh the data
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

    const renderItem = ({ item }: { item: Candidate | CandidateHistory }) => {
        if (Array.isArray(item)) {
            // Handling CandidateHistory
            const [id, name, visi, misi, lastUpdated] = item;
            return (
                <View style={styles.item}>
                    <Text>ID: {id?.hex ?? 'N/A'}</Text>
                    <Text>Name: {name}</Text>
                    <Text>Visi: {visi}</Text>
                    <Text>Misi: {misi}</Text>
                    <Text>Last Updated: {lastUpdated ? formatDateTime(lastUpdated.hex) : 'Invalid date'}</Text>
                </View>
            );
        } else {
            // Handling Candidate
            return (
                <View style={styles.item}>
                    <Text>ID: {item.id?.hex ?? 'N/A'}</Text>
                    <Text>Name: {item.name}</Text>
                    <Text>Visi: {item.visi}</Text>
                    <Text>Misi: {item.misi}</Text>
                    <Text>Last Updated: {item.lastUpdated ? formatDateTime(item.lastUpdated.hex) : 'Invalid date'}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="Update" onPress={() => {
                            setSelectedCandidate(item);
                            setFormData({ id: item.id.hex, name: item.name, visi: item.visi, misi: item.misi });
                            setShowUpdateForm(true);
                        }} />
                        <Button title="Delete" onPress={() => deleteCandidate(item.id.hex)} color="red" />
                    </View>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Candidate Screen</Text>
            <Button title="Candidate History" onPress={fetchCandidateHistories} />
            <Button title="Valid Candidate" onPress={fetchCandidates} />
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
            {showUpdateForm && selectedCandidate && (
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Update Candidate</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ID"
                        value={formData.id}
                        editable={false}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Vision"
                        value={formData.visi}
                        onChangeText={(text) => setFormData({ ...formData, visi: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mision"
                        value={formData.misi}
                        onChangeText={(text) => setFormData({ ...formData, misi: text })}
                    />
                    <Button title="Submit" onPress={updateCandidate} />
                    <Button title="Cancel" onPress={() => setShowUpdateForm(false)} />
                </View>
            )}
            {showAddForm && (
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Add Candidate</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ID"
                        value={formData.id}
                        onChangeText={(text) => setFormData({ ...formData, id: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Vision"
                        value={formData.visi}
                        onChangeText={(text) => setFormData({ ...formData, visi: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mission"
                        secureTextEntry
                        value={formData.misi}
                        onChangeText={(text) => setFormData({ ...formData, misi: text })}
                    />
                    <Button title="Submit" onPress={addCandidate} />
                    <Button title="Cancel" onPress={() => setShowAddForm(false)} />
                </View>
            )}
            <TouchableOpacity style={styles.floatingButton} onPress={() => setShowAddForm(true)}>
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007BFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default CandidateScreen;
