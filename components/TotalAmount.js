import React, { useState, useEffect } from 'react';
import { Text } from 'react-native-elements';

const TotalAmount = ({ items, value, fieldKey, alignment, textStyle, color, heading, calculateAmount }) => {
    const [total, setTotal] = useState(0.00);

    useEffect(() => {
        if (calculateAmount) {
           calcTotalAmount();
        } else formatAmount();
    },[items, value]);

    const calcTotalAmount = () => {
        const sum = items && items.length ? items.reduce((a, b) => a + (b[fieldKey] || 0), 0) : 0;
        setTotal(sum.toLocaleString("en-US",{style: "currency", currency: "USD"}) );
    }

    const formatAmount = () => {
        if (value !== undefined) setTotal(value.toLocaleString("en-US",{style: "currency", currency: "USD"}) );
    }

    if (heading) {
        return (
            <>
                <Text h3 style={[{ textAlign: alignment, color: color }, textStyle]}>{ total }</Text>
            </>
        );
    } else {
        return (
            <>
                <Text style={[{ textAlign: alignment, color: color }, textStyle]}>{ total }</Text>
            </>
        );
    }
    
}

export default TotalAmount;




