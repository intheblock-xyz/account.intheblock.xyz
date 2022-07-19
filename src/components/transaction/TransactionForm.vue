<template>
  <div class="box columns is-multiline">
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
        @keypress.native.enter="submit"
      ></b-input>
    </b-field>
    <div class="buttons column is-12">
      <b-button
        v-if="transaction"
        type="is-primary"
        icon-left="check"
        @click="submit()"
        >Save</b-button
      >
      <b-button
        v-if="!transaction"
        type="is-primary"
        icon-left="arrow-up"
        @click="submit('pay')"
        >Pay</b-button
      >
      <b-button
        v-if="!transaction"
        type="is-primary"
        icon-left="arrow-down"
        @click="submit('receive')"
        >Receive</b-button
      >
      <b-button @click="$emit('close')">Cancel</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { getTransactionForm, TTransactionDirection } from "@/core/transaction";

export default Vue.extend({
  name: "TransactionForm",

  props: {
    transaction: {
      type: Object,
      required: false,
    },

    projectLabelTitles: {
      type: Set,
      required: true,
    },
  },

  data() {
    return getTransactionForm(
      this.projectLabelTitles as Set<string>,
      this.transaction,
    );
  },

  methods: {
    submit(transactionDirection?: TTransactionDirection) {
      this.$emit("submit", {
        formData: {
          processedAt: this.processedAt,
          labelTitles: this.labelTitles,
          labelTexts: this.labelTexts,
        },
        transaction: this.transaction,
        transactionDirection,
      });
      this.$emit("close");
    },
  },

  watch: {
    projectLabelTitles() {
      const { labelTitles, labelTexts } = getTransactionForm(
        this.projectLabelTitles as Set<string>,
        this.transaction,
      );
      this.labelTitles = labelTitles;
      this.labelTexts = labelTexts;
    },
  },
});
</script>
