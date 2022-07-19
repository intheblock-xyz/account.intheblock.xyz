<template>
  <div class="columns is-multiline">
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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  getLabelsForm,
  getTransactionForm,
  ITransactionFormSubmit,
  ITransactionRow,
  TTransactionDirection,
} from "@/core/transaction";
import TransactionRowForm, {
  TTransactionRowForm,
} from "./TransactionRowForm.vue";

const TransactionForm = Vue.extend({
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
    getRowByUuid(uuid: string): ITransactionRow {
      return this.transaction?.rows.find(
        (row: ITransactionRow) => row.uuid === uuid,
      );
    },

    getFormSubmit(
      transactionDirection?: TTransactionDirection,
    ): ITransactionFormSubmit {
      return {
        formData: {
          uuid: this.uuid,
          processedAt: this.processedAt,
          rows: (this.$refs.rowForms as TTransactionRowForm[]).map(
            (rowForm) => rowForm.getFormSubmit().formData,
          ),
          labelTitles: this.labelTitles,
          labelTexts: this.labelTexts,
        },
        transaction: this.transaction,
        transactionDirection,
      };
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

export default TransactionForm;

export type TTransactionForm = InstanceType<typeof TransactionForm>;
</script>
