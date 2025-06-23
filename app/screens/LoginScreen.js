import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet, Text, View, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { Card, Avatar } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { useHeaderHeight } from '@react-navigation/elements';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import NavLink from '../components/NavLink';
import Spacer from '../components/Spacer';
import WaveShape from '../components/WaveShape';

const LoginScreen = ({ navigation }) => {
    const [doneLoading, setDoneLoading] = useState(false)
    const { state, login, clearErrorMessage } = useContext(AuthContext);
    // const headerHeight = useHeaderHeight();

    useFocusEffect(
        React.useCallback(() => {
            if (state.errorMessage) clearErrorMessage();
        }, [])
    );
    
    useEffect(() => {
        if (state.errorMessage) clearErrorMessage();
        if (state.route && state.route !== 'Auth') {
            navigation.dispatch(
                StackActions.replace(`${state.route}`)
            );
        } else {
            setDoneLoading(true);
        }
    }, [state.route]);

    if (!doneLoading) return null

    return (
        <View style={styles.container}>
            <WaveShape style={{ position: "absolute" , top: 0, zIndex: 1 }} opacity="0.55" path="pathTop" view="-1 5 350 750" fill="#9966ff" />
            <KeyboardAwareScrollView
                contentContainerStyle={styles.content}
                enableOnAndroid={true}
                enableResetScrollToCoords={false}
                bounces={false}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <Text style={styles.header}> WELCOME </Text>
                        <Card style={[Constants.boxShadow, { padding: 4 }]}>
                            <Card.Content>
                                <Avatar.Image 
                                    style={{ marginBottom: 8, alignSelf: 'center', backgroundColor: '#fff' }} 
                                    size={68} 
                                    source={require('../assets/images/icon.png')} />
                                <AuthForm
                                    errorMessage={state.errorMessage}
                                    submitButtonText="Login"
                                    clearError={clearErrorMessage}
                                    onSubmit={login}
                                />
                            </Card.Content>
                            <Card.Actions style={{ flexDirection: 'column'}}>
                                <NavLink routeName="Signup" text="Don't have an account?" />
                            </Card.Actions>
                        </Card> 
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        position: 'relative',
        flex: 1,
        alignContent: 'stretch',
        justifyContent: 'center',
        ...DarkTheme
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'space-around',
    },
    header: {
        fontSize: 30,
        height: 100,
        marginTop: -80,
        alignSelf: 'center',
        color: '#fff',
    }
});

export default LoginScreen;
