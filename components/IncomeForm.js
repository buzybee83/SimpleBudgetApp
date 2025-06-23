import React, { useState } from 'react';
import {
    View,
    StyleSheet, 
    TouchableWithoutFeedback, 
    Keyboard, 
    TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaskService } from 'react-native-masked-text';
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, Caption, Text } from 'react-native-paper';
import { Constants } from '../constants/Theme';
import Spacer from '../components/Spacer';
import { IncomeType, constructDaysInMonth, nth } from '../services/utilHelper';

const IncomeForm = ({ onSubmitForm, onDelete, income, settings }) => {
    const { control, handleSubmit, formState, watch } = useForm({
        mode: 'onChange',
        defaultValues: {
            ...income,
            frequency: 'Monthly',
            frequencyType: 'Paycheck',
            expectedDate: income ? new Date(income.expectedDate).getDate().toString() : '',
            frmtAmount: income ? MaskService.toMask('money', (income.amount), {
                unit: '$',
                separator: '.',
                delimiter: ','
            }) : ''
        }
    });
    const watchFrequencyType = watch('frequencyType', 'Paycheck');
    const { errors, isDirty, isSubmitted, isValid, isValidating } = formState;
    const daysInMonth = constructDaysInMonth();

    const onSubmit = (incomeData) => {
        if (isDirty && isValid) {
            if (income && income.incomeId) {
                if (!propagationOptions[propagationSelection]) {
                    return;
                }
            } 
            incomeData.amount = MaskService.toRawValue('money', (incomeData.frmtAmount), {
                separator: '.',
                delimiter: ','
            });
            if (!income && !incomeData.frequencyType == 'Misc/One time') incomeData.isAutomated = false;
            
            onSubmitForm(incomeData, income, propagationOptions[propagationSelection]);
        }
    };

    const [propagationSelection, setPropagationSelection] = useState(null);
    const propagationOptions = [
        { label: "Yes", value: true },
        { label: "No", value: false },
    ];

    const onSelect = (idx) => {
        setPropagationSelection(idx);
    }

    const formatDate = (date) => {
        let fmtDate = new Date(date);
        console.log('fmtDate==', date)
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'full'}).format(fmtDate);
    }

    const getPaydayTitle = (date) => {
        date = new Date(date);
        if (date > new Date()) {
            return 'Expected';
        }
        return 'Recieved';
    }

    const ButtonGroup = () => {
        return (
            <View style={{ flexDirection: 'row', alignContent: 'stretch' }}>
                {propagationOptions.map((option, index) => {
                    const selectedLabelStyle = propagationSelection == index && styles.selectedLabelStyle;
                    const selectedBtnStyle = propagationSelection == index && styles.selectedBtnGroup
                    return (
                        <View style={[styles.btnGroup, selectedBtnStyle]} key={index}>
                            <TouchableWithoutFeedback onPress={() => onSelect(index)}>
                                <Text style={[styles.formLabel, selectedLabelStyle, { textAlign: 'center' }]}>{option.label}</Text>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                })}
            </View>
        );
    }
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.formContainer}>
                <View>
                    <Spacer size={1} />
                    { income &&
                        <>
                            <View style={{ paddingBottom: 4 }}>
                                <Button>{IncomeType[income.incomeType]}</Button>
                            </View>
                            { (!propagationSelection) &&
                                <View>
                                    <Text style={[styles.formLabel, styles.labelCenter]}>Date {getPaydayTitle(income.expectedDate)} </Text>
                                    <Button>{formatDate(income.expectedDate)}</Button>
                                </View>
                            }
                            { income.incomeId &&
                                <View style={{ flexDirection: 'column', paddingBottom: 24, paddingTop: 20  }}>
                                    <Text style={styles.formLabel}> Apply changes to future occurrances? </Text>
                                    <ButtonGroup/>
                                    {isDirty && isSubmitted && !propagationOptions[propagationSelection] &&
                                        <Text style={styles.hasError}>This is required.</Text>
                                    }
                                </View>
                            }
                        </>
                    }
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Description"
                                mode="outlined"
                                onChangeText={value => onChange(value)}
                                value={value}
                            />
                        )}
                        name="description"
                        rules={{ required: true }}
                    />
                    { errors.description && <Text style={styles.hasError}>Description is required.</Text>}
                    { !errors.description && <Spacer size={1} />}
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
                    { errors.frmtAmount && errors.frmtAmount.type == 'required' &&
                        <Text style={styles.hasError}>Amount is required.</Text>
                    }
                    
                    { !income &&
                        <>
                            <View style={styles.fieldContainer}>
                                <View style={{ flex: 2, justifyContent: 'center' }}>
                                    <Text style={[styles.formLabel, { marginTop: 12 }]}>Type of Income </Text>
                                </View>
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Picker
                                            value={value}
                                            type="outlined"
                                            mode="dropdown"
                                            style={styles.pickerContainer}
                                            itemStyle={styles.pickerItem}
                                            selectedValue={value}
                                            onValueChange={value => onChange(value)}
                                        >
                                            <Picker.Item label="Paycheck" value="Paycheck" />
                                            <Picker.Item label="Recurring" value="Recurring" />
                                            <Picker.Item label="Misc/One time" value="Misc/One time" />
                                        </Picker>
                                    )}
                                    name="frequencyType"
                                />
                            </View>
                            {watchFrequencyType == 'Paycheck' &&
                                <Caption style={{marginTop: 30}}>
                                    When selecting "Paycheck", your future payday income will be generated 
                                    based on your pay schedule in your income settings.
                                </Caption>
                            }
                        </>
                    }

                    { !income && watchFrequencyType == 'Recurring' &&
                        <>
                            <View style={styles.fieldContainer}>
                                <View style={{ flex: 2, justifyContent: 'center' }}>
                                    <Text style={[styles.formLabel, { paddingTop: 12 }]}>Frequency</Text>
                                </View>
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Picker
                                            value={value}
                                            type="spinner"
                                            style={styles.pickerContainer}
                                            itemStyle={styles.pickerItem}
                                            selectedValue={value}
                                            onValueChange={value => onChange(value)}
                                        >
                                            <Picker.Item label="Weekly" value="Weekly" />
                                            <Picker.Item label="Bi-Weekly" value="Bi-Weekly" />
                                            <Picker.Item label="Semi-Monthly" value="Semi-Monthly" />
                                            <Picker.Item label="Monthly" value="Monthly" />
                                        </Picker>
                                    )}
                                    name="frequency"
                                />
                            </View>
                        </>
                    }

                    {(!income || propagationSelection == 1 || !income.incomeId) &&
                        <View style={styles.fieldContainer}>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={[styles.formLabel, { paddingTop: 12 }]}>Day Expected</Text>
                            </View>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Picker
                                        value={value}
                                        type="outlined"
                                        style={styles.pickerContainer}
                                        itemStyle={styles.pickerItem}
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
                                name="expectedDate"
                            />
                        </View> 
                    }
                    { errors.expectedDate && <Text style={styles.hasError}>Date Expected is required.</Text>}
                </View>
                <View style={{ paddingTop: 20 }}>
                    <Text style={styles.warningText}>
                        {isSubmitted && !isDirty && !Object.keys(errors).length ? 'No change detected.' :
                            (isSubmitted && Object.keys(errors).length && !isValidating ? 'Please fix fields with errors.' : '')
                        }
                    </Text>

                    <Button
                        mode="contained"
                        dark
                        disabled={isValidating}
                        style={styles.primaryBtn}
                        onPress={handleSubmit(onSubmit)}
                    >
                        {income ? 'Update' : 'Save'}
                    </Button>
                    {onDelete && income &&
                        <Button
                            style={{ marginTop: 6 }}
                            color={Constants.errorText}
                            mode="outlined"
                            onPress={() => onDelete(income)}
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
        flex: 2,
        height: 80, 
        marginBottom: 5,
    },
    pickerItem: {
        // maxHeight: 110
        height: 105
    },
    datePicker: {
        flexGrow: 3,
        height: 120
    },
    formLabel: {
        fontSize: Constants.fontMedium,
        color: Constants.darkGrey
    },
    fieldContainer: {
        display: 'flex',
        marginVertical: 12,
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
    btnGroup: {
        borderColor: Constants.tintColor,
        borderWidth: 1,
        backgroundColor: 'white',
        flex: 2,
        padding: 8,
        marginTop: 16,
        marginBottom: 6
    },
    selectedBtnGroup: {
        backgroundColor: Constants.tintColor
    },
    labelCenter: {
		alignSelf: 'center'
	},
    selectedLabelStyle: {
        color: 'white',
        fontWeight: Constants.fontWeightMedium
    },
    primaryBtn: {
        backgroundColor: Constants.tintColor
    },
    deleteBtn: {
        color: Constants.errorText
    }
});

export default IncomeForm;
// pattern: /^[0-9]+(\.\d{1,2})?$/ 