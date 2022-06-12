<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Rate calculator</p>
    </header>
    <section class="modal-card-body">
      <div class="columns">
        <b-field label="₳ Amount" class="column is-3">
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
                >{{ $d(transfer.date, "short") }} / ₳{{ transfer.amount }} /
                {{ transfer.rate }}</span
              >
            </b-dropdown-item>
          </b-dropdown>
        </b-field>
      </div>
      <div v-if="columns.length">
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
              <b-button class="button is-static" label="₳" />
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

          <b-field class="column is-2">
            <b-input
              type="number"
              step="0.01"
              required
              v-model="columnPercent[idx]"
              v-bind="{ readonly: true }"
              @focus="setLastTouchedField(row, 'percent')"
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
      </div>
      <div class="columns">
        <b-field label="Calculated Rate" class="column is-4 is-offset-3">
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

function prepareTransfers(initialTransfers) {
  return Object.freeze(
    initialTransfers
      .filter((transfer) => transfer.amountIn > 0)
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
  },

  watch: {
    transfersSelected(transferIds) {
      this.rows = [
        ...transferIds.map((id) => ({ id, isCustom: false })),
        ...this.rows.filter(({ isCustom }) => isCustom),
      ];
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
              this.currentRate.toString()
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

    columnAdaAmount(columnAdaAmount) {
      const columnPercent = columnAdaAmount.map((adaAmount) =>
        ((1 / this.totalAmount) * +adaAmount * 100).toFixed(2)
      );
      columnPercent[columnPercent.length - 1] = (
        Math.round(
          columnPercent.slice(0, -1).reduce((acc, cur) => (acc -= +cur), 100) *
            100
        ) / 100
      ).toFixed(2);
      this.columnPercent = columnPercent;
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
      }
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

    columns(columns) {
      const [columnRate, , , columnPercent] = columns;
      if (columnRate.length === columnPercent.length) {
        this.finalRate = (
          Array.from(Array(columnRate.length).keys()).reduce(
            (acc, idx) => (acc += columnRate[idx] * (columnPercent[idx] / 100)),
            0
          ) || this.currentRate
        )
          .toString()
          .slice(0, 17);
      }
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

    addCustomRow() {
      this.transfersCustom.push(Date.now().toString());
    },

    removeRow(id) {
      if (this.transfersSelected.includes(id)) {
        this.transfersSelected.splice(this.transfersSelected.indexOf(id), 1);
      } else {
        this.transfersCustom.splice(this.transfersCustom.indexOf(id), 1);
      }
    },
  },

  mounted() {
    const transfers = prepareTransfers(this.initialTransfers);
    const transfersSelected = transfers.slice(0, 5).map(mapId);
    this.transfers = transfers;
    this.transfersSelected = transfersSelected;
  },
};
</script>
