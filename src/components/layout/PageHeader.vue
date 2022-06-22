<template>
  <b-navbar class="is-primary navbar-main" mobile-burger>
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ name: 'home' }">
        <img
          src="../../assets/images/cardano-aim-logo-white.png"
          alt="Cardano Aim Logo"
        />
      </b-navbar-item>
    </template>
    <template #start>
      <b-navbar-item
        tag="router-link"
        :to="{ name: 'home' }"
        :active="currentRoute.name === 'home'"
      >
        Dispersal Tool
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router";

export default Vue.extend({
  name: "PageHeader",

  computed: {
    currentRoute(): Route {
      return this.$router.currentRoute;
    },
  },
});
</script>

<style lang="scss">
.navbar-main {
  padding: 0 0.5rem;

  .navbar-brand a {
    padding: 0;
    background-color: transparent !important;

    img {
      height: 52px;
      max-height: unset;
    }
  }

  .navbar-menu {
    margin-left: 0.5rem;
  }
}
</style>
