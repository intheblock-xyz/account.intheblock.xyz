<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Rate calculator</p>
    </header>
    <section class="modal-card-body">
      <h4 class="title is-4">Total</h4>
      <div class="columns">
        <b-field
          :label="`${
            currentTokenCode === 'ada' ? '₳' : currentTokenCode.toUpperCase()
          } Amount`"
          class="column is-3"
        >
          <b-input
            type="number"
            step="0.01"
            v-model="adaAmount"
            @keyup.native="adjustAmountFromAda"
          ></b-input>
        </b-field>

        <b-field label="$ Amount" class="column is-3">
          <b-input
            type="number"
            step="0.01"
            v-model="usdAmount"
            @keyup.native="adjustAmountFromUSD"
          ></b-input>
        </b-field>

        <b-field
          label="Incoming Transfers"
          class="column is-6"
          v-if="transfers.length"
        >
          <p class="control">
            <b-button icon-left="plus" @click="addCustomRow" />
          </p>
          <b-dropdown
            multiple
            scrollable
            v-model="transfersSelected"
            aria-role="list"
          >
            <template #trigger>
              <b-button
                expanded
                icon-right="menu-down"
                :label="`${transfersSelected.length} selected`"
              ></b-button>
            </template>

            <b-dropdown-item
              v-for="transfer in transfers"
              v-bind:key="transfer.id"
              :value="transfer.id"
              aria-role="listitem"
            >
              <span
                >{{ $d(transfer.date, "short") }} /
                {{
                  `${
                    currentTokenCode === "ada"
                      ? "₳"
                      : `${currentTokenCode.toUpperCase()} `
                  }`
                }}{{ transfer.amount }} / {{ transfer.rate }}</span
              >
            </b-dropdown-item>
          </b-dropdown>
        </b-field>
      </div>
      <div v-if="columns.length">
        <h4 class="title is-4">Split</h4>
        <div
          class="columns"
          v-for="[idx, row] in rows.entries()"
          v-bind:key="row.id"
        >
          <b-field class="column is-3">
            <b-datepicker
              editable
              :locale="locale"
              v-model="columnDate[idx]"
              icon="calendar-today"
              placeholder="Type or select a date..."
            >
            </b-datepicker>
          </b-field>

          <b-field class="column is-2">
            <p class="control">
              <b-button class="button is-static" label="~" />
            </p>
            <b-input
              type="number"
              step="0.000000000000001"
              required
              v-model="columnRate[idx]"
              @focus="setLastTouchedField(row, 'rate')"
            ></b-input>
          </b-field>

          <b-field class="column is-2">
            <p class="control">
              <b-button
                class="button is-static"
                :label="`${
                  currentTokenCode === 'ada'
                    ? '₳'
                    : currentTokenCode.toUpperCase()
                }`"
              />
            </p>
            <b-input
              type="number"
              step="0.01"
              required
              v-model="columnAdaAmount[idx]"
              @focus="setLastTouchedField(row, 'adaAmount')"
            ></b-input>
          </b-field>

          <b-field class="column is-2">
            <p class="control">
              <b-button class="button is-static" icon-left="currency-usd" />
            </p>
            <b-input
              type="number"
              step="0.01"
              required
              v-model="columnUsdAmount[idx]"
              @focus="setLastTouchedField(row, 'usdAmount')"
            ></b-input>
          </b-field>

          <b-field
            class="column is-2"
            :type="columnPercentSum === 100 ? null : 'is-warning'"
          >
            <b-input
              type="number"
              step="1"
              min="0"
              max="100"
              required
              v-model="columnPercent[idx]"
              @focus="setLastTouchedField(row, 'percent')"
              @keyup.native="() => distributePercentRemainders(true)"
            ></b-input>
            <p class="control">
              <b-button class="button is-static" icon-left="percent" />
            </p>
          </b-field>

          <b-field class="column is-1">
            <p class="control">
              <b-button
                type="is-danger is-light"
                expanded
                icon-left="minus"
                @click="removeRow(row.id)"
              />
            </p>
          </b-field>
        </div>

        <div class="columns">
          <b-field class="column is-1 is-offset-11">
            <p class="control">
              <b-button
                type="is-success is-light"
                expanded
                icon-left="plus"
                @click="addCustomRow"
              />
            </p>
          </b-field>
        </div>
      </div>
      <div class="columns">
        <b-field
          :type="finalRateSource === 'current' ? 'is-warning' : 'is-success'"
          :label="`${
            finalRateSource === 'current' ? 'Current' : 'Calculated'
          } Rate`"
          class="column is-4 is-offset-3"
        >
          <b-input
            type="number"
            size="is-large"
            step="0.000000000000001"
            v-bind="{ readonly: true }"
            v-model="finalRate"
          >
          </b-input>
        </b-field>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button
        icon-left="check"
        label="Apply Rate"
        @click="
          $emit('submit', {
            finalRate,
            adaAmount,
            usdAmount,
            lastTouchedAmount,
          })
        "
        type="is-primary"
      />
      <b-button label="Cancel" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

const mapId = (obj) => obj.id;

function prepareTransfers(initialTransfers, tokenCode) {
  return Object.freeze(
    initialTransfers
      .filter(
        (transfer) => transfer.amountIn > 0 && transfer.tokenCode === tokenCode
      )
      .map((transfer) => ({
        id: transfer.id,
        date: transfer.date.getTime ? transfer.date : new Date(transfer.date),
        rate: transfer.rate,
        amount: transfer.amountIn,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  );
}

export default {
  props: [
    "initialTransfers",
    "currentRate",
    "currentTokenCode",
    "initialAdaAmount",
    "initialUsdAmount",
    "initialLastTouchedAmount",
  ],

  data() {
    return {
      transfers: [],
      transfersSelected: [],
      transfersCustom: [],
      finalRate: this.currentRate,
      finalRateSource: "current",
      adaAmount: this.initialAdaAmount,
      usdAmount: this.initialUsdAmount,
      lastTouchedAmount: this.initialLastTouchedAmount,
      lastTouchedField: null,
      rows: [],
      rowsLastTouchedAmount: {},
      columnDate: [],
      columnRate: [],
      columnAdaAmount: [],
      columnUsdAmount: [],
      columnPercent: [],
      columnPercentEdited: [],
      columnPercentLocked: [],
    };
  },

  computed: {
    ...mapGetters("user", ["locale"]),

    columns() {
      return [
        this.columnRate,
        this.columnAdaAmount,
        this.columnUsdAmount,
        this.columnPercent,
      ];
    },

    totalAmount() {
      return this.columnAdaAmount.reduce((acc, cur) => (acc += +cur), 0);
    },

    columnPercentSum() {
      return this.columnPercent.reduce(
        (acc, cur) => (acc += parseFloat(cur)),
        0
      );
    },
  },

  watch: {
    adaAmount() {
      this.columnPercent = [...this.columnPercent];
    },

    usdAmount() {
      this.columnPercent = [...this.columnPercent];
    },

    transfersSelected(transferIds, previousTransferIds) {
      const rows = [
        ...transferIds.map((id) => ({ id, isCustom: false })),
        ...this.rows.filter(({ isCustom }) => isCustom),
      ];
      this.rows = rows;
      if (transferIds.length < previousTransferIds.length) {
        this.$nextTick(this.distributePercentRemainders);
      } else if (transferIds.length > previousTransferIds.length) {
        const addedTransferIds = transferIds.filter(
          (id) => !previousTransferIds.includes(id)
        );
        for (const id of addedTransferIds) {
          const idx = transferIds.indexOf(id);
          this.columnPercent.splice(idx, 0, "");
        }
      }
    },

    transfersCustom(transferIds) {
      this.rows = [
        ...this.rows.filter(({ isCustom }) => !isCustom),
        ...transferIds.map((id) => ({ id, isCustom: true })),
      ];
    },

    rows(rows, oldRows) {
      const rowIds = rows.map(mapId);
      const oldRowIds = oldRows.map(mapId);

      const columnDate = [...this.columnDate];
      const columnRate = [...this.columnRate];
      const columnAdaAmount = [...this.columnAdaAmount];
      const columnUsdAmount = [...this.columnUsdAmount];

      let insertIdxOffset = 0;
      for (const [idx, { id, isCustom }] of rows.entries()) {
        if (!oldRowIds.includes(id)) {
          if (isCustom) {
            columnDate.splice(idx + insertIdxOffset, 0, new Date());
            columnRate.splice(
              idx + insertIdxOffset,
              0,
              this.currentRate.toString().slice(0, 17)
            );
            columnAdaAmount.splice(idx + insertIdxOffset, 0, "");
            columnUsdAmount.splice(idx + insertIdxOffset, 0, "");
          } else {
            const transfer = this.transfers.find((t) => t.id === id);
            columnDate.splice(idx + insertIdxOffset, 0, transfer.date);
            columnRate.splice(
              idx + insertIdxOffset,
              0,
              transfer.rate.toString()
            );
            columnAdaAmount.splice(
              idx + insertIdxOffset,
              0,
              transfer.amount.toString()
            );
            columnUsdAmount.splice(
              idx + insertIdxOffset,
              0,
              (transfer.amount * transfer.rate).toFixed(2)
            );
          }
          insertIdxOffset += 1;
        }
      }

      let removeIdxOffset = 0;
      for (const [idx, { id }] of oldRows.entries()) {
        if (!rowIds.includes(id)) {
          columnDate.splice(idx + removeIdxOffset, 1);
          columnRate.splice(idx + removeIdxOffset, 1);
          columnAdaAmount.splice(idx + removeIdxOffset, 1);
          columnUsdAmount.splice(idx + removeIdxOffset, 1);
          removeIdxOffset -= 1;
        }
      }

      this.columnDate = columnDate;
      this.columnRate = columnRate;
      this.columnAdaAmount = columnAdaAmount;
      this.columnUsdAmount = columnUsdAmount;

      this.rowsLastTouchedAmount = Object.fromEntries(
        rows.map(({ id }) => [id, this.rowsLastTouchedAmount[id] || "ada"])
      );
    },

    columnRate(columnRate) {
      if (
        this.lastTouchedField &&
        this.lastTouchedField.columnName === "rate"
      ) {
        const rowId = this.lastTouchedField.id;
        const rowIdx = this.rows.findIndex(({ id }) => id === rowId);
        const rate = +columnRate[rowIdx];
        const rowLastTouchedAmount = this.rowsLastTouchedAmount[rowId] || "ada";
        if (rowLastTouchedAmount === "ada") {
          const columnUsdAmount = [...this.columnUsdAmount];
          const usdAmount = +this.columnAdaAmount[rowIdx] * rate;
          columnUsdAmount[rowIdx] = usdAmount ? usdAmount.toFixed(2) : "";
          this.columnUsdAmount = columnUsdAmount;
        } else {
          const columnAdaAmount = [...this.columnAdaAmount];
          const adaAmount = +this.columnUsdAmount[rowIdx] / rate;
          columnAdaAmount[rowIdx] = adaAmount ? adaAmount.toFixed(2) : "";
          this.columnAdaAmount = columnAdaAmount;
        }
      }
    },

    columnAdaAmount(columnAdaAmount) {
      if (
        this.lastTouchedField &&
        this.lastTouchedField.columnName === "adaAmount"
      ) {
        const columnUsdAmount = [...this.columnUsdAmount];
        const rowId = this.lastTouchedField.id;
        const rowIdx = this.rows.findIndex(({ id }) => id === rowId);
        const rate = +this.columnRate[rowIdx];
        const usdAmount = +columnAdaAmount[rowIdx] * rate;
        columnUsdAmount[rowIdx] = usdAmount ? usdAmount.toFixed(2) : "";
        this.columnUsdAmount = columnUsdAmount;
        if (this.adaAmount) {
          if (columnAdaAmount.length > 1) {
            const adaAmount = parseFloat(this.adaAmount);
            const columnPercent = columnAdaAmount.map((amount) =>
              Math.round((100 / adaAmount) * parseFloat(amount)).toString()
            );
            const columnPercentWithoutLastSum = columnPercent
              .slice(0, -1)
              .reduce((acc, cur) => (acc += parseFloat(cur)), 0);
            columnPercent[columnPercent.length - 1] = (
              100 - columnPercentWithoutLastSum
            ).toString();
            this.columnPercent = columnPercent;
          } else if (columnAdaAmount.length === 1) {
            this.columnPercent = ["100"];
          } else {
            this.columnPercent = [];
          }
        }
      }
    },

    columnUsdAmount(columnUsdAmount) {
      if (
        this.lastTouchedField &&
        this.lastTouchedField.columnName === "usdAmount"
      ) {
        const columnAdaAmount = [...this.columnAdaAmount];
        const rowId = this.lastTouchedField.id;
        const rowIdx = this.rows.findIndex(({ id }) => id === rowId);
        const rate = +this.columnRate[rowIdx];
        const adaAmount = +columnUsdAmount[rowIdx] / rate;
        columnAdaAmount[rowIdx] = adaAmount ? adaAmount.toFixed(2) : "";
        this.columnAdaAmount = columnAdaAmount;
        if (this.usdAmount) {
          if (columnUsdAmount.length > 1) {
            const usdAmount = parseFloat(this.usdAmount);
            const columnPercent = columnUsdAmount.map((amount) =>
              Math.round((100 / usdAmount) * parseFloat(amount)).toString()
            );
            const columnPercentWithoutLastSum = columnPercent
              .slice(0, -1)
              .reduce((acc, cur) => (acc += parseFloat(cur)), 0);
            columnPercent[columnPercent.length - 1] = (
              100 - columnPercentWithoutLastSum
            ).toString();
            this.columnPercent = columnPercent;
          } else if (columnUsdAmount.length === 1) {
            this.columnPercent = ["100"];
          } else {
            this.columnPercent = [];
          }
        }
      }
    },

    columnPercent(columnPercent) {
      if (
        this.lastTouchedField === null ||
        this.lastTouchedField.columnName === "percent"
      ) {
        if (this.adaAmount) {
          const adaAmount = parseFloat(this.adaAmount);
          const columnAdaAmount = columnPercent.map((percent) =>
            ((adaAmount / 100) * parseFloat(percent)).toFixed(2)
          );
          if (columnAdaAmount.length > 1) {
            const columnAdaAmountWithoutLastSum = columnAdaAmount
              .slice(0, -1)
              .reduce((acc, cur) => (acc += parseFloat(cur)), 0);
            columnAdaAmount[columnAdaAmount.length - 1] = (
              adaAmount - columnAdaAmountWithoutLastSum
            ).toFixed(2);
          }
          this.columnAdaAmount = columnAdaAmount;
        }
        if (this.usdAmount) {
          const usdAmount = parseFloat(this.usdAmount);
          const columnUsdAmount = columnPercent.map((percent) =>
            ((usdAmount / 100) * parseFloat(percent)).toFixed(2)
          );
          if (columnUsdAmount.length > 1) {
            const columnUsdAmountWithoutLastSum = columnUsdAmount
              .slice(0, -1)
              .reduce((acc, cur) => (acc += parseFloat(cur)), 0);
            columnUsdAmount[columnUsdAmount.length - 1] = (
              usdAmount - columnUsdAmountWithoutLastSum
            ).toFixed(2);
          }
          this.columnUsdAmount = columnUsdAmount;
        }
      }
    },

    columns(columns) {
      const [columnRate, , , columnPercent] = columns;
      if (
        columnPercent.reduce((acc, cur) => (acc += parseFloat(cur)), 0) === 100
      ) {
        const finalRate = Array.from(Array(columnRate.length).keys()).reduce(
          (acc, idx) => (acc += columnRate[idx] * (columnPercent[idx] / 100)),
          0
        );
        if (finalRate) {
          this.finalRate = finalRate.toString().slice(0, 17);
          this.finalRateSource = "splits";
          return;
        }
      }
      this.finalRate = this.currentRate.toString().slice(0, 17);
      this.finalRateSource = "current";
    },

    finalRate(finalRate) {
      const rate = parseFloat(finalRate);
      if (this.lastTouchedAmount === "ada") {
        const adaAmount = parseFloat(this.adaAmount);
        let usdAmount = "";
        if (adaAmount === 0) {
          usdAmount = 0;
        } else if (adaAmount) {
          usdAmount = parseFloat((parseFloat(adaAmount) * rate).toFixed(2));
        }
        this.usdAmount = usdAmount.toString();
      } else {
        const usdAmount = parseFloat(this.usdAmount);
        let adaAmount = "";
        if (usdAmount === 0) {
          adaAmount = 0;
        } else if (usdAmount) {
          adaAmount = parseFloat((parseFloat(usdAmount) / rate).toFixed(2));
        }
        this.adaAmount = adaAmount.toString();
      }
    },
  },

  methods: {
    adjustAmountFromAda(e) {
      const rate = this.finalRate || 1;
      const value = parseFloat(e.target.value);
      let usdAmount = "";
      if (value === 0) {
        usdAmount = 0;
      } else if (value) {
        usdAmount = parseFloat((parseFloat(value) * rate).toFixed(2));
      }
      this.usdAmount = usdAmount.toString();
      this.lastTouchedAmount = "ada";
    },

    adjustAmountFromUSD(e) {
      const rate = this.finalRate || 1;
      const value = parseFloat(e.target.value);
      let adaAmount = "";
      if (value === 0) {
        adaAmount = 0;
      } else if (value) {
        adaAmount = parseFloat((parseFloat(value) / rate).toFixed(2));
      }
      this.adaAmount = adaAmount.toString();
      this.lastTouchedAmount = "usd";
    },

    setLastTouchedField({ id }, columnName) {
      this.lastTouchedField = { id, columnName };
      if (columnName.includes("Amount")) {
        this.rowsLastTouchedAmount[id] = columnName.split("Amount")[0];
      }
    },

    distributePercentRemainders(fromField = false) {
      const rowId = fromField ? this.lastTouchedField.id : null;
      const columnPercentEdited = [...this.columnPercentEdited];
      if (columnPercentEdited.length === this.rows.length) {
        if (columnPercentEdited.shift() === rowId) {
          columnPercentEdited.shift();
        }
      }
      if (rowId && !columnPercentEdited.includes(rowId)) {
        columnPercentEdited.push(rowId);
      }
      const distributedIds = this.rows
        .filter(({ id }) => columnPercentEdited.includes(id))
        .map(({ id }) => id);
      const distributionTargetsIds = this.rows
        .filter(({ id }) => !columnPercentEdited.includes(id))
        .map(({ id }) => id);
      const distributedIndexes = distributedIds.map((rowId) =>
        this.rows.findIndex(({ id }) => id === rowId)
      );
      const distributionTargetsIndexes = distributionTargetsIds.map((rowId) =>
        this.rows.findIndex(({ id }) => id === rowId)
      );
      const alreadyDistributedSum = distributedIndexes.reduce(
        (acc, cur) => (acc += parseFloat(this.columnPercent[cur] || 0)),
        0
      );
      const restForDistribute = 100 - alreadyDistributedSum;
      const distributionPortion = Math.round(
        restForDistribute / distributionTargetsIds.length
      );
      const distributions = this.rows.map((row) => {
        if (distributionTargetsIds.includes(row.id)) {
          return distributionPortion;
        }
      });
      const distributionsSum = distributions.reduce(
        (acc, cur) => (acc += cur || 0),
        0
      );
      const sum = alreadyDistributedSum + distributionsSum;
      if (sum > 100) {
        distributions[
          distributionTargetsIndexes[distributionTargetsIndexes.length - 1]
        ] -= sum - 100;
      } else if (sum < 100) {
        distributions[
          distributionTargetsIndexes[distributionTargetsIndexes.length - 1]
        ] += 100 - sum;
      }
      const columnPercent = this.rows.map((row, idx) =>
        distributions[idx] === undefined
          ? this.columnPercent[idx]
          : distributions[idx] > 0
          ? distributions[idx].toString()
          : "0"
      );
      this.columnPercent = columnPercent;
      this.columnPercentEdited = columnPercentEdited;
    },

    addCustomRow() {
      this.transfersCustom.push(Date.now().toString());
    },

    removeRow(id) {
      if (this.transfersSelected.includes(id)) {
        this.transfersSelected.splice(this.transfersSelected.indexOf(id), 1);
      } else {
        this.transfersCustom.splice(this.transfersCustom.indexOf(id), 1);
      }
      this.columnPercentEdited = this.columnPercentEdited.filter(
        (rowId) => id !== rowId
      );
      this.columnPercentLocked = this.columnPercentLocked.filter(
        (rowId) => id !== rowId
      );
      this.$nextTick(this.distributePercentRemainders);
    },
  },

  mounted() {
    const transfers = prepareTransfers(
      this.initialTransfers,
      this.currentTokenCode
    );
    const transfersSelected = transfers.slice(0, 5).map(mapId);
    this.transfers = transfers;
    this.transfersSelected = transfersSelected;
    this.$nextTick(() => {
      this.columnPercent = transfers.map(() =>
        Math.round(100 / this.transfers.length).toString()
      );
      this.$nextTick(this.distributePercentRemainders);
    });
  },
};
</script>
