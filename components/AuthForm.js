import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Constants } from '../constants/Theme';
// import { State } from 'react-native-gesture-handler';

function AuthForm({ type, errorMessage, submitButtonText, onSubmit, clearError }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [hasErrors, setErrors] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setLoading(false);
                setErrors(false);
            };
        }, [])
    );

    useEffect(()=> {
        setLoading(false);
    },[errorMessage])

    const submitForm = async () => {
        if (errorMessage) {
            clearError();
        }
        if (hasErrors) {
            setErrors(false);
        }
        switch (type) {
            case 'Signup':
                if (!firstName || !lastName || !email || !password) {
                    setErrors(true);
                    return
                } 
                setLoading(true);
                await onSubmit({ firstName, lastName, email, password });
                break;
            default: 
                if (!email || !password) {
                    setErrors(true);
                    return
                } 
                setLoading(true);
                await onSubmit({ email, password });
                break;
        }
    }

    return (
        <View>
            {type == 'Signup' &&
                <>
                    <View style={{ position: 'relative', paddingBottom: 26}}>
                        <TextInput
                            label="First Name"
                            left={<TextInput.Icon name="account" color={Constants.midGrey}/>}
                            mode="outlined"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCorrect={false}
                        />
                        { hasErrors && !firstName && <Text style={Constants.hasError}>First Name is required</Text>}
                    </View>
                    <View style={{ position: 'relative', paddingBottom: 26, marginVertical: 8}}>
                        <TextInput
                            label="Last Name"
                            left={<TextInput.Icon name="account" color={Constants.midGrey}/>}
                            mode="outlined"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCorrect={false}
                        />
                        { hasErrors && !lastName && <Text style={Constants.hasError}>Last Name is required</Text>}
                    </View>
                </>
            }
            <View style={{ position: 'relative', paddingBottom: 26, marginVertical: 8}}>
                <TextInput
                    label="Email"
                    left={<TextInput.Icon name="email" color={Constants.midGrey}/>}
                    mode="outlined"
                    placeholder="sample@domain.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCompleteType="email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                />
                { hasErrors && !email && <Text style={Constants.hasError}>Email is required</Text>}
            </View>
            <View style={{ position: 'relative', paddingBottom: 26, marginTop: 8}}>
                <TextInput
                    label="Password"
                    left={<TextInput.Icon name="lock" color={Constants.midGrey}/>}
                    mode="outlined"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearTextOnFocus={type !== 'Signup'}
                    secureTextEntry
                />
                { hasErrors && !password && <Text style={Constants.hasError}>Password is required</Text>}
            </View>
            { errorMessage ? <Text style={{ color: Constants.errorText, marginBottom: 16}}>{errorMessage}</Text> : null}
            <Button
                style={Constants.buttonDesign}
                mode="contained"
                color="white"
                onPress={() => !isLoading && submitForm()}      
            >
                { isLoading ? 
                    <ActivityIndicator animating={true} color="white" /> :
                    <Text style={Constants.buttonTextLarge}>{submitButtonText}</Text>
                }
            </Button>
        </View>
    );
}

export default AuthForm;