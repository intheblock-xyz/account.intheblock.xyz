<template>
  <div>
    <PageHeader @signIn="signIn" @signOut="signOut" />
    <RouterView />
  </div>
</template>

<script>
import Vue from "vue";
import PageHeader from "@/components/layout/PageHeader.vue";

export default Vue.extend({
  name: "App",

  components: {
    PageHeader,
  },

  data() {
    return {
      account: {
        isSignedIn: false,
      },
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

  provide() {
    return {
      account: this.account,
    };
  },
});
</script>
