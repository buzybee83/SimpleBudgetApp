import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Chip, Menu, Provider } from 'react-native-paper';
// import update from 'react-addons-update';
import Swiper from 'react-native-swiper';

import PieChart from '../../components/PieChart';
import TotalAmount from '../../components/TotalAmount';
import { Constants, DarkTheme } from '../../constants/Theme';
import { getMonthLong } from '../../services/utils/utilHelper';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

export default class HomeScreen extends React.PureComponent {
	state = {
		isRefreshing: false,
		moveToActiveMonth: this.context.moveToActiveMonth,
		settings: null,
		monthList: [],
		currentMonth: null,
		menuVisible: false
	};
	static contextType = BudgetContext;

	componentDidMount = async () => {
		try {
			console.log('componentDidMount')
			await this.context.fetchBudget();
			await this.context.fetchMonthDetails(this.context.state.budget.monthlyBudget[this.context.state.firstActiveIdx]);
			AsyncStorage.setItem('currentMonth', JSON.stringify(this.context.state.budget.monthlyBudget[this.context.state.firstActiveIdx]));
			this.setState({
				settings: this.context.state.budget.settings,
				moveToActiveMonth: this.context.state.firstActiveIdx > 0 ? true : false,
				monthList: this.context.state.budget.monthlyBudget,
				currentMonth: this.context.state.budget.monthlyBudget[this.context.state.firstActiveIdx]
			});
		} catch (err) {
			console.error(err);
		}
	}

	componentDidUpdate(nextProps, prevProps) {
		console.log('componentDidUpdate')
		if ((this.state.currentMonth && !prevProps.currentMonth) ||
			(prevProps.currentMonth && this.state.currentMonth._id !== prevProps.currentMonth._id)) {
			this.props.navigation.setOptions({ headerTitle: getMonthLong(this.state.currentMonth.month, new Date(this.state.currentMonth.month).getFullYear()) });
		} else {
			if (!this.state.monthDetails || (this.state.monthDetails &&
				(this.context.state.currentMonth.balance !== this.state.monthDetails.balance ||
					this.context.state.currentMonth.expensesPaidToDate !== this.state.monthDetails.expensesPaidToDate))) {
				this.setState({ monthDetails: this.context.state.currentMonth });
			}
		}
	}

	async getMonthDetails(month) {
		await this.context.fetchMonthDetails(month);
	}

	setIndex = (index) => {
		if (this.state.moveToActiveMonth) {
			if (index == this.context.state.firstActiveIdx) {
				this.setState({
					moveToActiveMonth: false,
					monthDetails: this.context.state.currentMonth
				});
			}
		} else {
			this.getMonthDetails(this.state.monthList[index]);
			AsyncStorage.setItem('currentMonth', JSON.stringify(this.state.monthList[index]));
			this.setState({
				currentMonth: this.state.monthList[index],
				monthDetails: this.context.state.currentMonth
			});
		}
	};

	ListItem(item, idx) {
		const colors = ['#fff', '#f2f2f2'];
		const iconColor = item.isPaid ? Constants.successColor : Constants.iconDefault;
		const itemStyle = item.isPaid ? styles.itemStyle : {};
		return (
			<View key={idx} style={[styles.listContent, { backgroundColor: colors[idx % colors.length] }]}>
				<Text>{item.name}</Text>
				<View style={itemStyle}>
					{item.isPaid &&
						<Chip textStyle={{ fontSize: Constants.fontXxSmall, position: 'absolute', top: -8, margin: 'auto' }}
							style={{
								marginRight: 8,
								backgroundColor: iconColor,
								height: 18,
								width: 40,
								top: 0,
								paddingVertical: 0,
								paddingHorizontal: 2
							}}
						>
							Paid
						</Chip>
					}
					<Text>
						{item.amount.toLocaleString("en-US", {
							style: "currency",
							currency: "USD"
						})
						}
					</Text>
				</View>
			</View>
		);
	}

	closeMenu = () => {
		this.setState({ menuVisible: false });
	}

	openMenu = () => {
		this.setState({ menuVisible: true });
	}

	HomeMenu = () => {
		return (
			<Menu
				style={{ marginTop: -55 }}
				contentStyle={{ backgroundColor: '#fbfbfb'}}
				visible={this.state.menuVisible}
				onDismiss={this.closeMenu}
				anchor={<TouchableOpacity
					style={{  alignSelf: 'flex-start', marginTop: 5 }}
					onPress={this.openMenu}
				>
					<MaterialIcons
						size={30}
						color="white"
						name="more-vert"
					/>
				</TouchableOpacity>}
			>
				<Menu.Item onPress={() => { }} title="Detail View" titleStyle={{color: Constants.darkGrey }}/>
				<Menu.Item onPress={() => { }} title="Add Savings" titleStyle={{color: Constants.darkGrey }}/>
			</Menu>
		)
	}

	render() {
		const { monthList, moveToActiveMonth, monthDetails, isRefreshing } = this.state;

		if (monthList.length < 1) {
			return <ActivityIndicator animating={true} style={{ flex: 1 }} />;
		}
		return (
			<Swiper
				ref={ref => this.Swiper = ref}
				index={0}
				onIndexChanged={this.setIndex.bind(this)}
				activeDotColor={Constants.primaryColor}
				dotStyle={{ marginBottom: -25}}
				activeDotStyle={{ marginBottom: -25, transform: [{ scaleX: 1.3 },{ scaleY: 1.3 }]}}
				buttonWrapperStyle={{ color: Constants.primaryColor }}
				showsButtons={false}
				autoplay={moveToActiveMonth}
				autoplayTimeout={0}
				animated={true}
				removeClippedSubviews={false}
				loop={false}>
				{monthList.map((_item, key) => (
					<View key={key} style={styles.container}>
						<Provider>
							<View style={{ zIndex: 2}}>
								<this.HomeMenu></this.HomeMenu>
							</View>
							<View style={{marginTop: -25, zIndex: 1}}>
								<PieChart
									pieData={monthDetails}
									defaultSelection="Income"
								/>
							</View>
							<View style={styles.headingContainer}>
								<View>
									<Text style={styles.headingText}>Balance</Text>
									<TotalAmount
										value={monthDetails?.balance}
										textStyle={styles.subheadingText}
										alignment="left"
									/>
								</View>
								<View style={{ flexDirection: 'column', alignItems: 'flex-end'}}>
									<Text style={styles.headingText}>Expenses</Text>
									<TotalAmount
										value={monthDetails?.totalExpenses}
										textStyle={styles.subheadingText}
										alignment="right"
									/>
								</View>
							</View>
							{isRefreshing ?
								<View style={styles.cardContainer}>
									<ActivityIndicator animating={true} style={{ paddingVertical: 30 }} />
								</View> :
								<ScrollView style={styles.listContainer}>
									{monthDetails?.expenses &&
										monthDetails.expenses.map((expns, idx) => {
											return this.ListItem(expns, idx)
										})
									}
								</ScrollView>
							}
						</Provider>
					</View>
				))}
			</Swiper>
		)

	}
}

const styles = StyleSheet.create({
	container: {
		...DarkTheme,
		flex: 1,
		alignContent: 'stretch',
		justifyContent: 'space-between',
		position: 'relative'
	},
	flatlistContainer: {
		width: (SCREEN_WIDTH + 1),
		height: '100%'
	},
	buttonText: {
		fontSize: 42,
		color: Constants.primaryColor
	},
	contentContainer: {
		flexGrow: 1,
		alignSelf: 'center'
	},
	headingContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		marginBottom: 8
	},
	headingText: {
		fontWeight: Constants.fontWeightHeavy,
		color: Constants.whiteColor,
		fontSize: Constants.fontSmall
	},
	subheadingText: {
		fontWeight: Constants.fontWeightMedium,
		color: Constants.whiteColor,
		fontSize: Constants.fontMedium
	},
	cardContainer: {
		// padding: 24,
		backgroundColor: Constants.whiteColor,
		width: '100%',
		height: '100%',
		margin: 1,
	},
	listContainer: {
		backgroundColor: Constants.whiteColor,
		width: '100%',
		height: '100%',
		paddingBottom: 24
	},
	listContent: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingVertical: 8,
		fontSize: Constants.fontMedium
	},
	itemStyle: {
		width: '40%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignSelf: 'flex-end'
	},
	cardContent: {
		padding: 24,
		// borderTopWidth: 1,
		// borderColor: '#444'
	}
});
// nextButton={<Text style={[{ marginRight: -8 }, styles.buttonText]}>›</Text>}
// prevButton={<Text style={[{ marginLeft: -8 }, styles.buttonText]}>‹</Text>}
/* export default HomeScreen 
<ScrollView
		refreshControl={
			<RefreshControl
				tintColor={Constants.primaryColor}
				refreshing={isRefreshing}
				onRefresh={refreshBudgetData}
			/>
		}
	></ScrollView> 
	<FlatList
	style={styles.flatlistContainer}
	data={state?.budget?.monthlyBudget}
	keyExtractor={item => item._id}
	horizontal
	legacyImplementation={false}
	showsVerticalScrollIndicator={false}
	refreshControl={
		<RefreshControl
			tintColor={Constants.noticeText}
			refreshing={isRefreshing}
			onRefresh={refreshBudgetData}
		/> */


	// <ScrollView>
	// 			<FlatList
	// 				style={styles.flatlistContainer}
	// 				data={state?.budget?.monthlyBudget}
	// 				keyExtractor={item => item._id}
	// 				horizontal
	// 				legacyImplementation={false}
	// 				showsVerticalScrollIndicator={false}
	// 				pagingEnabled={true}
	// 				contentContainerStyle={styles.contentContainer}
	// 				renderItem={({ item }) => {
	// 					return (
	// 						<Card
	// 							title={getMonthLong(item.month)}
	// 							containerStyle={styles.cardContent}
	// 						>
	// 							{ isRefreshing ?
	// 								<ActivityIndicator animating={true} style={{paddingVertical: 30}}/> :
	// 								<Text>Month Overview</Text>
	// 							}
	// 						</Card>
	// 					)
	// 				}}
	// 			/>
	// 		</ScrollView>