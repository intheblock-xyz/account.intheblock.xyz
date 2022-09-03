<template>
  <div class="columns is-multiline">
    <h5 class="title is-5 column">{{ heading }}</h5>
    <div class="column is-12">
      <div
        v-for="currency in currencies"
        :key="currency.uuid"
        class="currencyInputsRow"
      >
        <b-input
          v-model="currency.name"
          @keypress.native.enter="addCurrency"
          ref="currencyNameInputs"
          placeholder="Name"
        >
        </b-input>
        <b-input
          v-model="currency.ticker"
          @keypress.native.enter="addCurrency"
          placeholder="Ticker"
        >
        </b-input>
        <b-input
          v-if="showGeckoIdInput"
          v-model="currency.geckoId"
          @keypress.native.enter="addCurrency"
          placeholder="Gecko ID"
        >
        </b-input>
        <b-input
          v-if="showGeckoVsIdInput"
          v-model="currency.geckoVsId"
          @keypress.native.enter="addCurrency"
          placeholder="Gecko vs ID"
        >
        </b-input>
        <b-input
          v-model="currency.precision"
          @keypress.native.enter="addCurrency"
          type="number"
          step="1"
          min="0"
          max="16"
          placeholder="Dec."
        >
        </b-input>
        <p class="control">
          <b-button
            type="is-danger is-light"
            icon-left="delete-outline"
            @click="removeCurrency(currency.uuid)"
          />
        </p>
      </div>
      <b-button
        icon-left="plus"
        :label="`Add ${this.unit}`"
        @click="addCurrency"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { v4 as uuidv4 } from "uuid";
import Vue from "vue";
import { ICurrency } from "@/core/currency";

interface ICurrencyFormData extends Omit<ICurrency, "precision"> {
  uuid: string;
  precision: string;
}

const PreferencesCurrencyFormSet = Vue.extend({
  name: "PreferencesCurrencyFormSet",

  props: {
    heading: {
      type: String,
      required: false,
      default: "Currencies",
    },

    unit: {
      type: String,
      required: false,
      default: "currency",
    },

    initialCurrencies: {
      type: Set,
      required: true,
    },

    showGeckoIdInput: {
      type: Boolean,
      required: false,
      default: false,
    },

    showGeckoVsIdInput: {
      type: Boolean,
      required: false,
      default: false,
    },

    focusOnMount: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      currencies: Array.from(this.initialCurrencies as Set<ICurrency>).map(
        ({ name, ticker, geckoId, geckoVsId, precision }) => ({
          uuid: uuidv4(),
          name,
          ticker,
          geckoId,
          geckoVsId,
          precision: precision ? precision.toString() : "",
        }),
      ) as ICurrencyFormData[],
    };
  },

  methods: {
    addCurrency() {
      this.currencies.push({
        uuid: uuidv4(),
        name: "",
        ticker: "",
        geckoId: "",
        geckoVsId: "",
        precision: "",
      });
      this.$nextTick(this.focusFirst);
    },

    removeCurrency(uuid: string) {
      const index = this.currencies.findIndex(
        (currency) => uuid === currency.uuid,
      );
      this.currencies.splice(index, 1);
      this.$nextTick(this.focusFirst);
    },

    focusFirst() {
      if (this.currencies.length > 0) {
        (this.$refs.currencyNameInputs as HTMLInputElement[])[
          this.currencies.length - 1
        ].focus();
      }
    },

    getFormData() {
      return {
        currencies: new Set<ICurrency>(
          this.currencies
            .filter(({ ticker }) => !!ticker)
            .map(({ name, ticker, geckoId, geckoVsId, precision }) => ({
              name,
              ticker,
              geckoId,
              geckoVsId,
              precision: precision ? parseInt(precision) : undefined,
            })),
        ),
      };
    },
  },

  mounted() {
    if (this.focusOnMount) {
      this.focusFirst();
    }
  },
});

export default PreferencesCurrencyFormSet;

export type TPreferencesCurrencyFormSet = InstanceType<
  typeof PreferencesCurrencyFormSet
>;
</script>

<style scoped>
.title {
  margin-bottom: 0 !important;
}

.currencyInputsRow {
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 0.75rem;
}

.currencyInputsRow > div {
  flex-grow: 1;
}

.currencyInputsRow > :nth-child(1) {
  flex-basis: 150px;
}

.currencyInputsRow > :nth-child(2) {
  flex-basis: 20%;
}

.currencyInputsRow > :nth-child(3) {
  flex-basis: 20%;
}

.currencyInputsRow > :last-child {
  flex-basis: 40px;
}
</style>
