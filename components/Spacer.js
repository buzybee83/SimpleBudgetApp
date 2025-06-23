import * as React from 'react';
import { StyleSheet, View } from 'react-native';

let marginSize = 16;

function Spacer({ children, size }) {
    marginSize = size;
    return (
        <View style={styles.spacerContainer}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    spacerContainer: {
        margin: marginSize
    }
})

export default Spacer;