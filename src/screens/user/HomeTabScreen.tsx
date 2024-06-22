import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useElection } from '../../helper/ElectionContext';
import { PieChart } from 'react-native-chart-kit';

const HomeTabScreen = () => {
    const { candidates } = useElection();

    const renderCandidateItem = ({ item }: { item: any }) => {
        const id = parseInt(item.id.hex, 16);
        const name = item.name;
        const visi = item.visi;
        const misi = item.misi;
        const voteCount = parseInt(item.voteCount.hex, 16);

        return (
            <View style={styles.candidateItem}>
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
    const chartData = candidates.map(candidate => ({
        name: '% ' + candidate.name,
        population: (parseInt(candidate.voteCount.hex, 16) / totalVotes) * 100,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color for each candidate
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Candidate List</Text>
            <FlatList
                data={candidates}
                renderItem={renderCandidateItem}
                keyExtractor={(item, index) => `${item.id.hex}-${index}`}
                contentContainerStyle={styles.listContainer}
                ListFooterComponent={
                    <><Text style={styles.title}>Vote Counting Results</Text><PieChart
                        data={chartData}
                        width={400} // from react-native
                        height={220}
                        chartConfig={{
                            backgroundColor: '#e26a00',
                            backgroundGradientFrom: '#fb8c00',
                            backgroundGradientTo: '#ffa726',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16
                            }
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute /></>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
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
        backgroundColor: 'rgba(242, 203, 168, 0.7)', // Slightly transparent background
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        marginTop: 13,
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
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        color: '#000',
        textAlign: 'center',
    },
    candidateDetails: {
        marginBottom: 8,
    },
    candidateDetailTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EC8638',
    },
    candidateVisi: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#000',
        textAlign: 'center',
    },
    candidateMisi: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#000',
    },
    voteCount: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
});

export default HomeTabScreen;
