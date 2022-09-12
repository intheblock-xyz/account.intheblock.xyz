<template>
  <div class="columns is-multiline">
    <b-field label="Amount" class="column is-3">
      <b-input
        required
        type="number"
        v-model="amount"
        :step="getCurrencyInputStep(currencyTicker)"
        :min="getCurrencyInputStep(currencyTicker)"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keyup.native="adjustFormDataFromAmount"
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
            v-for="ticker in tokenTickersList"
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
        v-model="amountVs"
        :step="getCurrencyInputStep(currencyTickerVs)"
        :min="getCurrencyInputStep(currencyTickerVs)"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keyup.native="adjustFormDataFromExchange"
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
            v-for="ticker in exchangeTickersList"
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
        step="0.000000001"
        min="0.000000001"
        v-model="rate"
        :size="account.isSignedIn ? 'is-small' : undefined"
        @keyup.native="adjustFormDataFromRate"
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
import repeat from "lodash/repeat";
import Vue from "vue";
import { getCurrencyPrecision, ICurrency, ICurrencyRate } from "@/core/app";
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

    projectTokens: {
      type: Set,
      required: true,
    },

    projectExchanges: {
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

    rates: {
      type: Array,
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
      this.rates as ICurrencyRate[],
    );
  },

  inject: ["account"],

  computed: {
    tokenTickersList(): string[] {
      return (Array.from(this.projectTokens) as ICurrency[]).map(
        ({ ticker }) => ticker,
      );
    },

    exchangeTickersList(): string[] {
      return (Array.from(this.projectExchanges) as ICurrency[]).map(
        ({ ticker }) => ticker,
      );
    },
  },

  methods: {
    adjustFormDataFromAmount(e: Event) {
      const rate = parseFloat(this.rate);
      if (rate) {
        const exchangePrecision = getCurrencyPrecision(
          Array.from(this.projectExchanges) as ICurrency[],
          this.currencyTickerVs,
        );
        const value = parseFloat((e.target as HTMLInputElement).value);
        let amountVs = "";
        if (value === 0) {
          amountVs = "0";
        } else if (value) {
          amountVs = (value * rate).toFixed(exchangePrecision);
        }
        this.amountVs = amountVs;
      }
      this.lastTouched = "amount";
    },

    adjustFormDataFromExchange(e: Event) {
      const rate = parseFloat(this.rate);
      if (rate) {
        const amountPrecision = getCurrencyPrecision(
          Array.from(this.projectTokens) as ICurrency[],
          this.currencyTicker,
        );
        const value = parseFloat((e.target as HTMLInputElement).value);
        let amount = "";
        if (value === 0) {
          amount = "0";
        } else if (value) {
          amount = (value / rate).toFixed(amountPrecision);
        }
        this.amount = amount.toString();
      }
      this.lastTouched = "exchange";
    },

    adjustFormDataFromRate(e: Event) {
      const rate = e
        ? parseFloat((e.target as HTMLInputElement).value)
        : parseFloat(this.rate);
      if (rate) {
        if (this.lastTouched === "amount") {
          const amount = parseFloat(this.amount);
          const exchangePrecision = getCurrencyPrecision(
            Array.from(this.projectExchanges) as ICurrency[],
            this.currencyTickerVs,
          );
          let amountVs = "";
          if (amount === 0) {
            amountVs = "0";
          } else if (amount) {
            amountVs = (amount * rate).toFixed(exchangePrecision);
          }
          this.amountVs = amountVs.toString();
        } else {
          const amountVs = parseFloat(this.amountVs);
          const amountPrecision = getCurrencyPrecision(
            Array.from(this.projectTokens) as ICurrency[],
            this.currencyTicker,
          );
          let amount = "";
          if (amountVs === 0) {
            amount = "0";
          } else if (amountVs) {
            amount = (amountVs / rate).toFixed(amountPrecision);
          }
          this.amount = amount.toString();
        }
      }
    },

    getCurrencyInputStep(ticker: string): string {
      const precision = getCurrencyPrecision(
        Array.from(this.projectTokens).concat(
          Array.from(this.projectExchanges),
        ) as ICurrency[],
        ticker,
      );
      return precision === 0 ? "1" : `0.${repeat("0", precision - 1)}1`;
    },

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
          lastTouched: this.lastTouched,
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
        [this.labelTitles, this.labelTexts],
      );
      this.labelTitles = labelTitles;
      this.labelTexts = labelTexts;
    },

    tokenTickersList(tickersList: string[]) {
      if (!tickersList.includes(this.currencyTicker)) {
        this.currencyTicker = tickersList[0];
      }
    },

    exchangeTickersList(tickersList: string[]) {
      if (!tickersList.includes(this.currencyTickerVs)) {
        this.currencyTickerVs = tickersList[0];
      }
    },
  },

  mounted() {
    if (!this.currencyTicker) {
      this.currencyTicker = this.tokenTickersList[0];
    }
    if (!this.currencyTickerVs) {
      this.currencyTickerVs = this.exchangeTickersList[0];
    }
  },
});

export default TransactionRowForm;

export type TTransactionRowForm = InstanceType<typeof TransactionRowForm>;
</script>
