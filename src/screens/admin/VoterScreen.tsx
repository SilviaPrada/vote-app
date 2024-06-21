// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
// import axios from 'axios';
// import { BigNumber } from '@ethersproject/bignumber';

// type BigNumberType = {
//     type: string;
//     hex: string;
// };

// type Voter = {
//     id: BigNumberType;
//     name: string;
//     email: string;
//     password?: string;
//     hasVoted: boolean;
//     lastUpdated: BigNumberType;
// };

// type VoterHistory = [
//     BigNumberType, // id
//     string,       // name
//     string,       // email
//     boolean,      // hasVoted
//     string,       // txHash
//     BigNumberType // lastUpdated
// ];

// const VoterScreen = () => {
//     const [data, setData] = useState<Array<Voter | VoterHistory>>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [showUpdateForm, setShowUpdateForm] = useState(false);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
//     const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '' });
//     const [searchQuery, setSearchQuery] = useState('');

//     const fetchVoterHistories = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             setData([]);
//             const response = await axios.get<VoterHistory[]>('http://192.168.0.107:3000/all-voter-histories');
//             console.log('Voter Histories:', response.data);
//             setData(response.data);
//         } catch (error) {
//             if (axios.isAxiosError(error)) {
//                 setError(error.message);
//             } else {
//                 setError(String(error));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchVoters = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             setData([]);
//             const response = await axios.get<{ error: boolean; message: string; voters: Voter[] }>('http://192.168.0.107:3000/voters');
//             console.log('Voters:', response.data);
//             setData(response.data.voters);
//         } catch (error) {
//             if (axios.isAxiosError(error)) {
//                 setError(error.message);
//             } else {
//                 setError(String(error));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDateTime = (timestamp: string) => {
//         if (!timestamp) return 'Invalid date';
//         try {
//             const unixTimestamp = BigNumber.from(timestamp).toNumber();
//             const dateObj = new Date(unixTimestamp * 1000);
//             return dateObj.toLocaleString(); // Adjust based on your localization preferences
//         } catch (error) {
//             return 'Invalid date';
//         }
//     };

//     const updateVoter = async () => {
//         if (!selectedVoter) return;
//         try {
//             setLoading(true);
//             await axios.put(`http://192.168.0.107:3000/voters/${selectedVoter.id.hex}`, formData);
//             Alert.alert('Success', 'Voter updated successfully');
//             setShowUpdateForm(false);
//             fetchVoters(); // Refresh the data
//         } catch (error) {
//             if (axios.isAxiosError(error)) {
//                 setError(error.message);
//             } else {
//                 setError(String(error));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const addVoter = async () => {
//         try {
//             setLoading(true);
//             const existingVoters = await axios.get<{ error: boolean; message: string; voters: Voter[] }>('http://192.168.0.107:3000/voters');
//             const existingIds = existingVoters.data.voters.map(voter => voter.id.hex);

//             if (existingIds.includes(formData.id)) {
//                 Alert.alert('Error', 'Voter ID already exists');
//                 setLoading(false);
//                 return;
//             }

//             await axios.post('http://192.168.0.107:3000/voters', formData);
//             Alert.alert('Success', 'Voter added successfully');
//             setShowAddForm(false);
//             fetchVoters(); // Refresh the data
//         } catch (error) {
//             if (axios.isAxiosError(error)) {
//                 setError(error.message);
//             } else {
//                 setError(String(error));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const deleteVoter = async (id: string) => {
//         try {
//             setLoading(true);
//             await axios.delete(`http://192.168.0.107:3000/voters/${id}`);
//             Alert.alert('Success', 'Voter deleted successfully');
//             fetchVoters(); // Refresh the data
//         } catch (error) {
//             if (axios.isAxiosError(error)) {
//                 setError(error.message);
//             } else {
//                 setError(String(error));
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const renderItem = ({ item }: { item: Voter | VoterHistory }) => {
//         if (Array.isArray(item)) {
//             // Handling VoterHistory
//             const [id, name, email, hasVoted, txHash, lastUpdated] = item;
//             return (
//                 <View style={styles.item}>
//                     <Text>ID: {id ? BigNumber.from(id.hex).toString() : 'N/A'}</Text>
//                     <Text>Name: {name}</Text>
//                     <Text>Has Voted: {hasVoted.toString()}</Text>
//                     <Text>Email: {email}</Text>
//                     <Text>Last Updated: {lastUpdated ? formatDateTime(lastUpdated.hex) : 'Invalid date'}</Text>
//                 </View>
//             );
//         } else {
//             // Handling Voter
//             return (
//                 <View style={styles.item}>
//                     <Text>ID: {item.id ? BigNumber.from(item.id.hex).toString() : 'N/A'}</Text>
//                     <Text>Name: {item.name}</Text>
//                     <Text>Email: {item.email}</Text>
//                     <Text>Has Voted: {item.hasVoted.toString()}</Text>
//                     <Text>Last Updated: {item.lastUpdated ? formatDateTime(item.lastUpdated.hex) : 'Invalid date'}</Text>
//                     <View style={styles.buttonContainer}>
//                         <Button title="Update" onPress={() => {
//                             setSelectedVoter(item);
//                             setFormData({ id: item.id.hex, name: item.name, email: item.email, password: '' });
//                             setShowUpdateForm(true);
//                         }} />
//                         <Button title="Delete" onPress={() => deleteVoter(item.id.hex)} color="red" />
//                     </View>
//                 </View>
//             );
//         }
//     };

//     useEffect(() => {
//         fetchVoterHistories();
//     }, []);

//     const handleSearch = (text: string) => {
//         setSearchQuery(text);
//         const filteredData = data.filter(item => {
//             if (Array.isArray(item)) {
//                 // Handle VoterHistory
//                 const [id, name, email, hasVoted] = item;
//                 return (
//                     name.toLowerCase().includes(text.toLowerCase()) ||
//                     BigNumber.from(id.hex).toString().includes(text.toLowerCase()) ||
//                     email.toLowerCase().includes(text.toLowerCase()) ||
//                     hasVoted.toString().toLowerCase().includes(text.toLowerCase())
//                 );
//             } else {
//                 // Handle Voter
//                 return (
//                     item.name.toLowerCase().includes(text.toLowerCase()) ||
//                     BigNumber.from(item.id.hex).toString().includes(text.toLowerCase()) ||
//                     item.email.toLowerCase().includes(text.toLowerCase()) ||
//                     item.hasVoted.toString().toLowerCase().includes(text.toLowerCase())
//                 );
//             }

//         });
//         setData(filteredData);
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Vote Count Screen</Text>
//             {/* <Button title="Voter History" onPress={fetchVoterHistories} />
//             <Button title="Valid Voter" onPress={fetchVoters} /> */}
//             <View style={styles.buttonRow}>
//                 <Button title="Voter History" onPress={fetchVoterHistories} />
//                 <Button title="Valid Voter" onPress={fetchVoters} />
//             </View>
//             <TextInput
//                 style={styles.searchBar}
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChangeText={handleSearch}
//             />
//             {loading && <ActivityIndicator size="large" color="#0000ff" />}
//             {error && <Text style={styles.error}>{error}</Text>}
//             <FlatList
//                 data={data}
//                 keyExtractor={(item, index) => {
//                     if (Array.isArray(item)) return item[0]?.hex ?? index.toString();
//                     return item.id?.hex ?? index.toString();
//                 }}
//                 renderItem={renderItem}
//             />
//             {showUpdateForm && selectedVoter && (
//                 <View style={styles.form}>
//                     <Text style={styles.formTitle}>Update Voter</Text>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="ID"
//                         value={formData.id}
//                         editable={false}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Name"
//                         value={formData.name}
//                         onChangeText={(text) => setFormData({ ...formData, name: text })}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Email"
//                         value={formData.email}
//                         onChangeText={(text) => setFormData({ ...formData, email: text })}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Password"
//                         secureTextEntry
//                         value={formData.password}
//                         onChangeText={(text) => setFormData({ ...formData, password: text })}
//                     />
//                     <Button title="Submit" onPress={updateVoter} />
//                     <Button title="Cancel" onPress={() => setShowUpdateForm(false)} />
//                 </View>
//             )}
//             {showAddForm && (
//                 <View style={styles.form}>
//                     <Text style={styles.formTitle}>Add Voter</Text>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="ID"
//                         value={formData.id}
//                         onChangeText={(text) => setFormData({ ...formData, id: text })}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Name"
//                         value={formData.name}
//                         onChangeText={(text) => setFormData({ ...formData, name: text })}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Email"
//                         value={formData.email}
//                         onChangeText={(text) => setFormData({ ...formData, email: text })}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Password"
//                         secureTextEntry
//                         value={formData.password}
//                         onChangeText={(text) => setFormData({ ...formData, password: text })}
//                     />
//                     <Button title="Submit" onPress={addVoter} />
//                     <Button title="Cancel" onPress={() => setShowAddForm(false)} />
//                 </View>
//             )}
//             <TouchableOpacity style={styles.floatingButton} onPress={() => setShowAddForm(true)}>
//                 <Text style={styles.floatingButtonText}>+</Text>
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 16,
//         backgroundColor: '#fff',
//     },
//     title: {
//         fontSize: 24,
//         marginBottom: 16,
//     },
//     buttonRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//         marginBottom: 10,
//     },
//     searchBar: {
//         height: 40,
//         borderColor: 'gray',
//         borderWidth: 1,
//         paddingHorizontal: 8,
//         width: '100%',
//         marginBottom: 16,
//     },
//     error: {
//         color: 'red',
//         marginVertical: 8,
//     },
//     item: {
//         padding: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//     },
//     form: {
//         padding: 16,
//         borderWidth: 1,
//         borderColor: '#ccc',
//         marginTop: 16,
//         width: '100%',
//     },
//     formTitle: {
//         fontSize: 20,
//         marginBottom: 12,
//     },
//     input: {
//         height: 40,
//         borderColor: 'gray',
//         borderWidth: 1,
//         marginBottom: 12,
//         paddingHorizontal: 8,
//         width: '100%',
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 8,
//     },
//     floatingButton: {
//         position: 'absolute',
//         right: 20,
//         bottom: 20,
//         backgroundColor: '#007BFF',
//         width: 60,
//         height: 60,
//         borderRadius: 30,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     floatingButtonText: {
//         color: 'white',
//         fontSize: 24,
//         fontWeight: 'bold',
//     },
// });

// export default VoterScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
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
    const [voterData, setVoterData] = useState<Voter[]>([]);
    const [voterHistoryData, setVoterHistoryData] = useState<VoterHistory[]>([]);
    const [filteredData, setFilteredData] = useState<Array<Voter | VoterHistory>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'validVoter' | 'voterHistory'>('validVoter');

    useEffect(() => {
        fetchVoters();
        fetchVoterHistories();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [voterData, voterHistoryData, currentView]);

    const fetchVoterHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<VoterHistory[]>('http://192.168.0.107:3000/all-voter-histories');
            console.log('Voter Histories:', response.data);
            setVoterHistoryData(response.data);
            if (currentView === 'voterHistory') setFilteredData(response.data);
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
            setVoterData(response.data.voters);
            if (currentView === 'validVoter') setFilteredData(response.data.voters);
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

    const addVoter = async () => {
        try {
            setLoading(true);
            const existingVoters = await axios.get<{ error: boolean; message: string; voters: Voter[] }>('http://192.168.0.107:3000/voters');
            const existingIds = existingVoters.data.voters.map(voter => voter.id.hex);

            if (existingIds.includes(formData.id)) {
                Alert.alert('Error', 'Voter ID already exists');
                setLoading(false);
                return;
            }

            await axios.post('http://192.168.0.107:3000/voters', formData);
            Alert.alert('Success', 'Voter added successfully');
            setShowAddForm(false);
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

    const deleteVoter = async (id: string) => {
        try {
            setLoading(true);
            await axios.delete(`http://192.168.0.107:3000/voters/${id}`);
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

    const renderItem = ({ item }: { item: Voter | VoterHistory }) => {
        if (Array.isArray(item)) {
            // Handling VoterHistory
            const [id, name, email, hasVoted, txHash, lastUpdated] = item;
            return (
                <View style={styles.item}>
                    <Text>ID: {BigNumber.from(id.hex).toString()}</Text>
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
                    <Text>ID: {BigNumber.from(item.id.hex).toString()}</Text>
                    <Text>Name: {item.name}</Text>
                    <Text>Email: {item.email}</Text>
                    <Text>Has Voted: {item.hasVoted.toString()}</Text>
                    <Text>Last Updated: {item.lastUpdated ? formatDateTime(item.lastUpdated.hex) : 'Invalid date'}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="Update" onPress={() => {
                            setSelectedVoter(item);
                            setFormData({ id: item.id.hex, name: item.name, email: item.email, password: '' });
                            setShowUpdateForm(true);
                        }} />
                        <Button title="Delete" onPress={() => deleteVoter(item.id.hex)} color="red" />
                    </View>
                </View>
            );
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        let filteredData;
        if (text === '') {
            filteredData = currentView === 'validVoter' ? voterData : voterHistoryData;
        } else {
            filteredData = (currentView === 'validVoter' ? voterData : voterHistoryData).filter(item => {
                if (Array.isArray(item)) {
                    const [id, name, email, hasVoted] = item;
                    return (
                        name.toLowerCase().includes(text.toLowerCase()) ||
                        BigNumber.from(id.hex).toString().includes(text) ||
                        email.toLowerCase().includes(text.toLowerCase()) ||
                        hasVoted.toString().toLowerCase().includes(text.toLowerCase())
                    );
                } else {
                    return (
                        item.name.toLowerCase().includes(text.toLowerCase()) ||
                        BigNumber.from(item.id.hex).toString().includes(text) ||
                        item.email.toLowerCase().includes(text.toLowerCase()) ||
                        item.hasVoted.toString().toLowerCase().includes(text.toLowerCase())
                    );
                }
            });
        }
        setFilteredData(filteredData);
    };

    const handleViewChange = (view: 'validVoter' | 'voterHistory') => {
        setCurrentView(view);
        setFilteredData(view === 'validVoter' ? voterData : voterHistoryData);
        setSearchQuery(''); // Reset search query when switching views
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => handleViewChange('validVoter')} style={currentView === 'validVoter' ? styles.activeTab : styles.inactiveTab}>
                <Text style={styles.tabText}>Valid Voters</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewChange('voterHistory')} style={currentView === 'voterHistory' ? styles.activeTab : styles.inactiveTab}>
                <Text style={styles.tabText}>Voter History</Text>
            </TouchableOpacity>
        </View>
    );

    const keyExtractor = (item: Voter | VoterHistory) => {
        if (Array.isArray(item)) {
            // Use ID combined with another attribute for uniqueness
            const [id, , email] = item;
            return `${id.hex}-${email}`;
        } else {
            // Use ID combined with another attribute for uniqueness
            return `${item.id.hex}-${item.email}`;
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by name, email, status or ID"
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
                    <Button title="Submit" onPress={updateVoter} />
                    <Button title="Cancel" onPress={() => setShowUpdateForm(false)} color="red" />
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
                    <Button title="Submit" onPress={addVoter} />
                    <Button title="Cancel" onPress={() => setShowAddForm(false)} color="red" />
                </View>
            )}
            <Button title="Add New Voter" onPress={() => setShowAddForm(true)} />
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

export default VoterScreen;
