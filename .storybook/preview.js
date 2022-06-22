import Vue from "vue";
import VueRouter from "vue-router";
import "../src/plugins/buefy";

Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.component("router-link", Vue.component("RouterLink"));

export const decorators = [
  (story) => ({
    components: { story },
    template: "<story />",
    router: new VueRouter(),
  }),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
