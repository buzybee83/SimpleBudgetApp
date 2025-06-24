
const PayFrequencies = ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'];
const AmountTypes = { '$': 'Amount', '%': 'Percentage' };

const IncomeSlides = [
	{
		section: "Let's Configure Your Income",
		order: 1,
		field: 'firstPayDate',
		label: 'When is Your Next Paycheck?',
		type: 'date',
		format: 'MM/DD/YY'
	},
	{
		section: 'Set How Often You Get Paid',
		order: 2,
		parent: 'incomeType',
		field: 'payFrequency',
		label: 'Pay Frequency',
		type: 'select',
		default: 'Bi-Weekly',
		options: PayFrequencies
	},
	{
		section: 'Add Your Net Income',
		order: 3,
		parent: 'incomeType',
		field: 'netAmount',
		label: 'Paycheck Amount',
		type: 'currency'
	},
	{
		section: 'Minimum Net Balance Threshold for Bill Allocation',
		order: 4,
		parent: 'balanceThresholds',
		field: 'isEnabled',
		label: 'Enable a Balance Threshold',
		type: 'switch',
		optionalSlides: [
			{
				section: 'Setup Threshold Amount',
				order: 5,
				parent: 'balanceThresholds',
				contollingElement: 'isEnabled',
				children: [
					{
						order: 1,
						field: 'thresholdType',
						label: 'Select Mode',
						type: 'select',
						default: '$',
						options: AmountTypes
					},
					{
						order: 2,
						field: 'amount',
						label: 'Set Amount',
						type: 'number',
						maxValue: 100
					}
				]
			}
		]
	}
];

const SavingsSlides = [
	{
		section: 'Setup Automatic Savings',
		order: 6,
		field: 'isEnabled',
		label: 'Enable Savings',
		type: 'switch',
		optionalSlides: [
			{
				section: 'Savings Allocation Amount',
				order: 7,
				parent: 'allocation',
				contollingElement: 'isEnabled',
				children: [
					{
						order: 1,
						field: 'amountType',
						label: 'Set Amount Type',
						type: 'select',
						default: '%',
						options: AmountTypes
					},
					{
						order: 2,
						field: 'amount',
						label: 'Set Savings Amount to Allocate',
						type: 'number'
					}
				]
			},
			{
				section: 'Override Net Balance Thresholds',
				order: 8,
				field: 'overrideThresholds',
				label: 'Enable Override',
				tooltip: 'Must have Balance Threshold enabled',
				type: 'switch',
				contollingElement: 'isEnabled',
				default: false
			}
		]
	}
];

const DebtSlides = [
	{
		section: 'Do You Want to Pay Down Debts?',
		order: 9,
		field: 'enableDebtStrategy',
		label: 'Enable Debt Paydown?',
		type: 'switch',
		optionalSlides: [
			{
				section: 'Debt Paydown Strategy',
				order: 10,
				field: 'strategy',
				label: 'Select Strategy',
				type: 'select',
				default: 'snowball',
				options: ['Snowball', 'Avalanche']
			}
		]
	}
];

export {
	AmountTypes,
	DebtSlides,
	IncomeSlides,
	SavingsSlides
};


