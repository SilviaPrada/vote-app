import React, { useEffect, useState } from 'react';
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
    hasVoted: boolean;
};

type CandidateHistory = [
    BigNumberType, // id
    string,       // name
    string,       // visi
    string,       // misi
    BigNumberType, // lastUpdated
    boolean       // hasVoted
];

const CandidateScreen = () => {
    const [candidateData, setCandidateData] = useState<Candidate[]>([]);
    const [candidateHistoryData, setCandidateHistoryData] = useState<CandidateHistory[]>([]);
    const [filteredData, setFilteredData] = useState<Array<Candidate | CandidateHistory>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [formData, setFormData] = useState({ id: '', name: '', visi: '', misi: '', hasVoted: false });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'validCandidate' | 'candidateHistory'>('validCandidate');

    useEffect(() => {
        fetchCandidates();
        fetchCandidateHistories();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [candidateData, candidateHistoryData, currentView]);

    const fetchCandidateHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<CandidateHistory[]>('http://192.168.0.107:3000/all-candidate-histories');
            console.log('Candidate Histories:', response.data);
            setCandidateHistoryData(response.data);
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
            const response = await axios.get<{ error: boolean; message: string; candidates: Candidate[] }>('http://192.168.0.107:3000/candidates');
            console.log('Candidates:', response.data);
            setCandidateData(response.data.candidates);
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
            const [id, name, visi, misi, lastUpdated, hasVoted] = item;
            return (
                <View style={styles.item}>
                    <Text>ID: {id ? BigNumber.from(id.hex).toString() : 'N/A'}</Text>
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
                    <Text>ID: {item.id ? BigNumber.from(item.id.hex).toString() : 'N/A'}</Text>
                    <Text>Name: {item.name}</Text>
                    <Text>Visi: {item.visi}</Text>
                    <Text>Misi: {item.misi}</Text>
                    <Text>Last Updated: {item.lastUpdated ? formatDateTime(item.lastUpdated.hex) : 'Invalid date'}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="Update" onPress={() => {
                            setSelectedCandidate(item);
                            setFormData({ id: item.id.hex, name: item.name, visi: item.visi, misi: item.misi, hasVoted: item.hasVoted });
                            setShowUpdateForm(true);
                        }} />
                        <Button title="Delete" onPress={() => deleteCandidate(item.id.hex)} color="red" />
                    </View>
                </View>
            );
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        let filteredData;
        if (text === '') {
            filteredData = currentView === 'validCandidate' ? candidateData : candidateHistoryData;
        } else {
            filteredData = (currentView === 'validCandidate' ? candidateData : candidateHistoryData).filter(item => {
                if (Array.isArray(item)) {
                    const [id, name, visi, misi, hasVoted] = item;
                    return (
                        name.toLowerCase().includes(text.toLowerCase()) ||
                        BigNumber.from(id.hex).toString().includes(text) ||
                        visi.toLowerCase().includes(text.toLowerCase()) ||
                        misi.toLowerCase().includes(text.toLowerCase()) ||
                        hasVoted.toString().toLowerCase().includes(text.toLowerCase())
                    );
                } else {
                    return (
                        item.name.toLowerCase().includes(text.toLowerCase()) ||
                        BigNumber.from(item.id.hex).toString().includes(text) ||
                        item.visi.toLowerCase().includes(text.toLowerCase()) ||
                        item.misi.toLowerCase().includes(text.toLowerCase()) ||
                        item.hasVoted.toString().toLowerCase().includes(text.toLowerCase())
                    );
                }
            });
        }
        setFilteredData(filteredData);
    };

    const handleViewChange = (view: 'validCandidate' | 'candidateHistory') => {
        setCurrentView(view);
        setFilteredData(view === 'validCandidate' ? candidateData : candidateHistoryData);
        setSearchQuery(''); // Reset search query when switching views
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => handleViewChange('validCandidate')} style={currentView === 'validCandidate' ? styles.activeTab : styles.inactiveTab}>
                <Text style={styles.tabText}>Valid Candidates</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewChange('candidateHistory')} style={currentView === 'candidateHistory' ? styles.activeTab : styles.inactiveTab}>
                <Text style={styles.tabText}>Candidate History</Text>
            </TouchableOpacity>
        </View>
    );

    const keyExtractor = (item: Candidate | CandidateHistory) => {
        if (Array.isArray(item)) {
            // Use ID combined with another attribute for uniqueness
            const [id, , name] = item;
            return `${id.hex}-${name}`;
        } else {
            // Use ID combined with another attribute for uniqueness
            return `${item.id.hex}-${item.name}`;
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by name, vison, mision or ID"
                value={searchQuery}
                onChangeText={handleSearch}
            />
            {renderHeader()}
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.errorText}>Error: {error}</Text>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                />
            )}
            {showUpdateForm && (
                <View style={styles.form}>
                    <Text>Update Candidate</Text>
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
                        placeholder="Mission"
                        value={formData.misi}
                        onChangeText={(text) => setFormData({ ...formData, misi: text })}
                    />
                    <Button title="Submit" onPress={updateCandidate} />
                    <Button title="Cancel" onPress={() => setShowUpdateForm(false)} />
                </View>
            )}
            {showAddForm && (
                <View style={styles.form}>
                    <Text>Add Candidate</Text>
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
                        value={formData.misi}
                        onChangeText={(text) => setFormData({ ...formData, misi: text })}
                    />
                    <Button title="Submit" onPress={addCandidate} />
                    <Button title="Cancel" onPress={() => setShowAddForm(false)} />
                </View>
            )}
            <Button title="Add New Candidate" onPress={() => setShowAddForm(true)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
        borderColor: 'gray',
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    inactiveTab: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CandidateScreen;
