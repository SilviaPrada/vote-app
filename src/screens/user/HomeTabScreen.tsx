import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { useElection } from '../../helper/ElectionContext';
import PieChartComponent from '../../component/PieChart';

const HomeTabScreen = () => {
    const { candidates } = useElection();
    const { width, height } = Dimensions.get('window');

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
    const chartData = candidates.map((candidate, index) => ({
        name: '% ' + candidate.name,
        population: totalVotes ? (parseInt(candidate.voteCount.hex, 16) / totalVotes) * 100 : 0,
        color: ["#96c31f", "#f5a623", "#f05656", "#50e3c2", "#4a90e2"][index % 5],
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    }));

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Candidate List</Text>
            <FlatList
                data={candidates}
                renderItem={renderCandidateItem}
                keyExtractor={(item, index) => `${item.id.hex}-${index}`}
                contentContainerStyle={styles.listContainer}
                ListFooterComponent={
                    <>
                        <Text style={styles.title}>Vote Counting Results</Text>
                        <PieChartComponent data={chartData} />
                    </>
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
});

export default HomeTabScreen;
