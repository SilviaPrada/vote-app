import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import ValidVoterScreen from './ValidVoter';
import VoterHistoryScreen from './VoterHistory';

const VoterScreen = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'validVoter' | 'voterHistory'>('validVoter');

    const handleViewChange = (view: 'validVoter' | 'voterHistory') => {
        setCurrentView(view);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => handleViewChange('validVoter')} style={currentView === 'validVoter' ? styles.activeTab : styles.inactiveTab}>
                <Text style={styles.tabText}>Valid Voters</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleViewChange('voterHistory')} style={currentView === 'voterHistory' ? styles.activeTab : styles.inactiveTab}>
                <Text style={styles.tabText}>Voter History</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            <View style={styles.list}>
                {currentView === 'validVoter' ? <ValidVoterScreen /> : <VoterHistoryScreen />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    list: {
        flex: 1,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#EC8638',
    },
    inactiveTab: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(242, 203, 168, 0.7)',
    },
    tabText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#EC8638',
    },
});

export default VoterScreen;
