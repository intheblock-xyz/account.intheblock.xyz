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
    <template #end>
      <b-navbar-item tag="div">
        <b-tag v-if="account.isSignedIn" size="is-medium" type="is-success">
          Paid Account
        </b-tag>
        <b-tag v-else size="is-medium" type="is-warning">Free Account</b-tag>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <div class="buttons">
          <a
            class="button is-light"
            v-if="account.isSignedIn"
            @click="$emit('signOut')"
          >
            Sign out
          </a>
          <a class="button is-light" v-else @click="$emit('signIn')">
            Sign in
          </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "PageHeader",

  inject: ["account"],
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

  @media screen and (min-width: 1024px) {
    .navbar-menu {
      margin-left: 0.5rem;
    }
  }
}
</style>
