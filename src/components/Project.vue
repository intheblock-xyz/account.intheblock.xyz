<template>
  <div class="columns is-multiline">
    <div class="column is-6">
      <div class="buttons">
        <b-button @click="newProject">New project</b-button>
        <b-button @click="showPreferencesModal" icon-left="cog"></b-button>

        <b-modal
          v-model="isPreferencesModalActive"
          has-modal-card
          trap-focus
          destroy-on-hide
          aria-role="dialog"
          aria-label="Project preferences modal"
          close-button-aria-label="Close"
          aria-modal
        >
          <template #default="props">
            <preferences-modal
              @close="props.close"
              @submit="submitPreferencesForm"
              :initials="{ projectName: preferences.projectName }"
            ></preferences-modal>
          </template>
        </b-modal>
      </div>
    </div>
    <div class="column is-6">
      <div class="buttons is-right">
        <download-csv :data="toExport" :name="preferences.projectName + '.csv'">
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
    <div v-if="isProjectLoaded" class="column is-12">
      <h3 class="title is-12">
        <span v-if="isProjectNameEditing">
          <b-field>
            <b-input
              v-model="preferences.projectName"
              size="is-large"
              ref="projectNameInput"
              @keypress.native="projectNameEnterButtonHandler"
            ></b-input>
            <p class="control">
              <b-button
                icon-left="check"
                size="is-large"
                @click="disableProjectNameEditing"
              />
            </p>
          </b-field>
        </span>
        <span v-else class="projectName" @click="enableProjectNameEditing">
          {{ preferences.projectName || "[unnamed project]" }}
        </span>
      </h3>
      <ul>
        <li><b>ADA available:</b> {{ $n(adaAvailable) }}</li>
        <li><b>ADA received:</b> {{ $n(adaReceived) }}</li>
        <li><b>ADA sent:</b> {{ $n(Math.abs(adaSent)) }}</li>
        <li>
          <b>Current ADA/USD rate:</b>
          {{ currentRate ? $n(currentRate) : "refreshing..." }}
          <b-button
            type="is-ghost"
            icon-left="refresh"
            :loading="!currentRate"
            @click="loadCurrentRate"
          ></b-button>
        </li>
      </ul>
    </div>
    <div v-if="isProjectLoaded" class="column is-12">
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

        <b-field label="Labels" class="column is-3">
          <b-dropdown v-model="formLabels" multiple aria-role="list">
            <template #trigger>
              <b-button expanded icon-right="menu-down">
                <span v-if="formLabels.length">
                  {{ formLabels.length }} item{{
                    formLabels.length > 1 ? "s" : ""
                  }}
                  selected
                </span>
                <span v-else> No labels selected </span>
              </b-button>
            </template>

            <b-dropdown-item
              v-for="label in labelTitles"
              v-bind:key="label"
              :value="label"
              aria-role="listitem"
            >
              <span>{{ label }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </b-field>

        <b-field
          class="column is-3"
          v-for="label in formLabels"
          v-bind:key="label"
          :label="label"
        >
          <b-input
            v-model="formData.labels[label]"
            @keypress.native="enterButtonHandler"
          ></b-input>
        </b-field>

        <div class="buttons column is-12">
          <b-button
            v-if="isFormUpdate"
            type="is-primary"
            icon-left="check"
            @click="submitUpdate"
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
    <div v-if="isProjectLoaded" class="column is-12">
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
        detailed
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
          :label="label"
          custom-key="label"
          v-slot="props"
          v-for="label in labelTitles"
          v-bind:key="label"
          width="240"
        >
          {{ getLabelValue(label, props.row.labels) || "&ndash;" }}
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

        <template #detail="props">
          <ul v-if="props.row.labels.length">
            <li v-for="label in props.row.labels" v-bind:key="label.title">
              <strong>{{ label.title }}</strong
              >:{{ " " }}{{ label.value }}
            </li>
          </ul>
          <div v-else>No labels</div>
        </template>

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
import PreferencesModal from "./PreferencesModal.vue";

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

function labelTitlesFromTransfers(transfers) {
  const allLabelTitles = transfers.map((transfer) =>
    transfer.labels.map(({ title }) => title)
  );
  return allLabelTitles.reduce((acc, cur) => {
    cur.forEach((title) => {
      if (!acc.includes(title)) {
        acc.push(title);
      }
    });
    return acc;
  }, []);
}

function normalizeTransfersFromCSV(csvArray) {
  const columnNames = csvArray[0];
  const labelTitles = columnNames
    .slice(6)
    .map((name) => name.split("label_")[1]);
  return csvArray.slice(1).map((tArr) => {
    const labels = [];
    tArr.slice(6).map((value, idx) => {
      if (value) {
        labels.push({ title: labelTitles[idx], value });
      }
    });
    return {
      id: tArr[0],
      date: new Date(tArr[1]),
      amountIn: parseFloat(tArr[2]),
      amountOut: parseFloat(tArr[3]),
      balance: parseFloat(tArr[4]),
      rate: parseFloat(tArr[5]),
      labels,
    };
  });
}

function initialFormData(initials = {}) {
  const rate = initials.rate || 1;
  const amount = initials.amountIn || initials.amountOut || null;
  const amountUSD = amount ? Math.round(amount * rate * 100) / 100 : amount;
  const labels = initials.labels
    ? Object.fromEntries(
        initials.labels.map(({ title, value }) => [title, value])
      )
    : {};
  return {
    id: initials.id || null,
    date: initials.date ? new Date(initials.date) : new Date(),
    amount,
    amountUSD,
    rate,
    labels,
  };
}

function normalizeFormData(formData, formLabels, direction) {
  const labels = formLabels.map((title) => ({
    title,
    value: formData.labels[title] || "",
  }));
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
    labels,
  };
}

function dataToExport(transfers, labelTitles) {
  return transfers.map((transfer) => {
    const labels = {};
    labelTitles.forEach((title) => {
      const label = transfer.labels.find((l) => l.title === title);
      labels[`label_${title}`] = label ? label.value : "";
    });
    const date =
      typeof transfer.date === "number"
        ? new Date(transfer.date)
        : transfer.date;
    return {
      id: transfer.id,
      date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      amountIn: transfer.amountIn,
      amountOut: transfer.amountOut,
      balance: transfer.balance,
      rate: transfer.rate,
      ...labels,
    };
  });
}

export default {
  components: { PreferencesModal },

  data() {
    return {
      preferences: {
        projectName: "",
      },
      isProjectLoaded: false,
      transfers: [],
      transfersChecked: [],
      currentRate: null,
      isFormVisible: false,
      isPreferencesModalActive: false,
      isProjectNameEditing: false,
      formData: initialFormData(),
      formLabels: [],
      labelTitles: [],
      defaultLabelTitle: "",
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
      return dataToExport(this.transfers, this.labelTitles);
    },
  },

  methods: {
    loadFromAPI() {
      ProjectAPI.project().then((r) => {
        this.preferences.projectName = r.data.name;
        this.labelTitles = labelTitlesFromTransfers(r.data.transfers);
        this.formLabels = this.labelTitles[0] ? [this.labelTitles[0]] : [];
        this.defaultLabelTitle = this.labelTitles[0] || "Label";
        this.transfersChecked = [];
        this.isFormVisible = false;
        this.isProjectNameEditing = false;
        this.transfers = normalizeTransfersFromJSON(r.data.transfers);
        this.isProjectLoaded = true;
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
            this.preferences.projectName = projectName;
            this.transfers = normalizeTransfersFromCSV(data);
            this.labelTitles = labelTitlesFromTransfers(this.transfers);
            this.formLabels = this.labelTitles[0] ? [this.labelTitles[0]] : [];
            this.defaultLabelTitle = this.labelTitles[0] || "Label";
            this.transfersChecked = [];
            this.isFormVisible = false;
            this.isProjectNameEditing = false;
            this.isProjectLoaded = true;
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

    newProject() {
      this.preferences.projectName = "New project";
      this.isProjectLoaded = true;
      this.transfers = [];
      this.transfersChecked = [];
      this.isFormVisible = false;
      this.isProjectNameEditing = false;
      this.formData = initialFormData();
      this.labelTitles = ["Label"];
      this.defaultLabelTitle = "Label";
      this.formLabels = [this.defaultLabelTitle];
      this.loadCurrentRate();
    },

    showPreferencesModal() {
      this.isPreferencesModalActive = true;
    },

    hidePreferencesModal() {
      this.isPreferencesModalActive = false;
    },

    submitPreferencesForm({ projectName }) {
      this.preferences.projectName = projectName;
      this.hidePreferencesModal();
    },

    enableProjectNameEditing() {
      this.isProjectNameEditing = true;
      this.$nextTick(() => {
        this.$refs.projectNameInput.focus();
      });
    },

    disableProjectNameEditing() {
      this.isProjectNameEditing = false;
    },

    projectNameEnterButtonHandler(e) {
      if (this.isProjectNameEditing && e.keyCode === 13) {
        this.disableProjectNameEditing();
      }
    },

    transferAdd(direction) {
      this.transfers.push(
        normalizeFormData(this.formData, this.formLabels, direction)
      );
    },

    transferEdit() {
      if (this.formData.id) {
        const tIndex = this.transfers.findIndex(idIs(this.formData.id));
        const direction = this.transfers[tIndex].amountIn ? "in" : "out";
        this.transfers.splice(
          tIndex,
          1,
          normalizeFormData(this.formData, this.formLabels, direction)
        );
      }
    },

    transferRemove(row) {
      this.transfers = this.transfers.filter(idIsNot(row.id));
      this.transfersChecked = this.transfersChecked.filter(idIsNot(row.id));
      this.adjustBalance();
    },

    getLabelValue(title, labels) {
      let value;
      if (labels) {
        const label = labels.find((l) => l.title === title);
        if (label) {
          return label.value;
        }
      } else {
        value = this.formData.labels[title];
      }
      return value || "";
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
      this.formLabels = row.labels.map((l) => l.title);
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
      this.formLabels = [this.defaultLabelTitle];
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
      if (this.formData.amount) {
        this.transferAdd("out");
        this.adjustBalance();
      }
      this.hideForm();
    },

    submitAddReceive() {
      if (this.formData.amount) {
        this.transferAdd("in");
        this.adjustBalance();
      }
      this.hideForm();
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
h3 span.projectName {
  cursor: pointer;
}

input[type="file"] {
  display: none;
}

ul li button {
  padding: 0;
  margin: 0 8px 0 4px;
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
