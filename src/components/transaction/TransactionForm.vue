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

    <div class="column is-12" v-for="rowUuid in rowUuids" :key="rowUuid">
      <hr />
      <TransactionRowForm
        :projectLabelTitles="projectLabelTitles"
        :projectTokens="projectTokens"
        :projectExchanges="projectExchanges"
        :transactionRowUuid="rowUuid"
        :transactionRow="getTransactionRowByUuid(rowUuid)"
        :isAddRowButtonEnabled="rowUuids.length < maxTransactionRowsNum"
        :isRemoveRowButtonEnabled="rowUuids.length > 1"
        :rates="rates"
        ref="rowForms"
        @onUpdateRate="updateRate"
        @submit="$emit('submit')"
        @addRowForm="addRowForm"
        @removeRowForm="removeRowForm"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { v4 as uuidv4 } from "uuid";
import Vue from "vue";
import {
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

    transaction: {
      type: Object,
      required: false,
    },

    maxTransactionRowsNum: {
      type: Number,
      required: false,
      default: 10,
    },
  },

  data() {
    return getTransactionForm(this.transaction);
  },

  inject: ["account"],

  methods: {
    addRowForm(afterUuid?: string) {
      let afterIndex = this.rowUuids.length;
      if (afterUuid) {
        afterIndex = this.rowUuids.findIndex((uuid) => uuid === afterUuid);
        if (afterIndex === -1) {
          throw new Error(`No transaction row with such uuid '${afterUuid}'`);
        } else {
          afterIndex += 1;
        }
      }
      this.rowUuids.splice(afterIndex, 0, uuidv4());
      this.$nextTick(() => {
        (this.$refs.rowForms as TTransactionRowForm[])[
          afterIndex
        ]?.focusAmount();
      });
    },

    removeRowForm(rowUuid: string) {
      const rowIndex = this.rowUuids.findIndex((uuid) => uuid === rowUuid);
      if (rowIndex === -1) {
        throw new Error(`No transaction row with such uuid '${rowUuid}'`);
      }
      this.rowUuids.splice(rowIndex, 1);
    },

    getTransactionRowByUuid(uuid: string): ITransactionRow {
      return this.transaction?.rows.find(
        (row: ITransactionRow) => row.uuid === uuid,
      );
    },

    updateRate(
      currencyTicker: string,
      currencyTickerVs: string,
      rate: number,
    ): void {
      this.rates[`${currencyTicker}:${currencyTickerVs}`] = rate;
      (this.$refs.rowForms as TTransactionRowForm[]).forEach((rowForm) => {
        rowForm.updateRate(currencyTicker, currencyTickerVs, rate);
      });
    },

    getFormSubmit(
      transactionDirection?: TTransactionDirection,
    ): ITransactionFormSubmit {
      return {
        formData: {
          uuid: this.uuid,
          processedAt: this.processedAt,
          rowUuids: (this.$refs.rowForms as TTransactionRowForm[]).map(
            (rowForm) => rowForm.uuid,
          ),
          rates: this.rates,
        },
        transaction: {
          ...this.transaction,
          direction: transactionDirection || this.transaction.direction,
        },
      };
    },
  },

  watch: {
    ["account.isSignedIn"](isSignedIn: boolean) {
      if (!isSignedIn && this.rowUuids.length > 1) {
        this.rowUuids.splice(1, this.rowUuids.length - 1);
      }
    },
  },

  mounted() {
    if (!this.transaction) {
      this.addRowForm();
    }
  },

  components: {
    TransactionRowForm,
  },
});

export default TransactionForm;

export type TTransactionForm = InstanceType<typeof TransactionForm>;
</script>

<style scoped>
.transactionRowTitle.title {
  border-top: 1px solid hsl(0deg 0% 86%);
  padding-top: 1em;
  margin-bottom: 1em;
}

hr {
  margin: 0 0 0.75rem;
}
</style>
