<template>
  <div class="columns is-multiline">
    <b-field label="Amount" class="column is-3">
      <b-input
        required
        type="number"
        step="0.01"
        v-model="amount"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keypress.native.enter="$emit('submit')"
      ></b-input>

      <p class="control">
        <b-dropdown
          aria-role="list"
          v-if="account.isSignedIn"
          v-model="currencyTicker"
          position="is-bottom-left"
        >
          <template #trigger="{ active }">
            <b-button
              :size="account.isSignedIn ? 'is-small' : undefined"
              :label="currencyTicker.toUpperCase()"
              :icon-right="active ? 'menu-up' : 'menu-down'"
            />
          </template>

          <b-dropdown-item
            aria-role="listitem"
            v-for="ticker in ['ada', 'btc', 'eth']"
            :value="ticker"
            :key="ticker"
            >{{ ticker.toUpperCase() }}</b-dropdown-item
          >
        </b-dropdown>
        <b-button v-else class="is-static">{{
          currencyTicker.toUpperCase()
        }}</b-button>
      </p>
    </b-field>

    <b-field label="Exchange" class="column is-3">
      <b-input
        required
        type="number"
        step="0.01"
        v-model="amountVs"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keypress.native.enter="$emit('submit')"
      ></b-input>

      <p class="control">
        <b-dropdown
          aria-role="list"
          v-if="account.isSignedIn"
          v-model="currencyTickerVs"
          position="is-bottom-left"
        >
          <template #trigger="{ active }">
            <b-button
              :label="currencyTickerVs.toUpperCase()"
              :icon-right="active ? 'menu-up' : 'menu-down'"
              :size="account.isSignedIn ? 'is-small' : undefined"
            />
          </template>

          <b-dropdown-item
            aria-role="listitem"
            v-for="ticker in ['usd', 'eur']"
            :value="ticker"
            :key="ticker"
            >{{ ticker.toUpperCase() }}</b-dropdown-item
          >
        </b-dropdown>
        <b-button v-else class="is-static">{{
          currencyTickerVs.toUpperCase()
        }}</b-button>
      </p>
    </b-field>

    <b-field label="Rate" class="column is-3">
      <b-input
        required
        type="number"
        step="0.000001"
        v-model="rate"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keypress.native.enter="$emit('submit')"
      ></b-input>
    </b-field>

    <b-field
      class="column is-3"
      v-for="(title, index) in labelTitles"
      :key="title"
      :label="title"
    >
      <b-input
        v-model="labelTexts[index]"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keypress.native.enter="$emit('submit')"
      ></b-input>
    </b-field>

    <b-field v-if="account.isSignedIn" label="Control" class="column is-3">
      <p class="control" :style="{ width: '50%' }">
        <b-button
          expanded
          size="is-small"
          type="is-success is-light"
          icon-left="plus"
          :disabled="!isAddRowButtonEnabled"
          @click="$emit('addRowForm', uuid)"
        />
      </p>
      <p class="control" :style="{ width: '50%' }">
        <b-button
          expanded
          size="is-small"
          type="is-danger is-light"
          icon-left="minus"
          :disabled="!isRemoveRowButtonEnabled"
          @click="$emit('removeRowForm', uuid)"
        />
      </p>
    </b-field>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  getLabelsForm,
  getTransactionRowForm,
  ITransactionRowFormSubmit,
} from "@/core/transaction";

const TransactionRowForm = Vue.extend({
  name: "TransactionRowForm",

  props: {
    projectLabelTitles: {
      type: Set,
      required: true,
    },

    transactionRowUuid: {
      type: String,
      required: false,
    },

    transactionRow: {
      type: Object,
      required: false,
    },

    isAddRowButtonEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },

    isRemoveRowButtonEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return getTransactionRowForm(
      this.projectLabelTitles as Set<string>,
      this.transactionRowUuid,
      this.transactionRow,
    );
  },

  inject: ["account"],

  methods: {
    getFormSubmit(): ITransactionRowFormSubmit {
      return {
        formData: {
          uuid: this.uuid,
          amount: this.amount,
          amountVs: this.amountVs,
          currencyTicker: this.currencyTicker,
          currencyTickerVs: this.currencyTickerVs,
          rate: this.rate,
          labelTitles: Array.from(this.labelTitles),
          labelTexts: Array.from(this.labelTexts),
        },
        transactionRow: this.transactionRow,
      };
    },
  },

  watch: {
    projectLabelTitles() {
      const [labelTitles, labelTexts] = getLabelsForm(
        this.projectLabelTitles as Set<string>,
        this.transactionRow,
      );
      this.labelTitles = labelTitles;
      this.labelTexts = labelTexts;
    },
  },

  mounted() {
    if (!this.currencyTicker) {
      this.currencyTicker = "ada";
    }
    if (!this.currencyTickerVs) {
      this.currencyTickerVs = "usd";
    }
  },
});

export default TransactionRowForm;

export type TTransactionRowForm = InstanceType<typeof TransactionRowForm>;
</script>
