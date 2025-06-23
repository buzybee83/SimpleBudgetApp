const tintColor = '#8c3cff';
const whiteColor = '#FFF';
const darkGrey = '#263238';
const midGrey = '#40555e';
// const primaryColor = '#22BCB5';
const primaryColor = '#6200ee';
const secondaryColor = '#81DD02';
const warnColor = '#e91d50';
// const linksColor = '#1ea6a0';
const linksColor = primaryColor;
const mainFontFamily = 'roboto';

const Constants = {
	mainFontFamily,
	tintColor,
	darkGrey,
	midGrey,
	whiteColor,
	iconDefault: '#ccc',
	iconSelected: tintColor,
	primaryColor,
	secondaryColor,
	warnColor,
	linksColor,
	successColor: secondaryColor,
	warnAltColor: '#cc0066',
	tintColorLight: '#dec7ff',
	errorBackground: 'red',
	errorText: '#bb0000',
	warningBackground: '#EAEB5E',
	warningText: '#666804',
	noticeBackground: tintColor,
	noticeText: '#fff',
	headerSmall: 18,
	headerMedium: 22,
	headerLarge: 24,
	headerXLarge: 26,
	fontXxSmall: 9,
	fontXSmall: 12,
	fontSmall: 14,
	fontMedium: 16,
	fontLarge: 18,
	fontXLarge: 20,
	fontWeightLight: '300',
	fontWeightMedium: '500',
	fontWeightHeavy: '700',
	buttonDesign: {
		borderRadius: 45,
		backgroundColor: primaryColor,
	},
	buttonTextLarge: {
		color: '#fff',
		fontSize: 20,
		fontWeight: '500'
	},
	buttonLinkDesign: {
		color: linksColor,
		fontWeight: '500'
	},
	boxShadow: {
		shadowColor: '#000',
		shadowOffset: { height: 4, width: 4 },
		shadowOpacity: .25,
		shadowRadius: 3.5,
		elevation: 5,
	},
	boxShadowLight: {
		shadowColor: '#000',
		shadowOffset: { height: 4, width: 4 },
		shadowOpacity: .25,
		shadowRadius: 3.5,
		elevation: 5,
	},
	hasError: {
		fontSize: 14,
		color: '#bb0000',
		position: 'absolute',
		bottom: 0
	},
};

const LightTheme = {
	backgroundColor: whiteColor,
	color: darkGrey,
};

const DarkTheme = {
	backgroundColor: darkGrey,
	color: '#fefefe',
};

const Colors = [
	// '#59b2ab',
	'#18a79b',
	'#18a777',
	'#1bbd87',
	'#579bb2',
	'#2f95dc',
	'#0066ff',
	'#576eb2',
	'#5757b2',
	'#8557b2',
	'#6e57b2',
	'#9966ff',
	// '#4A148C'
];

export { Constants, LightTheme, DarkTheme, Colors }

