<template>
  <div class="columns is-multiline">
    <div class="column is-12">
      <b-table
        :data="tableData"
        default-sort="date"
        default-sort-direction="desc"
        paginated
        pagination-size="is-small"
        pagination-simple
        per-page="10"
      >
        <b-table-column field="index" label="#" v-slot="props" width="55">
          {{ props.row.index }}
        </b-table-column>

        <b-table-column field="date" label="Date" v-slot="props" width="205">
          {{ props.row.type === "tx" ? props.row.date : "" }}
        </b-table-column>

        <b-table-column field="in" label="In" v-slot="props" numeric>
          {{ props.row.type === "row" ? props.row.in || "&ndash;" : "" }}
        </b-table-column>

        <b-table-column field="out" label="Out" v-slot="props" numeric>
          {{ props.row.type === "row" ? props.row.out || "&ndash;" : "" }}
        </b-table-column>

        <b-table-column field="tokenTicker" label="Ticker" v-slot="props">
          {{ props.row.tokenTicker }}
        </b-table-column>

        <b-table-column
          field="exchange"
          label="Exchange"
          v-slot="props"
          numeric
        >
          {{ props.row.type === "row" ? props.row.exchange : "" }}
        </b-table-column>

        <b-table-column field="exchangeTicker" label="Ticker" v-slot="props">
          {{ props.row.exchangeTicker }}
        </b-table-column>

        <b-table-column field="rate" label="Rate" v-slot="props" numeric>
          {{ props.row.rate }}
        </b-table-column>

        <b-table-column
          :label="label"
          custom-key="label"
          v-for="label in projectLabelTitles"
          :key="label"
          v-slot="props"
          width="240"
        >
          {{
            props.row.type === "row"
              ? getLabelText(props.row, label) || "&ndash;"
              : ""
          }}
        </b-table-column>

        <b-table-column custom-key="actions" v-slot="props" width="70">
          <div class="actionButtons" v-if="props.row.type === 'tx'">
            <b-button
              size="is-small"
              icon-left="pencil-outline"
              @click="$emit('editTransaction', props.row.uuid)"
            ></b-button>
            <b-button
              size="is-small"
              type="is-danger is-light"
              icon-left="delete-outline"
              @click="$emit('removeTransaction', props.row.uuid)"
            ></b-button>
          </div>
        </b-table-column>

        <template #empty>
          <div class="emptyTableIconCont">
            <b-icon icon="circle-off-outline" type="is-primary" size="is-large">
            </b-icon>
            <p class="has-text-primary">No transactions</p>
          </div>
        </template>

        <template #bottom-left>
          <span v-if="transactions.length">
            <b>Transactions number</b>:
            {{ transactions.length }}
          </span>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import get from "lodash/get";
import moment from "moment";
import Vue from "vue";
import { ITransaction, ITransactionRow } from "@/core/transaction";
import { ICurrency } from "@/core/app";

interface ITableDataRow {
  uuid: string;
  date: string;
  index: string;
  type: "tx" | "row";
  in?: string;
  out?: string;
  tokenTicker?: string;
  exchange?: string;
  exchangeTicker?: string;
  rate?: string;
  labels?: { title: string; text: string }[];
}

const TransactionsTable = Vue.extend({
  name: "TransactionsTable",

  props: {
    transactions: {
      type: Array,
      required: true,
    },

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
  },

  inject: ["account"],

  computed: {
    tableData(): ITableDataRow[] {
      return (this.transactions as ITransaction[]).reduce(
        (tableData: ITableDataRow[], transaction: ITransaction, txIdx) => {
          const txDate = moment(new Date(transaction.processedAt)).format(
            "YYYY-MM-DD",
          );
          const txRates = transaction.rates;
          // create heading row
          tableData.push({
            uuid: transaction.uuid,
            date: txDate,
            index: `${txIdx + 1}`,
            type: "tx",
          });
          // create table rows from transaction rows
          transaction.rows.forEach((row, rowIdx) => {
            const rate = txRates.find(
              ({ currencyTicker, currencyTickerVs }) =>
                currencyTicker === row.currencyTicker &&
                currencyTickerVs === row.currencyTickerVs,
            )?.value;
            if (!rate) {
              throw new Error("Rate missed");
            }
            const amount = row.amount.toFixed(
              Array.from(this.projectTokens as Set<ICurrency>).find(
                ({ ticker }) => ticker === row.currencyTicker,
              )?.precision || 0,
            );
            tableData.push({
              uuid: row.uuid,
              date: txDate,
              index: `${txIdx + 1}.${rowIdx + 1}`,
              type: "row",
              in: transaction.direction === "receive" ? amount : undefined,
              out: transaction.direction === "pay" ? `-${amount}` : undefined,
              tokenTicker: row.currencyTicker,
              exchange: (row.amount * rate).toFixed(
                Array.from(this.projectExchanges as Set<ICurrency>).find(
                  ({ ticker }) => ticker === row.currencyTickerVs,
                )?.precision || 0,
              ),
              exchangeTicker: row.currencyTickerVs,
              rate: rate >= 1 ? rate.toFixed(2) : rate.toString(),
              labels: row.labels,
            });
          });
          return tableData;
        },
        [],
      );
    },
  },

  methods: {
    getLabelText(row: ITransactionRow, labelTitle: string): string {
      const label = row.labels.find(({ title }) => title === labelTitle);
      return label ? label.text : "";
    },
  },
});

export default TransactionsTable;
</script>

<style scoped>
.emptyTableIconCont {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: 1em;
  margin-top: 1em;
}

.actionButtons {
  width: 70px;
  display: flex;
  justify-content: space-between;
}
</style>
