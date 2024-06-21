import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { BigNumber } from '@ethersproject/bignumber';

type BigNumberType = {
    type: string;
    hex: string;
};

interface VoteCount {
    id: BigNumberType;
    voteCount: BigNumberType;
}

interface VoteHistoryItem {
    hex: string;
    type: string;
}

interface VoteHistory {
    candidate: VoteHistoryItem;
    count: VoteHistoryItem;
    timestamp: VoteHistoryItem;
}

const VoteCountScreen: React.FC = () => {
    const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
    const [voteHistories, setVoteHistories] = useState<VoteHistory[]>([]);
    const [filteredHistories, setFilteredHistories] = useState<VoteHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    const fetchVoteCounts = async () => {
        setLoading(true);
        setError(null);
        try {
            setVoteCounts([]);
            const response = await axios.get<{ voteCounts: VoteCount[] }>('http://192.168.0.107:3000/vote-counts');
            console.log('Vote Counts:', response.data);
            setVoteCounts(response.data.voteCounts);
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

    const fetchVoteHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            setVoteHistories([]);
            const response = await axios.get<VoteHistoryItem[][]>('http://192.168.0.107:3000/all-vote-count-histories');
            console.log('Vote Histories:', response.data);
            const formattedHistories = response.data.map(item => ({
                candidate: item[0],
                count: item[1],
                timestamp: item[2],
            }));
            setVoteHistories(formattedHistories);
            setFilteredHistories(formattedHistories);
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

    useEffect(() => {
        fetchVoteCounts();
        fetchVoteHistories();
    }, []);

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

    const renderVoteCountItem = ({ item }: { item: VoteCount }) => (
        <View style={styles.voteCount}>
            <Text style={styles.candidate}>{item.id ? BigNumber.from(item.id.hex).toString() : 'N/A'}</Text>
            <Text style={styles.count}>{item.voteCount ? BigNumber.from(item.voteCount.hex).toString() : 'N/A'} votes</Text>
        </View>
    );

    const renderVoteHistoryItem = ({ item }: { item: VoteHistory }) => (
        <View style={styles.historyItem}>
            <Text style={styles.historyText}>Candidate: {item.candidate ? BigNumber.from(item.candidate.hex).toString() : 'N/A'}</Text>
            <Text style={styles.historyText}>Count: {item.count ? BigNumber.from(item.count.hex).toString() : 'N/A'}</Text>
            <Text style={styles.historyText}>Timestamp: {item.timestamp ? formatDateTime(item.timestamp.hex) : 'Invalid date'}</Text>
        </View>
    );

    const handleSearch = (text: string) => {
        setSearchText(text);
        if (text) {
            const filtered = voteHistories.filter(history =>
                BigNumber.from(history.candidate.hex).toString().includes(text)
            );
            setFilteredHistories(filtered);
        } else {
            setFilteredHistories(voteHistories);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vote Count Screen</Text>
            <Button title="Refresh Vote Counts" onPress={fetchVoteCounts} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.subtitle}>Current Vote Counts:</Text>
            <FlatList
                data={voteCounts}
                keyExtractor={(item, index) => item.id?.hex ?? index.toString()}
                renderItem={renderVoteCountItem}
            />

            <Button title="Refresh Vote Histories" onPress={fetchVoteHistories} />
            <Text style={styles.subtitle}>Vote Count History:</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by candidate ID"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredHistories}
                keyExtractor={(item, index) => item.candidate?.hex ?? index.toString()}
                renderItem={renderVoteHistoryItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        fontWeight: 'bold',
        color: '#343a40',
    },
    error: {
        color: 'red',
        marginVertical: 8,
    },
    subtitle: {
        fontSize: 20,
        marginVertical: 8,
        fontWeight: '600',
        color: '#495057',
    },
    voteCount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ced4da',
    },
    candidate: {
        fontSize: 18,
        color: '#212529',
    },
    count: {
        fontSize: 18,
        color: '#212529',
    },
    historyItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    historyText: {
        fontSize: 16,
        color: '#495057',
    },
    searchBar: {
        height: 40,
        width: '100%',
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
});

export default VoteCountScreen;
