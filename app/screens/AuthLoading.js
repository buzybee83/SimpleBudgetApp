import React, { useEffect, useContext} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { Context as AuthContext } from '../context/AuthContext';
import { Constants } from '../constants/Theme';

export default function AuthLoading({ navigation }) {
    const { state, bootstrapAuthAsync } = useContext(AuthContext);

    useFocusEffect(
        React.useCallback(() => {
            const initialize = async () => {
                await bootstrapAuthAsync();
            }
            initialize();
        },[])
   );

   useEffect(() => {
        if (state.route) {
            navigation.replace('Main', {screen: state.route})
        }
    },[state.route]);
    
    return (
        <View style={{backgroundColor: Constants.darkGrey, alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <ActivityIndicator color={Constants.whiteColor}/>
            <Text style={{color: Constants.whiteColor}}>Loading...</Text>
        </View>
    );
};