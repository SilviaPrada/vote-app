import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';
import { API_URL } from '@env';
import { VoterHistory } from '../../types/app';

const VoterHistoryScreen = () => {
    const [voterHistoryData, setVoterHistoryData] = useState<VoterHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredData, setFilteredData] = useState<VoterHistory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVoterHistories();
    }, []);

    const fetchVoterHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<VoterHistory[]>(`${API_URL}/all-voter-histories`);
            const sortedData = response.data.sort((a, b) => {
                const lastUpdatedA = BigNumber.from(a[5]?.hex || 0).toNumber();
                const lastUpdatedB = BigNumber.from(b[5]?.hex || 0).toNumber();
                return lastUpdatedB - lastUpdatedA;
            });
            console.log('Voter Histories:', sortedData);
            setVoterHistoryData(sortedData);
            setFilteredData(sortedData);
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
            return dateObj.toLocaleString();
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
            setFilteredData(voterHistoryData);
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
            setFilteredData(filteredData);
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

export default VoterHistoryScreen;
