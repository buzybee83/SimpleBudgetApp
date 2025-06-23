import { CommonActions, StackActions } from '@react-navigation/native';

let navigator;

function setTopNavigator(navigatorRef) {
  if (!navigator) navigator = navigatorRef;
}

function navigate(routeName, params) {
  navigator.dispatch(
    CommonActions.navigate({
      name: routeName,
      params,
    })
  );
}

function switchNavigation(routeName, params) {
  navigator.dispatch(
    StackActions.push(
      routeName,
      params,
    )
  );
}

function resetNavigation() {
  navigator.dispatch(
    StackActions.replace('Auth')
  );
}

export {
  setTopNavigator,
  switchNavigation,
  resetNavigation,
  navigate,
};