<template>
  <div class="columns is-multiline">
    <div class="column is-12">
      <div class="buttons is-right">
        <download-csv :data="toExport" :name="projectName + '.csv'">
          <b-button :disabled="!transfers.length">Export to .csv</b-button>
        </download-csv>
        <input
          type="file"
          accept=".csv"
          ref="fileInput"
          @change="loadFromFile"
        />
        <b-button @click="$refs.fileInput.click()">Import from .csv</b-button>
      </div>
    </div>
    <div v-if="projectName" class="column is-12">
      <h3 class="title is-3">{{ projectName }}</h3>
      <ul>
        <li><b>ADA available:</b> {{ $n(adaAvailable) }}</li>
        <li><b>ADA received:</b> {{ $n(adaReceived) }}</li>
        <li><b>ADA sent:</b> {{ $n(Math.abs(adaSent)) }}</li>
        <li>
          <b>Current ADA/USD rate:</b>
          <b-button
            type="is-ghost"
            icon-left="refresh"
            :loading="!currentRate"
            @click="loadCurrentRate"
          ></b-button>
          {{ currentRate ? $n(currentRate) : "refreshing..." }}
        </li>
      </ul>
    </div>
    <div v-if="projectName" class="column is-12">
      <div v-if="isFormVisible" class="box columns is-multiline">
        <b-field label="Date" class="column is-3">
          <b-datepicker
            editable
            :locale="locale"
            icon="calendar-today"
            placeholder="Type or select a date..."
            v-model="formData.date"
          ></b-datepicker>
        </b-field>

        <b-field label="₳ Amount" class="column is-2">
          <b-input
            type="number"
            step="0.01"
            required
            v-model="formData.amount"
            @keyup.native="adjustTransferAmountFromAda"
          ></b-input>
        </b-field>

        <b-field label="$ Amount" class="column is-2">
          <b-input
            type="number"
            step="0.01"
            required
            v-model="formData.amountUSD"
            @keyup.native="adjustTransferAmountFromUSD"
          ></b-input>
        </b-field>

        <b-field label="ADA/USD rate" class="column is-2">
          <b-input
            type="number"
            step="0.000000000000001"
            required
            v-model="formData.rate"
            @keypress.native="enterButtonHandler"
          ></b-input>
        </b-field>

        <b-field label="Label" class="column is-3">
          <b-input
            v-model="formData.label"
            @keypress.native="enterButtonHandler"
          ></b-input>
        </b-field>

        <div class="buttons column is-12">
          <b-button v-if="isFormUpdate" type="is-primary" @click="submitUpdate"
            >Save</b-button
          >
          <b-button
            v-if="!isFormUpdate"
            type="is-primary"
            icon-left="arrow-up"
            @click="submitAddSent"
            >Pay</b-button
          >
          <b-button
            v-if="!isFormUpdate"
            type="is-primary"
            icon-left="arrow-down"
            @click="submitAddReceive"
            >Receive</b-button
          >
          <b-button @click="hideForm">Cancel</b-button>
        </div>
      </div>
      <div v-else class="buttons">
        <b-button type="is-primary" icon-left="plus-thick" @click="showForm"
          >Add transfer</b-button
        >
        <b-button
          type="is-primary"
          icon-left="cash-multiple"
          @click="makePayment"
          >Make payment</b-button
        >
      </div>
    </div>
    <div v-if="projectName" class="column is-12">
      <b-table
        checkable
        checkbox-position="left"
        checkbox-type="is-primary"
        default-sort="date"
        default-sort-direction="desc"
        paginated
        pagination-size="is-small"
        pagination-simple
        per-page="10"
        :data="transfers"
        :checked-rows.sync="transfersChecked"
      >
        <b-table-column
          field="date"
          label="Date"
          v-slot="props"
          width="240"
          sortable
        >
          {{ $d(props.row.date, "short") }}
        </b-table-column>

        <b-table-column custom-key="in" label="ADA in" v-slot="props" numeric>
          {{ props.row.amountIn || "&ndash;" }}
        </b-table-column>

        <b-table-column custom-key="out" label="ADA out" v-slot="props" numeric>
          {{ props.row.amountOut || "&ndash;" }}
        </b-table-column>

        <b-table-column
          custom-key="balance"
          label="Balance"
          v-slot="props"
          numeric
        >
          {{ props.row.balance || "&ndash;" }}
        </b-table-column>

        <b-table-column
          custom-key="exchange"
          label="Exchange"
          v-slot="props"
          numeric
        >
          {{
            $n(
              (props.row.amountIn || props.row.amountOut) * props.row.rate,
              "currency"
            )
          }}
        </b-table-column>

        <b-table-column
          field="rate"
          label="ADA/USD rate"
          v-slot="props"
          numeric
          sortable
        >
          {{ $n(props.row.rate) }}
        </b-table-column>

        <b-table-column
          field="label"
          label="Label"
          v-slot="props"
          width="240"
          sortable
        >
          {{ props.row.label }}
        </b-table-column>

        <b-table-column custom-key="actions" v-slot="props" width="70">
          <div class="actionButtons">
            <b-button
              size="is-small"
              icon-left="pencil-outline"
              @click="transferToForm(props.row)"
            ></b-button>
            <b-button
              size="is-small"
              type="is-danger is-light"
              icon-left="delete-outline"
              @click="transferRemove(props.row)"
            ></b-button>
          </div>
        </b-table-column>

        <template #empty>
          <div class="has-text-centered">No transfers</div>
        </template>
        <template #bottom-left>
          <b>Total transfers</b>: {{ transfers.length }}
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import Papa from "papaparse";
import CoinGeckoAPI from "coingecko-api";
import { mapGetters } from "vuex";
import ProjectAPI from "@/api/project.js";

const idIs = (id) => (t) => t.id === id;
const idIsNot = (id) => (t) => t.id !== id;

const received = (t) => !!t.amountIn;
const sent = (t) => !!t.amountOut;

const sum = (acc, { amountIn, amountOut }) => (acc += amountIn || amountOut);

function normalizeTransfersFromJSON(transfers) {
  let balance = 0;
  return transfers
    .sort((a, b) => a.date - b.date)
    .map((transfer) => ({
      ...transfer,
      rate: parseFloat(transfer.rate.toFixed(15)),
      balance: transfer.amountIn
        ? (balance += transfer.amountIn)
        : (balance -= transfer.amountOut),
      date: new Date(transfer.date),
    }));
}

function normalizeTransfersFromCSV(csvArray) {
  let balance = 0;
  return csvArray.slice(1).map((tArr) => ({
    id: tArr[0],
    date: new Date(parseInt(tArr[1], 10)),
    amountIn: parseFloat(tArr[2]),
    amountOut: parseFloat(tArr[3]),
    balance: tArr[2]
      ? (balance += parseFloat(tArr[2]))
      : (balance -= parseFloat(tArr[3])),
    rate: parseFloat(tArr[4]),
    label: tArr[5],
  }));
}

function initialFormData(initials = {}) {
  const rate = initials.rate || 1;
  const amount = initials.amountIn || initials.amountOut || null;
  const amountUSD = amount ? Math.round(amount * rate * 100) / 100 : amount;
  return {
    id: initials.id || null,
    date: initials.date ? new Date(initials.date) : new Date(),
    amount,
    amountUSD,
    rate,
    label: initials.label || "",
  };
}

function normalizeFormData(formData, direction) {
  return {
    ...formData,
    id: formData.id || Date.now().toString(),
    date: formData.date.getTime ? formData.date.getTime() : formData.date,
    amountIn:
      direction === "in" ? parseFloat(formData.amount || formData.amountIn) : 0,
    amountOut:
      direction === "out"
        ? parseFloat(formData.amount || formData.amountOut)
        : 0,
    rate: parseFloat(formData.rate),
  };
}

export default {
  data() {
    return {
      projectName: "",
      transfers: [],
      transfersChecked: [],
      currentRate: null,
      isFormVisible: false,
      formData: initialFormData(),
      coinGeckoAPI: Object.freeze(new CoinGeckoAPI()),
    };
  },

  computed: {
    ...mapGetters("user", ["locale"]),

    isFormUpdate() {
      return this.isFormVisible && !!this.formData.id;
    },

    adaReceived() {
      return this.transfers.filter(received).reduce(sum, 0);
    },

    adaSent() {
      return this.transfers.filter(sent).reduce(sum, 0);
    },

    adaAvailable() {
      return this.adaReceived - this.adaSent;
    },

    toExport() {
      return this.transfers.map((transfer) =>
        normalizeFormData(transfer, transfer.amountIn ? "in" : "out")
      );
    },
  },

  methods: {
    loadFromAPI() {
      ProjectAPI.project().then((r) => {
        this.projectName = r.data.name;
        this.transfers = normalizeTransfersFromJSON(r.data.transfers);
      });
    },

    loadFromFile(e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const projectName = file.name.split(/.csv$/)[0];
        Papa.parse(file, {
          error: (error) => {
            this.$buefy.toast.open({
              message: `Error parsing the file: "${error}"`,
              type: "is-danger",
              duration: 3000,
            });
          },
          complete: ({ data }) => {
            this.projectName = projectName;
            this.transfers = normalizeTransfersFromCSV(data);
          },
        });
      }
    },

    loadCurrentRate() {
      if (process.env.NODE_ENV === "development") {
        const rate = 0.5;
        this.currentRate = rate;
        if (!this.isFormVisible) {
          this.formData.rate = rate;
        }
      } else {
        this.currentRate = null;
        this.coinGeckoAPI.simple
          .price({ ids: ["cardano"], vs_currencies: ["usd"] })
          .then((result) => {
            if (result.success) {
              const rate = parseFloat(result.data.cardano.usd.toFixed(15));
              this.currentRate = rate;
              if (!this.isFormVisible) {
                this.formData.rate = rate;
              }
            }
          });
      }
    },

    transferAdd(direction) {
      this.transfers.push(normalizeFormData(this.formData, direction));
    },

    transferEdit() {
      if (this.formData.id) {
        const tIndex = this.transfers.findIndex(idIs(this.formData.id));
        const direction = this.transfers[tIndex].amountIn ? "in" : "out";
        this.transfers.splice(
          tIndex,
          1,
          normalizeFormData(this.formData, direction)
        );
      }
    },

    transferRemove(row) {
      this.transfers = this.transfers.filter(idIsNot(row.id));
      this.transfersChecked = this.transfersChecked.filter(idIsNot(row.id));
      this.adjustBalance();
    },

    adjustBalance() {
      let balance = 0;
      this.transfers = this.transfers.map((t) => ({
        ...t,
        balance: t.amountIn
          ? (balance += t.amountIn)
          : (balance -= t.amountOut),
      }));
    },

    transferToForm(row) {
      this.formData = initialFormData(row);
      this.showForm();
    },

    showForm() {
      this.isFormVisible = true;
    },

    hideForm() {
      this.isFormVisible = false;
      this.resetForm();
    },

    resetForm() {
      this.formData = initialFormData({ rate: this.currentRate || 1 });
    },

    adjustTransferAmountFromAda(e) {
      const rate = this.formData.rate || 1;
      const value = parseFloat(e.target.value);
      let amountUSD = "";
      if (value === 0) {
        amountUSD = 0;
      } else if (value) {
        amountUSD = parseFloat((parseFloat(value) * rate).toFixed(2));
      }
      this.formData.amountUSD = amountUSD.toString();
    },

    adjustTransferAmountFromUSD(e) {
      const rate = this.formData.rate || 1;
      const value = parseFloat(e.target.value);
      let amount = "";
      if (value === 0) {
        amount = 0;
      } else if (value) {
        amount = parseFloat((parseFloat(value) / rate).toFixed(2));
      }
      this.formData.amount = amount.toString();
    },

    enterButtonHandler(e) {
      if (this.isFormUpdate && e.keyCode === 13) {
        this.submitUpdate();
      }
    },

    submitUpdate() {
      this.transferEdit();
      this.hideForm();
      this.adjustBalance();
    },

    submitAddSent() {
      this.transferAdd("out");
      this.hideForm();
      this.adjustBalance();
    },

    submitAddReceive() {
      this.transferAdd("in");
      this.hideForm();
      this.adjustBalance();
    },

    makePayment() {
      alert("Not implemented yet.");
    },
  },

  mounted() {
    this.loadFromAPI();
    this.loadCurrentRate();
  },
};
</script>

<style lang="scss" scoped>
input[type="file"] {
  display: none;
}

ul li button {
  padding: 0;
  margin: 0 6px 0 8px;
  height: 17px;
  vertical-align: baseline;
}

.actionButtons {
  width: 70px;
  display: flex;
  justify-content: space-between;

  &::v-deep i {
    font-size: 16px;
  }
}
</style>
