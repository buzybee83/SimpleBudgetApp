import React, { useEffect, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { Constants } from '../constants/Theme';
import { Context as BudgetContext } from '../context/BudgetContext';

export default function MonthDetailScreen({ route, navigation }) {
    const { state } = useContext(BudgetContext);
    const { _id }  = route.params;
    const monthDetails = state.budget.monthlyBudget.find(m => m._id === _id);
    
    
    return (
        <>
            <View style={styles.container}>
                <Text style={styles.titleText}>{monthDetails.month.name}</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleText: {
        fontSize: 18,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
    }
});
