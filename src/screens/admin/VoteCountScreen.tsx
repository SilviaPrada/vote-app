import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator } from 'react-native';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            // Adapt the response structure if necessary
            setVoteHistories(response.data.map(item => ({
                candidate: item[0],
                count: item[1],
                timestamp: item[2],
            })));
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
            <Text style={styles.candidate}>{item.id?.hex ?? 'N/A'}</Text>
            <Text style={styles.count}>{item.voteCount?.hex ?? 'N/A'} votes</Text>
        </View>
    );

    const renderVoteHistoryItem = ({ item }: { item: VoteHistory }) => (
        <View style={styles.historyItem}>
            <Text style={styles.historyText}>Candidate: {item.candidate?.hex ?? 'N/A'}</Text>
            <Text style={styles.historyText}>Count: {item.count?.hex ?? 'N/A'}</Text>
            <Text style={styles.historyText}>Timestamp: {item.timestamp ? formatDateTime(item.timestamp.hex) : 'Invalid date'}</Text>
        </View>
    );

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
            <FlatList
                data={voteHistories}
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
    subtitle: {
        fontSize: 20,
        marginBottom: 8,
    },
    voteCount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    candidate: {
        fontSize: 18,
    },
    count: {
        fontSize: 18,
    },
    historyItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    historyText: {
        fontSize: 16,
    },
});

export default VoteCountScreen;
