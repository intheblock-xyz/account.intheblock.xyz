<template>
  <b-dropdown
    v-if="!isConnecting && !walletName"
    aria-role="list"
    position="is-bottom-right"
  >
    <template #trigger="{ active }">
      <b-button
        label="Connect wallet"
        :icon-right="active ? 'menu-up' : 'menu-down'"
      ></b-button>
    </template>
    <b-dropdown-item
      v-for="wallet in availableWallets"
      :key="wallet"
      aria-role="listitem"
      @click="connectWallet(wallet)"
      >{{ wallet }}</b-dropdown-item
    >
    <b-dropdown-item
      v-if="!availableWallets.length"
      @click="noCompatibleWallets"
      >No wallets detected</b-dropdown-item
    >
  </b-dropdown>
  <b-button
    v-else-if="isConnecting"
    disabled
    label="Connecting wallet..."
  ></b-button>
  <b-button
    v-else-if="wallet"
    icon-left="wallet"
    label="Connected"
    type="is-success"
    @click="showWalletModal"
  ></b-button>
</template>

<script lang="ts">
import Vue from "vue";
import { WalletModal } from "@/components/wallet";
import { IWindowCardano, Wallet } from "@/core/wallet";
import { getErrorMessage } from "@/lib/utils/errorMessage";

interface IWalletButtonData {
  isConnecting: boolean;
  wallet: null | Wallet;
  walletName: null | string;
  walletIcon: null | string;
  walletApiVersion: null | string;
  networkId: null | number;
}

const compatibleWallets = ["eternl", "flint", "gerowallet", "nami", "nufi"];

const WalletButton = Vue.extend({
  name: "WalletButton",

  data(): IWalletButtonData {
    return {
      isConnecting: false,
      wallet: null,
      walletName: null,
      walletIcon: null,
      walletApiVersion: null,
      networkId: null,
    };
  },

  computed: {
    availableWallets() {
      const cardano = (window as IWindowCardano)?.cardano;
      if (!cardano) {
        return [];
      }
      return Object.keys(cardano).filter((walletName) =>
        compatibleWallets.includes(walletName),
      );
    },
  },

  methods: {
    noCompatibleWallets() {
      this.$buefy.notification.open({
        duration: 10000,
        position: "is-top",
        type: "is-info",
        message: `Compatible wallets were not found. Please install one of these wallets to use dApp connection: ${compatibleWallets.join(
          ", ",
        )}`,
      });
    },

    async connectWallet(name: string, silent = false) {
      this.isConnecting = true;
      try {
        this.wallet = new Wallet(name);
        this.walletName = this.wallet.name;
        this.walletIcon = this.wallet.icon;
        this.walletApiVersion = this.wallet.apiVersion;
        this.networkId = await this.wallet.getNetworkId();
        !silent &&
          this.$buefy.notification.open({
            duration: 5000,
            position: "is-top",
            type: "is-success",
            message: `Established dApp connection with wallet '${name}'`,
          });
      } catch (error) {
        this.disconnectWallet();
        !silent &&
          this.$buefy.notification.open({
            duration: 5000,
            position: "is-top",
            type: "is-danger",
            message: getErrorMessage(error),
          });
      }
      this.isConnecting = false;
    },

    async reconnectWallet() {
      const cardano = (window as IWindowCardano)?.cardano;
      if (!!cardano) {
        for (const walletName of this.availableWallets) {
          const isEnabled = await cardano[walletName].isEnabled();
          if (isEnabled) {
            await this.connectWallet(walletName, true);
          }
        }
      }
    },

    disconnectWallet() {
      this.wallet = null;
      this.walletName = null;
      this.walletIcon = null;
      this.walletApiVersion = null;
      this.networkId = null;
    },

    showWalletModal() {
      this.$buefy.modal.open({
        parent: this,
        component: WalletModal,
        hasModalCard: true,
        props: {
          name: this.walletName,
          icon: this.walletIcon,
          apiVersion: this.walletApiVersion,
          networkId: this.networkId,
        },
        events: {
          disconnect: this.disconnectWallet,
        },
      });
    },
  },

  async mounted() {
    await this.reconnectWallet();
  },
});

export default WalletButton;
</script>

<style scoped>
.dropdown {
  margin-right: 0.5em;
}
</style>
