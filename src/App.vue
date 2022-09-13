<template>
  <div>
    <PageHeader @signIn="signIn" @signOut="signOut" />
    <RouterView />
  </div>
</template>

<script>
import Vue from "vue";
import { saveIsSignedIn, loadIsSignedIn } from "@/core/app";
import PageHeader from "@/components/layout/PageHeader.vue";

export default Vue.extend({
  name: "App",

  data() {
    return {
      account: {
        isSignedIn: null,
      },
    };
  },

  provide() {
    return {
      account: this.account,
    };
  },

  methods: {
    signIn() {
      this.account.isSignedIn = true;
    },

    signOut() {
      this.account.isSignedIn = false;
    },
  },

  watch: {
    ["account.isSignedIn"](newIsSignedIn, oldIsSignedIn) {
      if (oldIsSignedIn !== null) {
        saveIsSignedIn(newIsSignedIn);
      }
    },
  },

  created() {
    this.account.isSignedIn = loadIsSignedIn();
  },

  components: {
    PageHeader,
  },
});
</script>

<style>
tr.is-transaction {
  background: #f3f3f3;
}
</style>
