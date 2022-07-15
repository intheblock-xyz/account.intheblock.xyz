<template>
  <div>
    <PageHeader :isSignedIn="isSignedIn" @signIn="signIn" @signOut="signOut" />
    <RouterView />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import PageHeader from "@/components/layout/PageHeader.vue";

export default Vue.extend({
  name: "App",

  components: {
    PageHeader,
  },

  data() {
    return {
      isSignedIn: false,
    };
  },

  methods: {
    signIn() {
      this.isSignedIn = true;
    },

    signOut() {
      this.isSignedIn = false;
    },
  },
});
</script>
