import AsyncStorage from '@react-native-async-storage/async-storage';

const IncomeType = ['Misc/One time', 'Paycheck', 'Recurring'];

const defaultMonthObject = {
    month: null,
    totalIncome: 0, //Number,
    totalExpenses: 0, //Number,
};

const monthGenerator = (sartMonth, endCount) => {
    const maxCount = endCount || 3;
    sartMonth = sartMonth || new Date();

    const newMonths = [];
    for (let i = 0; i < maxCount; i++) {
        const tempMonth = JSON.parse(JSON.stringify(defaultMonthObject));
        tempMonth.month = sartMonth;
        newMonths.push(tempMonth);
        sartMonth = new Date(sartMonth).setMonth(new Date(sartMonth).getMonth() + 1);
    }
    return newMonths;
};

const checkActiveMonths = (data) => {
    let currentMonth = new Date().getMonth();
    data.monthlyBudget = data.monthlyBudget.map(mth => {
        const month = new Date(mth.month).getMonth();
        if (month < currentMonth) mth.active = false; 
        return mth;
    });
    const isCurrent = data.monthlyBudget.filter(mth => mth.active).length == 3;
    if (!isCurrent) {
        const endCount = (3 - data.monthlyBudget.filter(mth => mth.active).length);
        let startMonth = data.monthlyBudget[data.monthlyBudget.length - 1].month;
        startMonth = new Date(sartMonth).setMonth(new Date(sartMonth).getMonth() + 1);
        data.monthlyBudget = [
            ...data.monthlyBudget, 
            ...monthGenerator(startMonth, endCount)
        ];
    }
    return { budget: data,  isCurrent }
};

// get the nth for a given number ie. 15 => 15th, 3 => 3rd
const nth = n => ["st","nd","rd"][(((n<0?-n:n)+90)%100-10)%10-1]||"th";

const constructDaysInMonth = () => {
    const days = [];
    let num = 1;
    while (days.length < 31) {
        days.push(num.toString());
        num++;
    }
    return days;
}

const formatAutomatedIncome = (incomeList) => {
    let fmtdList = [];
    if (incomeList.length) {
        incomeList.forEach((income, idx) => {
            if (income.incomeItems && income.incomeItems.length) {
                const incomeId = income._id;
                // income.incomeItems = income.incomeItems.filter(item => item.monthId == monthId);
                income.incomeItems.forEach(item => {
                    let tmpItem = Object.assign({}, income);
                    tmpItem = {
                        ...tmpItem,
                        ...item,
                        incomeId
                    }
                    delete tmpItem.incomeItems;
                    fmtdList.push(tmpItem);
                })
            } else {
                fmtdList.push(income);
            }
        });
    }
    // console.log('FMTED LIST == ', fmtdList);
    return fmtdList.sort((a, b) => a.expectedDate >= b.expectedDate);
}

const getMonthLong = (date, appendTxt) => {
    let monthTitle = new Date(date).toLocaleString('default', { month: 'long' });
    return appendTxt ? `${monthTitle} ${appendTxt}` : monthTitle;
}

const getCurrentMonth = async (monthlyBudget) => {
    let month = JSON.parse(await AsyncStorage.getItem('currentMonth'));
    
    if (!month) {
        month = monthlyBudget.filter(mth => mth.isActive)[0];
        AsyncStorage.setItem('currentMonth', JSON.stringify(month));
    }
    return month;
};

export {
    checkActiveMonths,
    constructDaysInMonth,
    formatAutomatedIncome,
    getCurrentMonth,
    getMonthLong,
    nth,
    IncomeType
}