import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useElection } from '../../helper/ElectionContext';

const VoteTabScreen = () => {
    // const [candidates, setCandidates] = useState<any[]>([]);
    const { candidates, updateCandidates } = useElection();
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        // const fetchCandidates = async () => {
        //     try {
        //         const response = await fetch('http://192.168.0.107:3000/candidates');
        //         const data = await response.json();
        //         setCandidates(data.candidates);
        //     } catch (error) {
        //         console.error('Error fetching candidates:', error);
        //     }
        // };

        const checkVoteStatus = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User ID not found');
                }

                const response = await fetch(`http://192.168.0.107:3000/voteStatus/${userId}`);
                const data = await response.json();
                setHasVoted(data.hasVoted);
            } catch (error) {
                console.error('Error checking vote status:', error);
            }
        };

        //fetchCandidates();
        checkVoteStatus();
    }, []);

    const handleVote = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await fetch('http://192.168.0.107:3000/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    voterId: userId,
                    candidateId: selectedCandidateId,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to vote');
            }

            setHasVoted(true);
            setModalVisible(false);
            Alert.alert('Success', 'Vote submitted successfully');
            updateCandidates();
        } catch (error: any) {
            const errorMessage = error.message || 'Something went wrong';
            Alert.alert('Error', errorMessage);
        }
    };

    const renderCandidateItem = ({ item }: { item: any }) => {
        const id = parseInt(item.id.hex, 16);
        const name = item.name;

        return (
            <TouchableOpacity
                style={[styles.candidateItem, id.toString() === selectedCandidateId ? styles.selectedCandidate : null]}
                onPress={() => {
                    setSelectedCandidateId(id.toString());
                    setModalVisible(true);
                }}
                disabled={hasVoted}
            >
                <Text>ID: {id}</Text>
                <Text>Name: {name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vote for a Candidate</Text>
            <FlatList
                data={candidates}
                renderItem={renderCandidateItem}
                keyExtractor={(item) => item.id.hex}
                contentContainerStyle={styles.listContainer}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text>Enter Password to Vote</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                        />
                        <Button title="Submit Vote" onPress={handleVote} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            {hasVoted && <Text style={styles.voteStatus}>You have already voted.</Text>}
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
    selectedCandidate: {
        backgroundColor: '#b0e57c', // Example of selected candidate color
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 8,
        width: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    voteStatus: {
        marginTop: 20,
        fontSize: 18,
        color: 'green',
    },
});

export default VoteTabScreen;
