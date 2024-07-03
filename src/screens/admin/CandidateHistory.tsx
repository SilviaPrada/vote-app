import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';

type BigNumberType = {
    type: string;
    hex: string;
};

type CandidateHistory = [
    BigNumberType, // id
    string,       // name
    string,       // visi
    string,       // misi
    BigNumberType, // lastUpdated
];

const CandidateHistoryScreen = () => {
    const [candidateHistoryData, setCandidateHistoryData] = useState<CandidateHistory[]>([]);
    const [filteredData, setFilteredData] = useState<CandidateHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCandidateHistories();
    }, []);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [candidateHistoryData, searchQuery]);

    const fetchCandidateHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<CandidateHistory[]>('http://192.168.0.103:3000/all-candidate-histories');
            console.log('Candidate Histories:', response.data);
            setCandidateHistoryData(response.data);
            setFilteredData(response.data); // Initialize filtered data
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

    const renderItem = ({ item }: { item: CandidateHistory }) => {
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
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredData(candidateHistoryData);
        } else {
            const filtered = candidateHistoryData.filter(item => {
                const [id, name, visi, misi] = item;
                return (
                    name.toLowerCase().includes(text.toLowerCase()) ||
                    BigNumber.from(id.hex).toString().includes(text) ||
                    visi.toLowerCase().includes(text.toLowerCase()) ||
                    misi.toLowerCase().includes(text.toLowerCase())
                );
            });
            setFilteredData(filtered);
        }
    };

    const keyExtractor = (item: CandidateHistory) => {
        const [id, name, visi, misi, lastUpdated] = item;
        return `${BigNumber.from(id.hex).toString()}-${name}-${visi}-${misi}-${BigNumber.from(lastUpdated.hex).toString()}`;
    };


    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by name, vision, mission or ID"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
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
    searchBar: {
        height: 40,
        borderColor: '#EC8638',
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
});

export default CandidateHistoryScreen;
