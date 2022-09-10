// import Vue from "vue";
// import VueI18n from "vue-i18n";
// import getBrowserLocale from "../lib/utils/getBrowserLocale"
// import supportedLocales from "../contrib/locales/locales";
// import messages from "../locales/messages";
// import numberFormats from "../locales/numbers";
// import dateTimeFormats from "../locales/dateTime";

// const defaultLocale = 'en';

// function getStartingLocale() {
//   const browserLocale = getBrowserLocale({ countryCodeOnly: true });
//   if (browserLocale && Object.keys(supportedLocales).includes(browserLocale)) {
//     return browserLocale;
//   } else {
//     return defaultLocale;
//   }
// }

// const startingLocale = getStartingLocale();

// Vue.use(VueI18n);

// export const i18n = new VueI18n({
//   locale: startingLocale,
//   messages, // set locale messages
//   numberFormats,
//   dateTimeFormats,
// });
