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

        const checkVoteStatus = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User ID not found');
                }

                const response = await fetch(`http://192.168.0.103:3000/voteStatus/${userId}`);
                const data = await response.json();
                setHasVoted(data.hasVoted);
            } catch (error) {
                console.error('Error checking vote status:', error);
            }
        };

        checkVoteStatus();
    }, []);

    const handleVote = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                throw new Error('User ID not found');
            }

            const response = await fetch('http://192.168.0.103:3000/vote', {
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
                <View style={styles.candidateIdCircle}>
                    <Text style={styles.candidateId}>{id}</Text>
                </View>
                <Text style={styles.candidateName}>{name}</Text>
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
                numColumns={2}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Password to Vote</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleVote}>
                                <Text style={styles.buttonText}>Submit Vote</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
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
        backgroundColor: '#d9d9d9', // Slightly transparent background
        padding: 20,
        width: '46%',
        marginLeft: 8,
        marginRight: 8,
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
    selectedCandidate: {
        backgroundColor: 'rgba(242, 203, 168, 0.7)', // Example of selected candidate color
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
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
        marginBottom: 20,
        fontSize: 20,
        color: 'red',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    submitButton: {
        backgroundColor: '#EC8638',
    },
    cancelButton: {
        backgroundColor: '#d3d3d3',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalTitle: {
        color: '#EC8638',
        fontWeight: 'bold',
        fontSize: 17,
    }
});

export default VoteTabScreen;
