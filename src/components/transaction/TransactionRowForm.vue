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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { getLabelsForm, getTransactionRowForm } from "@/core/transaction";

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
    getSubmitData() {
      return {
        formData: {
          processedAt: this.processedAt,
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
