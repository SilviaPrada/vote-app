import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CandidateScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Candidate Screen</Text>
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
});

export default CandidateScreen;
