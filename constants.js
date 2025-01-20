import { Dimensions } from "react-native";

const ICONS = {
  home: require("./assets/media/home.png"),
  orders: require("./assets/media/home.png"),
  cart: require("./assets/media/home.png"),
  account: require("./assets/media/home.png"),
  logo: require("./assets/media/logo.png"),
  orders: require("./assets/media/orders.png"),
  ordershistory: require("./assets/media/ordershistory.png"),
  scanner: require("./assets/media/scanner.png"),
  logout: require("./assets/media/logout.png"),
  settings: require("./assets/media/settings.png"),
};

const PAYMENTS = {
  amex: require("./assets/cards/amex.png"),
  applePay: require("./assets/cards/apple_pay.png"),
  diners: require("./assets/cards/diners.png"),
  eftpos: require("./assets/cards/eftpos.png"),
  googlePay: require("./assets/cards/google_pay.png"),
  jcb: require("./assets/cards/jcb.png"),
  link: require("./assets/cards/link.png"),
  mastercard: require("./assets/cards/mastercard.png"),
  RTA: require("./assets/cards/RTA.png"),
  unionPay: require("./assets/cards/unionpay.png"),
  visa: require("./assets/cards/visa.png"),
};

const IMAGES = {};

const THEME = {
  screenWidth: Dimensions.get("window").width,
  screenHeight: Dimensions.get("window").height,
};

export { ICONS, THEME, IMAGES, PAYMENTS };
