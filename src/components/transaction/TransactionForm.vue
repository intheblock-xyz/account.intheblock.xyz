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
      <b-button @click="$emit('cancel')">Cancel</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import { getTransactionForm, TTransactionDirection } from "@/core/transaction";

export default Vue.extend({
  name: "TransactionForm",

  props: {
    transaction: {
      type: Object,
      required: false,
    },
  },

  data() {
    return getTransactionForm(this.transaction);
  },

  computed: {
    // processedAt: {
    //   get() {
    //     return moment(this.values.processedAt).toDate();
    //   },
    //   set(value) {
    //     this.values.processedAt = moment(value).unix() * 1000;
    //   },
    // },
  },

  methods: {
    submit(transactionDirection?: TTransactionDirection) {
      this.$emit("submit", {
        formData: {
          processedAt: this.processedAt,
        },
        transaction: this.transaction,
        transactionDirection,
      });
    },
  },

  // watch: {
  //   processedAt() {
  //     this.$emit("update", { fieldName: "processedAt" });
  //   },
  // },
});
</script>
