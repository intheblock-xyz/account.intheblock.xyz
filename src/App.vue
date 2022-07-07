<template>
  <div id="app">
    <b-navbar class="is-primary" :mobile-burger="true">
      <template #brand>
        <b-navbar-item tag="router-link" :to="{ name: 'Home' }">
          <img
            src="@/assets/images/cardano-aim_white.png"
            alt="Cardano Aim logo"
          />
        </b-navbar-item>
      </template>
      <template #end>
        <b-navbar-item
          tag="router-link"
          :to="{ name: 'Home' }"
          :active="currentRoute.name === 'Home'"
        >
          {{ $t("general.MI_DISPERSAL") }}
        </b-navbar-item>
        <b-navbar-dropdown
          :label="langs[$i18n.locale]"
          v-if="Object.keys(langs).length > 1"
        >
          <b-navbar-item
            @click="changeLocale(lang)"
            v-for="(name, lang) in langs"
            :key="`lang-${lang}`"
          >
            {{ name }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-item tag="div">
          <b-tag v-if="!isPaidAccount" size="is-medium" type="is-warning">
            Free Account
          </b-tag>
          <b-tag v-else size="is-medium" type="is-success">
            Paid Account
          </b-tag>
        </b-navbar-item>
        <b-navbar-item tag="div">
          <div class="buttons">
            <a class="button is-light" v-if="!isPaidAccount" @click="signIn">
              Sign in
            </a>
            <a class="button is-light" v-else @click="signOut"> Sign out </a>
          </div>
        </b-navbar-item>
      </template>
    </b-navbar>
    <div class="section container">
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import langs from "@/locales/locales";

export default {
  data() {
    return {
      challenges: [],
      langs: langs,
    };
  },

  computed: {
    ...mapGetters("user", ["isPaidAccount", "savedTransfersPaid"]),

    currentRoute() {
      return this.$router.currentRoute;
    },
  },

  methods: {
    changeLocale(locale) {
      this.$store.commit("user/setLocale", locale);
      this.$i18n.locale = locale;
      this.$router.go();
    },

    signIn() {
      this.$store.commit("user/setPaidAccount");
    },

    signOut() {
      let transfers = null;
      try {
        const data = JSON.parse(this.savedTransfersPaid);
        transfers = data.transfers;
      } catch {
        void 0;
      }

      if (transfers) {
        const transfersTokensCodesSet = new Set(
          transfers.map(({ tokenCode }) => tokenCode)
        );
        const isAdaOnly =
          transfersTokensCodesSet.size === 1 &&
          transfersTokensCodesSet.has("ada");
        if (!isAdaOnly) {
          this.$buefy.dialog.confirm({
            title: "Signing out",
            message:
              "You are leaving a paid account. Transfers will be resetted.",
            cancelText: "Cancel",
            confirmText: "Continue",
            onConfirm: () => this.$store.commit("user/setFreeAccount"),
          });
        } else {
          this.$store.commit("user/setFreeAccount");
        }
      } else {
        this.$store.commit("user/setFreeAccount");
      }
    },
  },

  created() {
    this.$i18n.locale = this.$store.state.user.locale;
  },
};
</script>

<style lang="scss">
body {
  overflow-x: hidden;
}

#app {
  position: relative;
}

.navbar-brand a:first-child {
  padding: 0 0 0 0.75rem;

  img {
    height: 52px;
    max-height: unset;
  }
}
</style>
