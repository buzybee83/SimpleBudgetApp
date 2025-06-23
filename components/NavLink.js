import React from 'react';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Constants } from '../constants/Theme';

function NavLink({ navigation, routeName, text }) {
    navigation = useNavigation();
    return (
        <>
            <Text style={{ textAlign: "center"}}>{text}</Text>
            <Button
                color={Constants.linksColor}
                style={Constants.buttonLinkDesign}
                type="clear"
                mode="text"
                title={routeName} 
                onPress={() => navigation.navigate(routeName)}
            >
                {routeName} 
            </Button>
        </>
    )
}

export default NavLink;