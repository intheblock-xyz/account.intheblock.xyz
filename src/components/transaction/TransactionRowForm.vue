<template>
  <div class="columns is-multiline">
    <b-field
      label="Amount"
      class="column is-3"
      :type="formErrors.amount ? 'is-danger' : undefined"
      :message="formErrors.amount"
    >
      <b-input
        type="number"
        v-model="amount"
        ref="amountInput"
        :step="getCurrencyInputStep(currencyTicker)"
        :min="getCurrencyInputStep(currencyTicker)"
        @blur="adjustRateFromAmounts"
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

    <b-field
      label="Exchange"
      class="column is-3"
      :type="formErrors.amountVs ? 'is-danger' : undefined"
      :message="formErrors.amountVs"
    >
      <b-input
        type="number"
        v-model="amountVs"
        :step="getCurrencyInputStep(currencyTickerVs)"
        :min="getCurrencyInputStep(currencyTickerVs)"
        @blur="adjustRateFromAmounts"
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

    <b-field
      label="Rate"
      class="column is-3"
      :type="formErrors.rate ? 'is-danger' : undefined"
      :message="formErrors.rate"
    >
      <b-input
        type="number"
        step="0.000000001"
        min="0.000000001"
        v-model="rate"
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
        @keypress.native.enter="$emit('submit')"
      ></b-input>
    </b-field>

    <b-field v-if="account.isSignedIn" label="Control" class="column is-3">
      <p class="control" :style="{ width: '50%' }">
        <b-button
          expanded
          type="is-success is-light"
          icon-left="plus"
          :disabled="!isAddRowButtonEnabled"
          @click="$emit('addRowForm', uuid)"
        />
      </p>
      <p class="control" :style="{ width: '50%' }">
        <b-button
          expanded
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
import { getCurrencyPrecision, ICurrency } from "@/core/app";
import {
  getLabelsForm,
  getTransactionRowForm,
  ITransactionRowFormSubmit,
  TTransactionFormRates,
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

    rates: {
      type: Object,
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
      this.rates as TTransactionFormRates,
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

    ratesKey(): string {
      return `${this.currencyTicker}:${this.currencyTickerVs}`;
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

    adjustFormDataFromRate(rate: number) {
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
    },

    adjustRateFromAmounts() {
      const amount = parseFloat(this.amount);
      const amountVs = parseFloat(this.amountVs);
      if (amount && this.currencyTicker) {
        const amountPrecision = getCurrencyPrecision(
          Array.from(this.projectTokens) as ICurrency[],
          this.currencyTicker,
        );
        this.amount = amount.toFixed(amountPrecision);
      }
      if (amountVs && this.currencyTickerVs) {
        const exchangePrecision = getCurrencyPrecision(
          Array.from(this.projectExchanges) as ICurrency[],
          this.currencyTickerVs,
        );
        this.amountVs = amountVs.toFixed(exchangePrecision);
      }
    },

    focusAmount() {
      (this.$refs.amountInput as HTMLInputElement).focus();
    },

    updateRate(
      currencyTicker: string,
      currencyTickerVs: string,
      rate: number,
    ): void {
      if (
        this.currencyTicker === currencyTicker &&
        this.currencyTickerVs === currencyTickerVs
      ) {
        if (!isNaN(rate)) {
          const currentRate = parseFloat(this.rate);
          if (currentRate !== rate) {
            this.rate = rate.toString();
          }
        } else {
          this.rate = "";
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

    validateForm(): boolean {
      const formErrors: Record<string, string> = {};
      const amount = parseFloat(this.amount);
      if (!amount || amount < 0) {
        formErrors.amount = "Please enter a number greater than 0";
      }
      const amountVs = parseFloat(this.amountVs);
      if (!amountVs || amountVs < 0) {
        formErrors.amountVs = "Please enter a number greater than 0";
      }
      const rate = parseFloat(this.rate);
      if (!rate || rate < 0) {
        formErrors.rate = "Please enter a number greater than 0";
      }
      this.formErrors = formErrors;
      return Object.keys(this.formErrors).length === 0;
    },

    getFormSubmit(): ITransactionRowFormSubmit {
      this.submitAttempts += 1;
      if (!this.validateForm()) {
        throw new Error("Transaction row form validation failed");
      }
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
          formErrors: this.formErrors,
          submitAttempts: this.submitAttempts,
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

    amount() {
      if (this.submitAttempts > 0) {
        this.validateForm();
      }
    },

    amountVs() {
      if (this.submitAttempts > 0) {
        this.validateForm();
      }
    },

    rate(newRate: string) {
      const rate = parseFloat(newRate);
      if (this.submitAttempts > 0) {
        this.validateForm();
      }
      if (rate) {
        this.adjustFormDataFromRate(rate);
      } else {
        if (this.lastTouched === "amount") {
          this.amountVs = "";
        } else {
          this.amount = "";
        }
      }
      if (this.currencyTicker && this.currencyTickerVs) {
        this.$emit(
          "onUpdateRate",
          this.currencyTicker,
          this.currencyTickerVs,
          rate,
        );
      }
    },

    ratesKey(newRatesKey: string) {
      const rate: number | undefined = this.rates[newRatesKey];
      if (rate) {
        this.rate = rate.toString();
      } else {
        this.rate = "";
        if (this.lastTouched === "amount") {
          this.amountVs = "";
        } else {
          this.amount = "";
        }
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
