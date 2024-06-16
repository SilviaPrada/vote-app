import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useElection } from '../../helper/ElectionContext';

const HomeTabScreen = () => {
    // const [candidates, useElection()] = useState<any[]>([]);
    const { candidates } = useElection();

    // useEffect(() => {
    //     const fetchCandidates = async () => {
    //         try {
    //             const response = await fetch('http://192.168.0.107:3000/candidates');
    //             const data = await response.json();
    //             setCandidates(data.candidates);
    //         } catch (error) {
    //             console.error('Error fetching candidates:', error);
    //         }
    //     };

    //     fetchCandidates();
    // }, []);

    const renderCandidateItem = ({ item }: { item: any }) => {
        // Assuming item structure is consistent with the provided example
        const id = parseInt(item.id.hex, 16);
        const name = item.name;
        const visi = item.visi;
        const misi = item.misi;
        const voteCount = parseInt(item.voteCount.hex, 16);

        return (
            <View style={styles.candidateItem}>
                <Text>ID: {id}</Text>
                <Text>Name: {name}</Text>
                <Text>Visi: {visi}</Text>
                <Text>Misi: {misi}</Text>
                <Text>Vote Count: {voteCount}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Candidate List</Text>
            <FlatList
                data={candidates}
                renderItem={renderCandidateItem}
                keyExtractor={(item, index) => `${item.id.hex}-${index}`}
                contentContainerStyle={styles.listContainer}
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
    },
    listContainer: {
        flexGrow: 1,
        width: '100%',
        paddingHorizontal: 16,
    },
    candidateItem: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        marginVertical: 8,
        borderRadius: 8,
    },
});

export default HomeTabScreen;
