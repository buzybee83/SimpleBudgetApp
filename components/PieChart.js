import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { PieChart as Pie } from 'react-native-svg-charts';
import { Text as TextSvg } from 'react-native-svg';
import { Constants } from '../constants/Theme';

const PieChart = ({ pieData, defaultSelection }) => {
    const [selectedSlice, setSelectedSlice] = useState({label: null});
    const [pieSlices, setPieSlices] = useState([]);
    const [inProgress, setInProgress] = useState(true);
    useEffect(() => {
        setInProgress(true);
        if (pieData) {
            const slices = constructSlicesFromData();
            setPieSlices(slices);
            if (defaultSelection) {
                const selection = slices.find(dt => dt.label == defaultSelection);
                if (selection) {
                    setSelectedSlice({
                        label: selection.label, 
                        value: selection.rawValue ? selection.rawValue : selection.value
                    });
                }
            }
            setInProgress(false);
        } 
        
    },[pieData]);

    useEffect(() => {
        if (pieSlices.length) {
            const slices = pieSlices.map(slice => {
                slice.arc = {
                    outerRadius: selectedSlice.label === slice.label ? '100%' : '95%', 
                    padAngle: selectedSlice.label === slice.label ? 0.06 : 0.01
                };
                return slice;
            });
            setPieSlices(slices);
        }
    },[selectedSlice.label]);

    const constructSlicesFromData = () => {
        return [{
            key: 1,
            label: 'Expenses',
            value: pieData.totalExpenses,
            onPress: () => setSelectedSlice({ 
                label: 'Expenses', 
                value: pieData.totalExpenses
            }),
            svg: { fill: '#cc0066' },
            arc: { 
                outerRadius: selectedSlice.label === 'Expenses' ? '100%' : '95%', 
                padAngle: selectedSlice.label === 'Expenses' ? 0.06 : 0.01
            }
        }, {
            key: 2,
            label: 'Total Paid',
            value: pieData.expensesPaidToDate,
            onPress: () => setSelectedSlice({ 
                label: 'Total Paid', 
                value: pieData.expensesPaidToDate
            }),
            svg: { fill: '#0066ff' },
            arc: { 
                outerRadius: selectedSlice.label === 'Total Paid' ? '100%' : '95%', 
                padAngle: selectedSlice.label === 'Total Paid' ? 0.06 : 0.01
            }
        }, {
            key: 3,
            label: 'Unpaid',
            value: pieData.totalExpenses - pieData.expensesPaidToDate,
            onPress: () => setSelectedSlice({ 
                label: 'Unpaid', 
                value: pieData.totalExpenses - pieData.expensesPaidToDate
            }),
            svg: { fill: '#9797ac' },
            arc: { 
                outerRadius: selectedSlice.label === 'Unpaid' ? '100%' : '95%', 
                padAngle: selectedSlice.label === 'Unpaid' ? 0.06 : 0.01
            }
        }, {
            key: 4,
            label: 'Balance',
            value: pieData.balance < 0 ? pieData.balance * -1 : pieData.balance,
            rawValue: pieData.balance,
            onPress: () => setSelectedSlice({ 
                label: 'Balance', 
                value: pieData.balance
            }),
            svg: { fill: '#9900cc' },
            arc: { 
                outerRadius: selectedSlice.label === 'Balance' ? '100%' : '95%', 
                padAngle: selectedSlice.label === 'Balance' ? 0.06 : 0.01
            }
        }, {
            key: 5,
            label: 'Income',
            value: pieData.totalIncome,
            onPress: () => setSelectedSlice({ 
                label: 'Income', 
                value: pieData.totalIncome
            }),
            svg: { fill: '#33cc00' },
            arc: { 
                outerRadius: selectedSlice.label === 'Income' ? '100%' : '95%', 
                padAngle: selectedSlice.label === 'Income' ? 0.06 : 0.01
            }
        }];
    }

    const Labels = ({ slices, height, width }) => {
        return slices.map((slice, index) => {
            const { labelCentroid, pieCentroid, data } = slice;
            return (
                <TextSvg
                    key={index}
                    x={pieCentroid[0]}
                    y={pieCentroid[1]}
                    fill={'white'}
                    textAnchor={'middle'}
                    alignmentBaseline={'middle'}
                    fontSize={12}
                    stroke={'white'}
                    strokeWidth={0.3}
                >
                    {data.rawValue ? `${data.rawValue.toLocaleString("en-US",{
                        style: "currency", 
                        currency: "USD", 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })}` :
                    data.value ? `${data.value.toLocaleString("en-US",{
                        style: "currency", 
                        currency: "USD", 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })}` : ''} 
                </TextSvg>
            )
        });
    }
    
    if (inProgress) {
        return (
            <View style={{ height: 255 }}>
                <ActivityIndicator animating={true} style={{ flex: 1, paddingVertical: 60 }}/>
            </View>
        );
    } else {
        return (
            <View style={{ marginBottom: -35 }}>
                {!inProgress && <>
                    <Pie
                        style={[{ height: 285 }, Constants.boxShadowLight ]}
                        valueAccessor={({ item }) => item.value}
                        data={pieSlices}
                        spacing={0}
                        innerRadius={'40%'}
                        outerRadius={'95%'}
                    >
                        <Labels/>
                    </Pie>
                    <Text
                        style={styles.pieCenterText}>
                        {`${selectedSlice.label} \n${selectedSlice.value.toLocaleString("en-US",{
                                style: "currency", 
                                currency: "USD", 
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            })}`
                        }
                    </Text>
                </>}
            </View>
        )
    }
};

export default PieChart;

const styles = StyleSheet.create({
	pieCenterText: {
		fontWeight: Constants.fontWeightMedium,
        color: Constants.whiteColor, 
        fontSize: Constants.fontLarge,
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        margin: 'auto',
        textAlign: 'center'
	}
});