<template>
  <div class="box columns is-multiline">
    <div class="column is-12">
      <h4 class="title is-4">
        {{ `${transaction ? "Edit" : "New"} Transaction` }}
      </h4>
    </div>
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

    <div class="column is-12"><h4 class="title is-4">Rows</h4></div>
    <div class="column is-12" v-for="row in rows" :key="row.uuid">
      <TransactionRowForm
        :transactionRow="getRowByUuid(row.uuid)"
        :projectLabelTitles="projectLabelTitles"
        ref="rowForms"
      />
    </div>

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
import {
  getLabelsForm,
  getTransactionForm,
  ITransactionRow,
  TTransactionDirection,
} from "@/core/transaction";
import TransactionRowForm, {
  TTransactionRowForm,
} from "./TransactionRowForm.vue";

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

  components: {
    TransactionRowForm,
  },

  data() {
    return getTransactionForm(
      this.projectLabelTitles as Set<string>,
      this.transaction,
    );
  },

  methods: {
    getRowByUuid(uuid: string) {
      return this.transaction?.rows.find(
        (row: ITransactionRow) => row.uuid === uuid,
      );
    },

    getSubmitData(transactionDirection?: TTransactionDirection) {
      return {
        formData: {
          processedAt: this.processedAt,
          rows: (this.$refs.rowForms as TTransactionRowForm[]).map(
            (rowForm) => rowForm.getSubmitData().formData,
          ),
          labelTitles: this.labelTitles,
          labelTexts: this.labelTexts,
        },
        transaction: this.transaction,
        transactionDirection,
      };
    },

    submit(transactionDirection?: TTransactionDirection) {
      this.$emit("submit", this.getSubmitData(transactionDirection));
      this.$emit("close");
    },
  },

  watch: {
    projectLabelTitles() {
      const [labelTitles, labelTexts] = getLabelsForm(
        this.projectLabelTitles as Set<string>,
        this.transaction,
      );
      this.labelTitles = labelTitles;
      this.labelTexts = labelTexts;
    },
  },
});
</script>
