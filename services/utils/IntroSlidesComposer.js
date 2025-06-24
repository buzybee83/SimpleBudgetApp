import { DebtSlides, IncomeSlides, SavingsSlides } from '../../constants/FieldsConfig';
import { Colors } from '../../constants/Theme';

const defaultSlides = [
  {
    id: 'welcome',
    order: 0,
    title: "Let's Get You Started!",
    text: 'We will start by creating a budget based on the information you enter here.',
    image: require('../../assets/images/calc.png'),
    color: '#fff',
    bgColor: '#59b2ab'
  },
  {
    id: 'complete',
    order: 999,
    title: 'Almost There!',
    titleAlt: 'Are You Sure You Want to Start Without Initial Setup?',
    text: 'Don\'t worry, these settings are just to get your budget started. You will be able to make changes later.',
    textAlt: 'Skipping the initial setup means you\'ll configure settings manually later. You can always revisit this walkthrough!',
    action: 'Create Budget Now!',
    actionAlt: 'Launch Anyway!',
    image: require('../../assets/images/rocket-takeoff.png'),
    imageAlt: require('../../assets/images/rocket.png'),
    color: '#fff',
    bgColor: '#4A148C',
    bgColorAlt: '#e91d50'
  }
];

function generateSlideGroup(configGroup, count) {
  const slides = [];
  configGroup.forEach((ele) => {
    const base = {
      id: `${ele.section}-${count}`,
      title: ele.section,
      form: true,
      bgColor: Colors[count % Colors.length],
      ...ele
    };
    count++;
    if (ele.default !== undefined) base.value = ele.default;

    if (ele.optionalSlides) {
      base.optionalSlides = ele.optionalSlides.map((subEl, idx) => {
        const sub = {
          id: `${subEl.section}-${count + idx}`,
          title: subEl.section,
          form: true,
          bgColor: Colors[(count + idx) % Colors.length],
          ...subEl
        };
        if (subEl.default !== undefined) sub.value = subEl.default;
        return sub;
      });
      count += ele.optionalSlides.length;
    }

    slides.push(base);
  });
  return { slides, count };
}

export function ConstructSlides() {
  let slides = [defaultSlides[0]];
  let count = 0;

  const income = generateSlideGroup(IncomeSlides, count);
  count = income.count;
  slides = slides.concat(income.slides);

  const savings = generateSlideGroup(SavingsSlides, count);
  count = savings.count;
  slides = slides.concat(savings.slides);

  const debt = generateSlideGroup(DebtSlides, count);
  count = debt.count;
  slides = slides.concat(debt.slides);

  slides = slides.sort((a, b) => a.order - b.order);
  slides.push(defaultSlides[1]);
  return slides;
}

export function DeconstructSlides(slides, introStatus) {
  const settings = { introStatus };

  slides.forEach((slide) => {
    if (!slide.form) return;

    if (slide.children) {
      slide.children.forEach((child) => {
        if (slide.parent) {
          settings[slide.parent] = settings[slide.parent] || {};
          settings[slide.parent][child.field] = child.value;
        } else {
          settings[child.field] = child.value;
        }
      });
    } else {
      if (slide.parent) {
        settings[slide.parent] = settings[slide.parent] || {};
        settings[slide.parent][slide.field] = slide.value;
      } else {
        settings[slide.field] = slide.value;
      }
    }
  });

  return settings;
}
