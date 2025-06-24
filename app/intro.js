import { Ionicons } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	View
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { Button } from 'react-native-elements';
import InitialFlowForm from '../components/InitialFlowForm';
import Layout from '../constants/Layout';
import { Constants } from '../constants/Theme';
import { BudgetContext } from '../context/BudgetContext';
import { ConstructSlides, DeconstructSlides } from '../services/utils/IntroSlidesComposer';

export default function IntroScreen({ navigation }) {
	const sliderRef = useRef(null);
	const { state, createBudget, clearError, errorMessage } = useContext(BudgetContext);

	const [slides, setSlides] = useState(ConstructSlides());
	const [introSkipped, setIntroSkipped] = useState(false);
	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		clearError();
	}, []);

	const handleFormState = (newValue, childIndex) => {
		const newSlides = [...slides];
		const target = newSlides[currentSlide];

		if (childIndex !== undefined) {
			target.children[childIndex].value = newValue;
		} else {
			target.value = newValue;
		}

		// Optional Slide logic
		if (target.optionalSlides) {
			const insertIndex = currentSlide + 1;
			if (newValue === true) {
				target.optionalSlides.forEach(slide => {
					if (slide.children) {
						slide.children.forEach(c => {
							if (c.default) c.value = c.default;
						});
					}
					if (slide.default !== undefined) slide.value = slide.default;
				});
				newSlides.splice(insertIndex, 0, ...target.optionalSlides);
			} else {
				newSlides.splice(insertIndex, target.optionalSlides.length);
			}
		}

		setSlides([...newSlides]);
	};

	const handleDone = async () => {
		clearError();
		const introStatus = introSkipped ? 'SKIPPED' : 'COMPLETE';
		await createBudget(DeconstructSlides(slides, introStatus));
		if (state.budget) {
			navigation.dispatch(StackActions.replace('MainFlow'));
		}
	};

	const handleSkip = () => {
		setIntroSkipped(true);
		sliderRef.current?.goToSlide(slides.length - 1, true);
	};

	const handleSlideChange = index => {
		Keyboard.dismiss();
		if (introSkipped && currentSlide > index) setIntroSkipped(false);
		setCurrentSlide(index);
	};

	const renderItem = ({ item, index }) => {
		return (
			<View style={[styles.slide, { backgroundColor: introSkipped ? item.bgColorAlt : item.bgColor }]}>
				<Text style={styles.title}>{introSkipped ? item.titleAlt : item.title}</Text>
				<Image
					source={introSkipped ? item.imageAlt : item.image}
					style={{ width: Layout.window.width, maxHeight: 400 }}
					resizeMode="contain"
				/>
				{item.form && (
					<View style={styles.formContainer}>
						<InitialFlowForm action={handleFormState} slideIndex={index} data={item} />
					</View>
				)}
				{item.action && (
					<>
						<Button
							raised
							containerStyle={styles.actionButtonContainer}
							buttonStyle={styles.actionButton}
							title={introSkipped ? item.actionAlt : item.action}
							onPress={handleDone}
							icon={<Ionicons name="checkmark-sharp" style={{ marginRight: 6 }} color="#fff" size={24} />}
						/>
						{errorMessage && (
							<Text style={styles.errorContainer}>{errorMessage}</Text>
						)}
					</>
				)}
				<Text style={[styles.text, { color: introSkipped ? item.color : item.color }]}>
					{introSkipped ? item.textAlt : item.text}
				</Text>
			</View>
		);
	};

	const renderNextButton = () => (
		<View style={styles.buttonCircle}>
			<Ionicons name="arrow-forward" color="#fff" size={24} />
		</View>
	);

	return (
		<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
			<AppIntroSlider
				ref={sliderRef}
				data={slides}
				renderItem={renderItem}
				renderNextButton={renderNextButton}
				onDone={handleDone}
				onSkip={handleSkip}
				onSlideChange={handleSlideChange}
				showSkipButton
				showPrevButton
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	slide: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
		paddingBottom: 60,
	},
	title: {
		fontSize: Constants.headerXLarge,
		fontWeight: Constants.fontWeightMedium,
		marginVertical: 24,
		color: 'white',
		textAlign: 'center',
	},
	text: {
		textAlign: 'center',
		marginVertical: 24,
		fontSize: Constants.fontMedium,
	},
	formContainer: {
		width: '100%',
		marginHorizontal: 16,
		padding: 0,
	},
	actionButton: {
		backgroundColor: '#22BCB5',
	},
	actionButtonContainer: {
		marginVertical: 16,
	},
	buttonCircle: {
		width: 40,
		height: 40,
		backgroundColor: 'rgba(0, 0, 0, .2)',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		padding: 10,
		backgroundColor: Constants.whiteColor,
		color: Constants.errorText,
	},
});
