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
};

type CandidateHistory = [
    BigNumberType, // id
    string,       // name
    string,       // visi
    string,       // misi
    BigNumberType, // lastUpdated
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
    const [formData, setFormData] = useState({ id: '', name: '', visi: '', misi: '' });
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
            const response = await axios.get<CandidateHistory[]>('http://192.168.0.103:3000/all-candidate-histories');
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
            const response = await axios.get<{ error: boolean; message: string; candidates: Candidate[] }>('http://192.168.0.103:3000/candidates');
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
            await axios.put(`http://192.168.0.103:3000/candidates/${selectedCandidate.id.hex}`, formData);
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
            const existingCandidates = await axios.get<{ error: boolean; message: string; candidates: Candidate[] }>('http://192.168.0.103:3000/candidates');
            const existingIds = existingCandidates.data.candidates.map(candidate => candidate.id.hex);

            if (existingIds.includes(formData.id)) {
                Alert.alert('Error', 'Candidate ID already exists');
                setLoading(false);
                return;
            }

            await axios.post('http://192.168.0.103:3000/candidates', formData);
            Alert.alert('Success', 'Candidate added successfully');
            setShowAddForm(false);
            fetchCandidates(); // Refresh the data
            fetchCandidateHistories(); // Refresh the voter history data
            setFilteredData(currentView === 'validCandidate' ? candidateData : candidateHistoryData);
            setFormData({ id: '', name: '', visi: '', misi: '' }); // Reset form data
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
            await axios.delete(`http://192.168.0.103:3000/candidates/${id}`);
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
                        <TouchableOpacity style={styles.updateButton} onPress={() => {
                            setSelectedCandidate(item);
                            setFormData({ id: item.id.hex, name: item.name, visi: item.visi, misi: item.misi });
                            setShowUpdateForm(true);
                        }}>
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCandidate(item.id.hex)}>
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
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
                    const [id, name, visi, misi] = item;
                    return (
                        name.toLowerCase().includes(text.toLowerCase()) ||
                        BigNumber.from(id.hex).toString().includes(text) ||
                        visi.toLowerCase().includes(text.toLowerCase()) ||
                        misi.toLowerCase().includes(text.toLowerCase())
                    );
                } else {
                    return (
                        item.name.toLowerCase().includes(text.toLowerCase()) ||
                        BigNumber.from(item.id.hex).toString().includes(text) ||
                        item.visi.toLowerCase().includes(text.toLowerCase()) ||
                        item.misi.toLowerCase().includes(text.toLowerCase())
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
                        style={[styles.input, styles.textArea]}
                        placeholder="Vision"
                        value={formData.visi}
                        onChangeText={(text) => setFormData({ ...formData, visi: text })}
                        multiline
                        numberOfLines={4}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mission"
                        value={formData.misi}
                        onChangeText={(text) => setFormData({ ...formData, misi: text })}
                        multiline
                        numberOfLines={4}
                    />
                    <TouchableOpacity style={styles.updateButton} onPress={updateCandidate}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowUpdateForm(false)}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
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
                        style={[styles.input, styles.textArea]}
                        placeholder="Vision"
                        value={formData.visi}
                        onChangeText={(text) => setFormData({ ...formData, visi: text })}
                        multiline
                        numberOfLines={4}
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Mission"
                        value={formData.misi}
                        onChangeText={(text) => setFormData({ ...formData, misi: text })}
                        multiline
                        numberOfLines={4}
                    />
                    <TouchableOpacity style={styles.updateButton} onPress={addCandidate}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        setShowAddForm(false);
                        setFormData({ id: '', name: '', visi: '', misi: '' }); // Reset form data on cancel
                    }}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity style={styles.addButton} onPress={() => {
                setShowAddForm(true);
                setFormData({ id: '', name: '', visi: '', misi: '' }); // Reset form data before showing add form
            }}>
                <Text style={styles.buttonText}>Add New Candidate</Text>
            </TouchableOpacity>
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
    textArea: {
        height: 80,
        textAlignVertical: 'top', // This is important to ensure the text starts at the top of the TextInput
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
        borderBottomColor: '#EC8638',
    },
    inactiveTab: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(242, 203, 168, 0.7)',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#EC8638',
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

export default CandidateScreen;
