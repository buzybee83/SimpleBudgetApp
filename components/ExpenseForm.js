import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller } from "react-hook-form";
import { MaskService } from 'react-native-masked-text';
import { TextInput, Switch, Button, Text } from 'react-native-paper';
import { Constants } from '../constants/Theme';
import Spacer from '../components/Spacer';
import { constructDaysInMonth, nth } from '../services/utilHelper';

const ExpenseForm = ({ onSubmitForm, onDelete, expense }) => {
    const { control, handleSubmit, formState } = useForm({
        mode: 'onChange',
        defaultValues: {
            ...expense,
            isRecurring: expense ? expense.frequency.isRecurring : true,
            recurringType: expense ? expense.frequency.recurringType : 'Monthly',
            dueDay: expense ? new Date(expense.dueDay).getDate().toString() : '',
            frmtAmount: expense ? MaskService.toMask('money', (expense.amount), {
                unit: '$',
                separator: '.',
                delimiter: ','
            }) : ''
        }
    });
    const [canShowRecurringField, setCanShowRecurringField] = useState((expense ? false : true));
    const daysInMonth = constructDaysInMonth();
    const { errors, isDirty, isSubmitted, isTouched, isValid, isValidating } = formState;
    const onSubmit = (data) => {
        if (isDirty && isValid) {
            data.amount = MaskService.toRawValue('money', (data.frmtAmount), {
                separator: '.',
                delimiter: ','
            });
            onSubmitForm(data, expense);
        }
    };
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.formContainer}>
                <View>
                    <Spacer size={1} />
                    <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Description"
                                mode="outlined"
                                onChangeText={value => onChange(value)}
                                value={value}
                            />
                        )}
                        name="name"
                        rules={{ required: true }}
                    />
                    {errors.name && <Text style={styles.hasError}>Description is required.</Text>}
                    {!errors.name && <Spacer size={1} />}
                    <Controller
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Amount"
                                mode="outlined"
                                keyboardType="numeric"
                                onChangeText={value => value ? onChange(MaskService.toMask('money', (value), {
                                    unit: '$',
                                    separator: '.',
                                    delimiter: ','
                                })) : onChange(value)}
                                value={value ? MaskService.toMask('money', (value), {
                                    unit: '$',
                                    separator: '.',
                                    delimiter: ','
                                }) : ''}
                            />
                        )}
                        rules={{ required: true }}
                        name="frmtAmount"
                    />
                    {errors.frmtAmount && errors.frmtAmount.type == 'required' &&
                        <Text style={styles.hasError}>Amount is required.</Text>
                    }
                   
                    <View style={styles.fieldContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={[styles.formLabel, { marginTop: 32 }]}> Due Day</Text>
                        </View>
                        <Controller
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Picker
                                    value={value}
                                    type="outlined"
                                    itemStyle={styles.pickerItem}
                                    style={styles.pickerContainer}
                                    selectedValue={value}
                                    onValueChange={value => onChange(value)}
                                >
                                    <Picker.Item label="Select day..." value="" />
                                    {Object.keys(daysInMonth).map((key) => {
                                        return (
                                            <Picker.Item 
                                                key={key} 
                                                label={daysInMonth[key]+(nth(parseInt(daysInMonth[key])))} 
                                                value={daysInMonth[key]} 
                                            />
                                        )
                                    })}
                                </Picker>
                            )}
                            rules={{ required: true }}
                            name="dueDay"
                        />
                    </View>
                    {errors.dueDay && <Text style={styles.hasError}>Due Day is required.</Text>}
                    { !expense &&
                        <View style={[styles.fieldContainer, { paddingTop: 30 }]}>
                            <Text style={[styles.formLabel, { flex: 2 }]}> Recurring Expense </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Switch
                                        containerStyle={{ flex: 2, paddingRight: 24 }}
                                        style={{ marginRight: '2%' }}
                                        value={value}
                                        color={Constants.tintColor}
                                        mode="outlined"
                                        onValueChange={value => {
                                            setCanShowRecurringField(value)
                                            onChange(value)
                                        }}
                                    />
                                )}
                                name="isRecurring"
                                defaultValue={expense ? expense.frequency.isRecurring : true}
                            />
                        </View>
                    }
                    {canShowRecurringField &&
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 2 }}>
                                <Text style={[styles.formLabel, { marginTop: 32 }]}> Select Frequency </Text>
                            </View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Picker
                                        value={value}
                                        type="outlined"
                                        style={[styles.pickerContainer]}
                                        itemStyle={styles.pickerItem}
                                        selectedValue={value}
                                        onValueChange={value => onChange(value)}
                                    >
                                        <Picker.Item label="Weekly" value="Weekly" />
                                        <Picker.Item label="Bi-Weekly" value="Bi-Weekly" />
                                        <Picker.Item label="Monthly" value="Monthly" />
                                        <Picker.Item label="Bi-Monthly" value="Bi-Monthly" />
                                    </Picker>
                                )}
                                name="recurringType"
                                defaultValue={expense ? expense.frequency.recurringType : "Monthly"}
                            />
                        </View>
                    }
                </View>
                <View style={{ paddingTop: 20 }}>
                    <Text style={styles.warningText}>
                        {isSubmitted && !isDirty && !isTouched && !Object.keys(errors).length ? 'No change detected.' :
                            (isSubmitted && Object.keys(errors).length && !isValidating ? 'Please fix fields with errors.' : '')
                        }
                    </Text>

                    <Button
                        mode="contained"
                        dark
                        style={styles.primaryBtn}
                        onPress={handleSubmit(onSubmit)}
                    >
                        {expense ? 'Update' : 'Save'}
                    </Button>
                    {onDelete && expense &&
                        <Button
                            style={{ marginTop: 6 }}
                            color={Constants.errorText}
                            mode="outlined"
                            onPress={() => onDelete(expense._id)}
                            TouchableComponent={TouchableOpacity}
                        >
                            Delete
                        </Button>
                    }
                </View>
            </View>

        </TouchableWithoutFeedback>
    );
}
const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 50
    },
    pickerContainer: {
        height: 60,
        width: '50%',
        alignContent: 'flex-end'
    },
    pickerItem: {
        height: 94
    },
    formLabel: {
        fontSize: Constants.fontMedium,
        color: Constants.darkGrey
    },
    fieldContainer: {
        display: 'flex',
        paddingTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    hasError: {
        fontSize: Constants.fontSmall,
        color: Constants.errorText,
        marginVertical: 8
    },
    warningText: {
        fontSize: Constants.fontSmall,
        color: Constants.errorText,
        paddingVertical: 6
    },
    primaryBtn: {
        backgroundColor: Constants.tintColor
    },
    deleteBtn: {
        color: Constants.errorText
    }
});

export default ExpenseForm;

