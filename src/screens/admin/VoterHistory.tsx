import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';

type BigNumberType = {
    type: string;
    hex: string;
};

type VoterHistory = [
    BigNumberType, // id
    string,       // name
    string,       // email
    boolean,      // hasVoted
    string,       // txHash
    BigNumberType // lastUpdated
];

const VoterHistoryScreen = () => {
    const [voterHistoryData, setVoterHistoryData] = useState<VoterHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<VoterHistory[]>([]); // Changed from Array<VoterHistory>
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVoterHistories();
    }, []);

    const fetchVoterHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<VoterHistory[]>('http://192.168.0.103:3000/all-voter-histories');
            console.log('Voter Histories:', response.data);
            setVoterHistoryData(response.data);
            setFilteredData(response.data); // Initialize filteredData with all data
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

    const renderItem = ({ item }: { item: VoterHistory }) => {
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
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text === '') {
            setFilteredData(voterHistoryData); // Reset to all data when search is cleared
        } else {
            const filteredData = voterHistoryData.filter(item => {
                const [id, name, email, hasVoted] = item;
                return (
                    name.toLowerCase().includes(text.toLowerCase()) ||
                    BigNumber.from(id.hex).toString().includes(text) ||
                    email.toLowerCase().includes(text.toLowerCase()) ||
                    hasVoted.toString().toLowerCase().includes(text.toLowerCase())
                );
            });
            setFilteredData(filteredData); // Update filtered data based on search
        }
    };

    const keyExtractor = (item: VoterHistory, index: number) => {
        const [id, name, email, hasVoted, txHash, lastUpdated] = item;
        return `${BigNumber.from(id.hex).toString()}-${name}-${email}-${hasVoted}-${txHash}-${BigNumber.from(lastUpdated.hex).toString()}`;
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
                    data={filteredData} // Render filteredData instead of voterHistoryData
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

export default VoterHistoryScreen;
