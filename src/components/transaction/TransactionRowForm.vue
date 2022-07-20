<template>
  <div class="columns is-multiline">
    <b-field label="Date" class="column is-3">
      <b-datepicker
        editable
        locale="en-CA"
        icon="calendar-today"
        placeholder="Type or select a date..."
        v-model="processedAt"
      ></b-datepicker>
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
    transactionRow: {
      type: Object,
      required: false,
    },

    projectLabelTitles: {
      type: Set,
      required: true,
    },
  },

  data() {
    return getTransactionRowForm(
      this.projectLabelTitles as Set<string>,
      this.transactionRow,
    );
  },

  methods: {
    getFormSubmit(): ITransactionRowFormSubmit {
      return {
        formData: {
          uuid: this.uuid,
          processedAt: this.processedAt,
          amount: this.amount,
          amountVs: this.amountVs,
          currencyTicker: this.currencyTicker,
          currencyTickerVs: this.currencyTickerVs,
          rate: this.rate,
          labelTitles: this.labelTitles,
          labelTexts: this.labelTexts,
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
});

export default TransactionRowForm;

export type TTransactionRowForm = InstanceType<typeof TransactionRowForm>;
</script>
