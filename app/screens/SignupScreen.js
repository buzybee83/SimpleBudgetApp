import React, { useContext, useEffect } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Keyboard, Platform, View } from 'react-native';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Card, Text } from 'react-native-paper';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import NavLink from '../components/NavLink';
import WaveShape from '../components/WaveShape';

const SignupScreen = ({ navigation }) => {
    const { state, signup, clearErrorMessage } = useContext(AuthContext);
   
    useFocusEffect(
        React.useCallback(() => {
            if (state.errorMessage) return clearErrorMessage();
            return;
        }, [])
    );

    useEffect(() => {
        if (state.route && state.route !== 'Auth') {
            navigation.dispatch(
                StackActions.replace('Main', {screen: state.route})
            );
        }
    }, [state.route]);
    
    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                enableResetScrollToCoords={false}
                bounces={false}
                contentInsetAdjustmentBehavior="always"
                overScrollMode="always"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                showsVerticalScrollIndicator={true}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Text style={styles.header}> Let's Get Started! </Text>
                        <Card style={[Constants.boxShadow, { padding: 4 }]}>
                            <Card.Title titleStyle={{ textAlign: 'center' }} title="Creat a Free Account" />
                            <Card.Content>
                                <AuthForm
                                    type="Signup"
                                    errorMessage={state.errorMessage}
                                    submitButtonText="Signup"
                                    onSubmit={signup}
                                    clearError={clearErrorMessage}
                                />
                            </Card.Content>
                            <Card.Actions style={{ flexDirection: 'column'}}>
                                <NavLink routeName="Login" text="Already have an account?" />
                            </Card.Actions>
                        </Card>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
            <WaveShape style={{ position: "absolute" , bottom: 0, zIndex: 1 }} opacity="0.5" path="pathBottom" view="49 -3.8 650 19" fill="#9966ff" />
            <WaveShape style={{ position: "absolute" , bottom: 0, zIndex: 1 }} opacity="0.6" path="pathBottom" view="50 -3.3 650 18" fill="#9966ff" />
        </View>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...DarkTheme
    },
    header: {
        fontSize: 30,
        alignSelf: "center",
        color: '#fff',
        marginVertical: 30
    }
});

export default SignupScreen;
