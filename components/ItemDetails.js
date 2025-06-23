import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
// import { Text } from 'react-native-elements';
import { Text, Button } from 'react-native-paper';
import { Constants } from '../constants/Theme';
// import Spacer from '../components/Spacer';
// import { nth } from '../services/utilHelper';


const ItemDetails = ({ item, onEdit }) => {

    const handleEdit = () => {
        onEdit(item);
    }

    return (
        <View style={styles.fieldContainer}>
            <Text>{item.name}</Text>
            <Button
                dark
                style={styles.primaryBtn}
                onPress={handleEdit}
            >
                Edit
            </Button>   
        </View>   
        
    );
}
const styles = StyleSheet.create({
    fieldContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemLabel: {
        fontSize: Constants.fontMedium,
        color: Constants.darkGrey
    },
    primaryBtn: {
        color: Constants.tintColor
    },
    deleteBtn: {
        color: Constants.errorText
    }
});

export default ItemDetails;

// budgetId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Budget',
//     required: true
// },
// monthtId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Month',
//     required: true
// },
// name: {
//     type: String,
//     required: true,
// },
// dueDay: {
//     type: Number,
//     required: true
// },
// amount: {
//     type: Number,
//     required: true,
// },
// paycheckTag: String,
// frequency: {
//     isRecurring: {
//         type: Boolean,
//         default: true
//     },
//     recurringType: {
//         type: Number,
//         default: 1
//     }
// },
// status: {
//     type: String,
//     default: 'A'
// },
// isPaid: {
//     type: Boolean,
//     default: false
// },
// split: {
//     type: Boolean,
//     default: false
// }



