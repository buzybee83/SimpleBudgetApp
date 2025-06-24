import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Chip, Menu, Provider } from 'react-native-paper';
import Swiper from 'react-native-swiper';

import PieChart from '../../components/PieChart';
import TotalAmount from '../../components/TotalAmount';
import { Constants, DarkTheme } from '../../constants/Theme';
import { BudgetContext } from '../../context/BudgetContext';
import { getMonthLong } from '../../services/utils/utilHelper';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MonthItem = ({ item, idx }) => {
	const colors = ['#fff', '#f2f2f2'];
	const iconColor = item.isPaid ? Constants.successColor : Constants.iconDefault;
	const itemStyle = item.isPaid ? styles.itemStyle : {};

	return (
		<View key={idx} style={[styles.listContent, { backgroundColor: colors[idx % colors.length] }]}>
			<Text>{item.name}</Text>
			<View style={itemStyle}>
				{item.isPaid && (
					<Chip
						textStyle={{ fontSize: Constants.fontXxSmall, position: 'absolute', top: -8 }}
						style={{
							marginRight: 8,
							backgroundColor: iconColor,
							height: 18,
							width: 40,
							paddingVertical: 0,
							paddingHorizontal: 2,
						}}
					>
						Paid
					</Chip>
				)}
				<Text>
					{item.amount.toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})}
				</Text>
			</View>
		</View>
	);
};

const HomeMenu = ({ visible, onOpen, onClose }) => (
	<Menu
		style={{ marginTop: -55 }}
		contentStyle={{ backgroundColor: '#fbfbfb' }}
		visible={visible}
		onDismiss={onClose}
		anchor={
			<TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 5 }} onPress={onOpen}>
				<MaterialIcons size={30} color="white" name="more-vert" />
			</TouchableOpacity>
		}
	>
		<Menu.Item onPress={() => { }} title="Detail View" titleStyle={{ color: Constants.darkGrey }} />
		<Menu.Item onPress={() => { }} title="Add Savings" titleStyle={{ color: Constants.darkGrey }} />
	</Menu>
);

const HomeScreen = ({ navigation }) => {
	const context = useContext(BudgetContext);
	const swiperRef = useRef(null);
	const [menuVisible, setMenuVisible] = useState(false);
	const [monthList, setMonthList] = useState([]);
	const [currentMonth, setCurrentMonth] = useState(null);
	const [monthDetails, setMonthDetails] = useState(null);
	const [moveToActiveMonth, setMoveToActiveMonth] = useState(false);
	const [isRefreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const init = async () => {
			await context.fetchBudget();
			const activeIdx = context.state.firstActiveIdx;
			const firstMonth = context.state.budget.monthlyBudget[activeIdx];
			await context.fetchMonthDetails(firstMonth);
			AsyncStorage.setItem('currentMonth', JSON.stringify(firstMonth));
			setMonthList(context.state.budget.monthlyBudget);
			setCurrentMonth(firstMonth);
			setMoveToActiveMonth(activeIdx > 0);
			setMonthDetails(context.state.currentMonth);
		};
		init();
	}, []);

	useEffect(() => {
		if (currentMonth) {
			navigation.setOptions({ headerTitle: getMonthLong(currentMonth.month) });
		}
	}, [currentMonth]);

	const setIndex = async (index) => {
		if (moveToActiveMonth && index === context.state.firstActiveIdx) {
			setMoveToActiveMonth(false);
		}
		const newMonth = monthList[index];
		await context.fetchMonthDetails(newMonth);
		AsyncStorage.setItem('currentMonth', JSON.stringify(newMonth));
		setCurrentMonth(newMonth);
		setMonthDetails(context.state.currentMonth);
	};

	if (!monthList.length) return <ActivityIndicator animating style={{ flex: 1 }} />;

	return (
		<Swiper
			ref={swiperRef}
			index={0}
			onIndexChanged={setIndex}
			activeDotColor={Constants.primaryColor}
			dotStyle={{ marginBottom: -25 }}
			activeDotStyle={{ marginBottom: -25, transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
			autoplay={moveToActiveMonth}
			autoplayTimeout={0}
			animated
			removeClippedSubviews={false}
			loop={false}
		>
			{monthList.map((_item, key) => (
				<View key={key} style={styles.container}>
					<Provider>
						<View style={{ zIndex: 2 }}>
							<HomeMenu visible={menuVisible} onOpen={() => setMenuVisible(true)} onClose={() => setMenuVisible(false)} />
						</View>
						<View style={{ marginTop: -25, zIndex: 1 }}>
							<PieChart pieData={monthDetails} defaultSelection="Income" />
						</View>
						<View style={styles.headingContainer}>
							<View>
								<Text style={styles.headingText}>Balance</Text>
								<TotalAmount value={monthDetails?.balance} textStyle={styles.subheadingText} alignment="left" />
							</View>
							<View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
								<Text style={styles.headingText}>Expenses</Text>
								<TotalAmount value={monthDetails?.totalExpenses} textStyle={styles.subheadingText} alignment="right" />
							</View>
						</View>
						{isRefreshing ? (
							<View style={styles.cardContainer}>
								<ActivityIndicator animating style={{ paddingVertical: 30 }} />
							</View>
						) : (
							<ScrollView style={styles.listContainer}>
								{monthDetails?.expenses?.map((expns, idx) => (
									<MonthItem key={idx} item={expns} idx={idx} />
								))}
							</ScrollView>
						)}
					</Provider>
				</View>
			))}
		</Swiper>
	);
};

const styles = StyleSheet.create({
	container: {
		...DarkTheme,
		flex: 1,
		alignContent: 'stretch',
		justifyContent: 'space-between',
		position: 'relative',
	},
	listContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingVertical: 8,
		fontSize: Constants.fontMedium,
	},
	itemStyle: {
		width: '40%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignSelf: 'flex-end',
	},
	headingContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		marginBottom: 8,
	},
	headingText: {
		fontWeight: Constants.fontWeightHeavy,
		color: Constants.whiteColor,
		fontSize: Constants.fontSmall,
	},
	subheadingText: {
		fontWeight: Constants.fontWeightMedium,
		color: Constants.whiteColor,
		fontSize: Constants.fontMedium,
	},
	listContainer: {
		backgroundColor: Constants.whiteColor,
		width: '100%',
		height: '100%',
		paddingBottom: 24,
	},
	cardContainer: {
		backgroundColor: Constants.whiteColor,
		width: '100%',
		height: '100%',
		margin: 1,
	},
});

export default HomeScreen;
