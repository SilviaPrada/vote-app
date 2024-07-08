import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, SafeAreaView, TextInput } from 'react-native';
import { useElection } from '../../helper/ElectionContext';
import PieChartComponent from '../../component/PieChart';
import { BigNumber } from '@ethersproject/bignumber';
import axios from 'axios';
import { API_URL } from '@env';
import { VoteHistoryItem } from '../../types/app';

const HomeTabScreen = () => {
    const { candidates } = useElection();
    const { width, height } = Dimensions.get('window');
    const [searchText, setSearchText] = useState('');
    const [voteHistories, setVoteHistories] = useState<VoteHistory[]>([]);
    const [filteredHistories, setFilteredHistories] = useState<VoteHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    interface VoteHistory {
        key: string;
        candidate: VoteHistoryItem;
        count: VoteHistoryItem;
        timestamp: VoteHistoryItem;
    }

    const renderCandidateItem = ({ item }: { item: any }) => {
        const id = parseInt(item.id.hex, 16);
        const name = item.name;
        const visi = item.visi;
        const misi = item.misi;
        const voteCount = parseInt(item.voteCount.hex, 16);

        return (
            <View style={styles.candidateItem} key={`${item.id.hex}-${name}`}>
                <View style={styles.candidateIdCircle}>
                    <Text style={styles.candidateId}>{id}</Text>
                </View>
                <Text style={styles.candidateName}>{name}</Text>
                <View style={styles.candidateDetails}>
                    <Text style={styles.candidateDetailTitle}>Vision</Text>
                    <Text style={styles.candidateVisi}>{visi}</Text>
                    <Text style={styles.candidateDetailTitle}>Mision</Text>
                    <Text style={styles.candidateMisi}>{misi}</Text>
                </View>
                <Text style={styles.voteCount}>Votes: {voteCount}</Text>
            </View>
        );
    };

    const totalVotes = candidates.reduce((sum, candidate) => sum + parseInt(candidate.voteCount.hex, 16), 0);
    const chartData = candidates.map((candidate, index) => ({
        name: '% ' + candidate.name,
        population: totalVotes ? (parseInt(candidate.voteCount.hex, 16) / totalVotes) * 100 : 0,
        color: ["#96c31f", "#f5a623", "#f05656", "#50e3c2", "#4a90e2"][index % 5],
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
        key: `chart-${candidate.name}-${index}`
    }));

    const fetchVoteHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            setVoteHistories([]);
            const response = await axios.get<VoteHistoryItem[][]>(`${API_URL}/all-vote-count-histories`);
            console.log('Vote Histories:', response.data);
            const formattedHistories = response.data.map((item, index) => ({
                candidate: item[0],
                count: item[1],
                timestamp: item[2],
                key: `history-${index}`
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
        fetchVoteHistories();
    }, []);

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

    const renderVoteHistoryItem = ({ item }: { item: VoteHistory }) => (
        <View style={styles.historyItem} key={item.key}>
            <Text style={styles.historyText}>Candidate: {item.candidate ? BigNumber.from(item.candidate.hex).toString() : 'N/A'}</Text>
            <Text style={styles.historyText}>Count: {item.count ? BigNumber.from(item.count.hex).toString() : 'N/A'}</Text>
            <Text style={styles.historyText}>Timestamp: {item.timestamp ? formatDateTime(item.timestamp.hex) : 'Invalid date'}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[]}
                renderItem={null}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Candidate List</Text>
                        <FlatList
                            data={candidates}
                            renderItem={renderCandidateItem}
                            keyExtractor={(item, index) => `${item.id.hex}-${index}`}
                            contentContainerStyle={styles.listContainer}
                        />
                        <Text style={styles.title}>Vote Counting Results</Text>
                        <PieChartComponent data={chartData} />
                        <View style={styles.voteHistoryContainer}>
                            <TextInput
                                style={styles.searchBar}
                                placeholder="Search by candidate ID"
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                        </View>
                    </>
                }
                ListFooterComponent={
                    <FlatList
                        data={filteredHistories}
                        keyExtractor={(item) => item.key}
                        renderItem={renderVoteHistoryItem}
                        contentContainerStyle={styles.listContent}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10,
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 6,
        marginTop: 20,
        color: '#EC8638',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContainer: {
        flexGrow: 1,
        width: '100%',
        paddingHorizontal: 16,
    },
    candidateItem: {
        backgroundColor: '#FAECE0', // Slightly transparent background
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        marginTop: 13,
        marginLeft: 10,
        position: 'relative', // Ensure the absolute positioning of the circle works within this container
    },
    candidateIdCircle: {
        position: 'absolute',
        top: -10,
        left: -10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EC8638',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    candidateId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    candidateName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#000',
        textAlign: 'center',
    },
    candidateDetails: {
        marginBottom: 8,
    },
    candidateDetailTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EC8638',
        marginBottom: 3,
    },
    candidateVisi: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#000',
        textAlign: 'center',
    },
    candidateMisi: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#000',
    },
    voteCount: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
    historyItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        width: Dimensions.get('window').width - 32,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EC8638',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginVertical: 4,
    },
    historyText: {
        fontSize: 13,
        color: '#495057',
    },
    searchBar: {
        height: 40,
        width: Dimensions.get('window').width - 32,
        borderColor: '#EC8638',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
    listContent: {
        width: '100%',
        paddingBottom: 16,
    },
    voteHistoryContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        height: 40,
    },
});

export default HomeTabScreen;
