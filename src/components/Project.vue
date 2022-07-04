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
              :isPaidAccount="isPaidAccount"
              :presistedTokensCodes="transfersTokensCodesSet"
              :initials="{
                projectName: projectName,
                labelTitles,
                enabledTokensCodes,
              }"
            ></preferences-modal>
          </template>
        </b-modal>
      </div>
    </div>
    <div class="column is-6">
      <div class="buttons is-right">
        <download-csv :data="toExport" :name="projectName + '.csv'">
          <b-button :disabled="!transfers.length">Export to .csv</b-button>
        </download-csv>
        <input
          type="file"
          accept=".csv"
          ref="fileInput"
          v-on:change="loadFromFile"
        />
        <b-button @click="$refs.fileInput.click()">Import from .csv</b-button>
      </div>
    </div>
    <div v-if="isProjectLoaded" class="column is-12">
      <h3 class="title is-3">
        <span v-if="isProjectNameEditing">
          <b-field>
            <b-input
              v-model="projectName"
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
          {{ projectName || "[unnamed project]" }}
        </span>
      </h3>
    </div>
    <div
      v-for="token in tokensOverview"
      v-bind:key="token.code"
      class="column is-3"
    >
      <ul v-if="isProjectLoaded">
        <li>
          <b>{{ token.code.toUpperCase() }} available:</b>
          {{ $n(token.available) }}
        </li>
        <li>
          <b>{{ token.code.toUpperCase() }} received:</b>
          {{ $n(token.received) }}
        </li>
        <li>
          <b>{{ token.code.toUpperCase() }} sent:</b>
          {{ $n(token.sent) }}
        </li>
        <li>
          <b>Current {{ token.code.toUpperCase() }}/USD rate:</b>
          {{ currentRates[token.code] ? $n(currentRates[token.code]) : "..." }}
        </li>
      </ul>
    </div>
    <div v-if="isProjectLoaded" class="column is-12">
      <ul>
        <li>
          <b>USD available:</b>
          {{ $n(usdAvailable, "currency") }}
        </li>
        <li>
          <b>USD received:</b>
          {{ $n(usdReceived, "currency") }}
        </li>
        <li>
          <b>USD sent:</b>
          {{ $n(usdSent, "currency") }}
        </li>
      </ul>
    </div>
    <div v-if="isProjectLoaded" class="column is-12">
      <div class="buttons">
        <b-button
          @click="loadCurrentRate"
          size="is-small"
          icon-left="refresh"
          :loading="currentRates.ada === null"
          >Refresh rates</b-button
        >
      </div>
    </div>
    <div v-if="isProjectLoaded" class="column is-12">
      <hr />
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

        <b-field
          :label="`${isMultipleTokensEnabled ? '' : '₳ '}Amount`"
          class="column is-3"
        >
          <b-input
            type="number"
            step="0.01"
            required
            v-model="formData.amount"
            @keyup.native="adjustTransferAmountFromAda"
          ></b-input>
          <p class="control" v-if="!this.isFormUpdate">
            <b-dropdown
              aria-role="list"
              v-model="formData.tokenCode"
              position="is-bottom-left"
            >
              <template #trigger="{ active }">
                <b-button
                  :label="formData.tokenCode.toUpperCase()"
                  :icon-right="active ? 'menu-up' : 'menu-down'"
                />
              </template>

              <b-dropdown-item
                aria-role="listitem"
                :value="tokenCode"
                v-for="tokenCode in enabledTokensCodes"
                v-bind:key="tokenCode"
                >{{ tokenCode.toUpperCase() }}</b-dropdown-item
              >
            </b-dropdown>
          </p>
          <p class="control" v-if="this.isFormUpdate">
            <b-button disabled :label="formData.tokenCode.toUpperCase()" />
          </p>
        </b-field>

        <b-field label="$ Amount" class="column is-3">
          <b-input
            type="number"
            step="0.01"
            required
            v-model="formData.amountUSD"
            @keyup.native="adjustTransferAmountFromUSD"
          ></b-input>
        </b-field>

        <b-field
          :label="isMultipleTokensEnabled ? 'Rate' : 'ADA/USD rate'"
          class="column is-3"
        >
          <b-input
            type="number"
            step="0.000000000000001"
            required
            v-model="formData.rate"
            @keyup.native="adjustTransferAmountsFromRate"
            @keypress.native="enterButtonHandler"
          ></b-input>
          <p class="control" v-if="!isFormUpdate">
            <b-button icon-left="alarm-panel" @click="showRateModal"></b-button>
          </p>
          <b-modal
            v-if="!isFormUpdate"
            v-model="isRateModalActive"
            full-screen
            has-modal-card
            trap-focus
            destroy-on-hide
            aria-role="dialog"
            aria-label="Rate calculation modal"
            close-button-aria-label="Close"
            aria-modal
          >
            <template #default="props">
              <rate-modal
                @close="props.close"
                @submit="submitRateForm"
                :initialTransfers="transfers"
                :currentRate="formData.rate"
                :currentTokenCode="formData.tokenCode"
                :initialAdaAmount="formData.amount"
                :initialUsdAmount="formData.amountUSD"
                :initialLastTouchedAmount="lastTouchedAmount"
              ></rate-modal>
            </template>
          </b-modal>
        </b-field>

        <!-- <b-field label="Labels" class="column is-3" v-if="labelTitles.length">
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
        </b-field> -->

        <b-field
          class="column is-3"
          v-for="label in labelTitles"
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
        default-sort="date"
        default-sort-direction="desc"
        paginated
        pagination-size="is-small"
        pagination-simple
        per-page="10"
        :data="transfers"
      >
        <b-table-column
          field="date"
          label="Date"
          v-slot="props"
          width="205"
          sortable
        >
          {{ $d(props.row.date, "short") }}
        </b-table-column>

        <b-table-column
          custom-key="in"
          :label="`${isMultipleTokensEnabled ? 'In' : 'ADA in'}`"
          v-slot="props"
          numeric
        >
          {{ props.row.amountIn || "&ndash;" }}
        </b-table-column>

        <b-table-column
          custom-key="out"
          :label="`${isMultipleTokensEnabled ? 'Out' : 'ADA out'}`"
          v-slot="props"
          numeric
        >
          {{ props.row.amountOut || "&ndash;" }}
        </b-table-column>

        <b-table-column
          field="tokenCode"
          label="Token"
          v-slot="props"
          v-if="isMultipleTokensEnabled"
        >
          {{ props.row.tokenCode ? props.row.tokenCode.toUpperCase() : "ADA" }}
        </b-table-column>

        <b-table-column
          custom-key="balance"
          label="Balance"
          v-slot="props"
          numeric
        >
          {{
            isMultipleTokensEnabled
              ? $n(props.row.balanceUsd, "currency")
              : props.row.balance || "&ndash;"
          }}
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
          :label="isMultipleTokensEnabled ? 'Rate' : 'ADA/USD rate'"
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

        <!-- <template #detail="props">
          <ul v-if="props.row.labels.length">
            <li v-for="label in props.row.labels" v-bind:key="label.title">
              <strong>{{ label.title }}</strong
              >:{{ " " }}{{ label.value }}
            </li>
          </ul>
          <div v-else>No labels</div>
        </template> -->

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
import RateModal from "./RateModal.vue";

const idIs = (id) => (t) => t.id === id;
const idIsNot = (id) => (t) => t.id !== id;

const received = (t) => !!t.amountIn;
const sent = (t) => !!t.amountOut;

const sum = (acc, { amountIn, amountOut }) => (acc += amountIn || amountOut);

// const tokensOnGecko = [
//   "ardana",
//   "cardano",
//   "charli3",
//   "gero",
//   "hosky",
//   "iagon",
//   "meld",
//   "nft-maker",
//   "nitroex",
//   "pavia",
//   "world-mobile-token",
// ];

const coinGeckoTokensCodes = {
  aada: "ardana",
  ada: "cardano",
  charli3: "charli3",
  gero: "gerowallet",
  hosky: "hosky",
  iagon: "iagon",
  meld: "meld",
  nftm: "nft-maker",
  nitroex: "nitroex",
  pavia: "pavia",
  wmtoken: "world-mobile-token",
};

const coinGeckoTokensCodesReverse = {
  ardana: "aada",
  cardano: "ada",
  charli3: "charli3",
  gerowallet: "gero",
  hosky: "hosky",
  iagon: "iagon",
  meld: "meld",
  "nft-maker": "nftm",
  nitroex: "nitroex",
  pavia: "pavia",
  "world-mobile-token": "wmtoken",
};

function normalizeTransfersFromJSON(transfers) {
  let balance = 0;
  let balanceUsd = 0;
  return transfers
    .sort((a, b) => a.date - b.date)
    .map((transfer) => ({
      ...transfer,
      rate: parseFloat(transfer.rate.toFixed(15)),
      balance: transfer.amountIn
        ? (balance += transfer.amountIn)
        : (balance -= transfer.amountOut),
      balanceUsd: (transfer.amountIn
        ? (balanceUsd += transfer.amountIn * parseFloat(transfer.rate))
        : (balanceUsd -= transfer.amountOut * parseFloat(transfer.rate))
      ).toFixed(2),
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
    .slice(7)
    .map((name) => name.split("label_")[1]);
  return csvArray.slice(1).map((tArr) => {
    const labels = [];
    tArr.slice(7).map((value, idx) => {
      if (value) {
        labels.push({ title: labelTitles[idx], value });
      }
    });
    return {
      id: tArr[0],
      date: new Date(tArr[1]),
      amountIn: parseFloat(tArr[2]),
      amountOut: parseFloat(tArr[3]),
      tokenCode: tArr[4],
      balance: parseFloat(tArr[5]),
      rate: parseFloat(tArr[6]),
      labels,
    };
  });
}

function initialFormData(currentRates = {}, initials = {}) {
  const tokenCode = initials.tokenCode || "";
  const rate = initials.rate || currentRates[tokenCode] || 1;
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
    tokenCode,
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
      tokenCode: transfer.tokenCode,
      balance: transfer.balance,
      rate: transfer.rate,
      ...labels,
    };
  });
}

export default {
  components: { PreferencesModal, RateModal },

  data() {
    return {
      projectName: "",
      isProjectLoaded: false,
      transfers: [],
      currentRate: null,
      currentRates: { ada: null },
      lastTouchedAmount: "ada",
      isFormVisible: false,
      isPreferencesModalActive: false,
      isRateModalActive: false,
      isProjectNameEditing: false,
      formData: initialFormData(),
      formLabels: [],
      labelTitles: [],
      defaultLabelTitle: "",
      enabledTokensCodes: ["ada"],
      coinGeckoAPI: Object.freeze(new CoinGeckoAPI()),
    };
  },

  computed: {
    ...mapGetters("user", ["locale", "isPaidAccount", "savedTransfers"]),

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

    usdReceived() {
      return this.transfers
        .filter(received)
        .reduce(
          (acc, { amountIn, amountOut, rate }) =>
            (acc += (amountIn || amountOut) * rate),
          0
        );
    },

    usdSent() {
      return this.transfers
        .filter(sent)
        .reduce(
          (acc, { amountIn, amountOut, rate }) =>
            (acc += (amountIn || amountOut) * rate),
          0
        );
    },

    usdAvailable() {
      return this.usdReceived - this.usdSent;
    },

    isMultipleTokensEnabled() {
      return this.isPaidAccount;
    },

    multiTokenUI() {
      return (
        this.isPaidAccount &&
        (!this.transfersTokensCodesSet.has("ada") ||
          this.transfersTokensCodesSet.size > 1)
      );
    },

    transfersTokensCodesSet() {
      return new Set(
        this.transfers.map((transfer) => transfer.tokenCode || "ada")
      );
    },

    geckoApiTokensIds() {
      return Object.fromEntries(
        this.enabledTokensCodes.map((tokenCode) => [
          tokenCode,
          coinGeckoTokensCodes[tokenCode],
        ])
      );
    },

    tokensOverview() {
      return this.enabledTokensCodes.map((tokenCode) => {
        const received = this.transfers
          .filter((t) => !!t.amountIn && t.tokenCode === tokenCode)
          .reduce(sum, 0);
        const sent = this.transfers
          .filter((t) => !!t.amountOut && t.tokenCode === tokenCode)
          .reduce(sum, 0);
        const available = received - sent;
        return {
          code: tokenCode,
          received,
          sent,
          available,
        };
      });
    },

    toExport() {
      return dataToExport(this.transfers, this.labelTitles);
    },
  },

  methods: {
    loadFromStore() {
      if (this.isPaidAccount) {
        try {
          const data = JSON.parse(this.savedTransfers);
          this.projectName = data.projectName;
          this.labelTitles = labelTitlesFromTransfers(data.transfers);
          this.formLabels = this.labelTitles;
          this.defaultLabelTitle = this.labelTitles[0];
          this.isFormVisible = false;
          this.isProjectNameEditing = false;
          this.transfers = data.transfers;
          this.enabledTokensCodes = Array.from(this.transfersTokensCodesSet);
          this.formData = initialFormData(this.currentRates, {
            tokenCode: this.enabledTokensCodes[0] || "",
          });
          this.isProjectLoaded = true;
          return true;
        } catch {
          void 0;
        }
      }
      return false;
    },

    loadFromAPI() {
      ProjectAPI.project().then((r) => {
        this.projectName = r.data.name;
        this.labelTitles = labelTitlesFromTransfers(r.data.transfers);
        this.formLabels = this.labelTitles;
        this.defaultLabelTitle = this.labelTitles[0];
        this.isFormVisible = false;
        this.isProjectNameEditing = false;
        this.transfers = normalizeTransfersFromJSON(r.data.transfers);
        this.enabledTokensCodes = Array.from(this.transfersTokensCodesSet);
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
            const transfers = normalizeTransfersFromCSV(data);
            if (
              new Set(transfers.map((transfer) => transfer.tokenCode || "ada"))
                .size > 1 &&
              !this.isPaidAccount
            ) {
              alert("Multitoken projects available only in paid account");
            } else {
              this.projectName = projectName;
              this.transfers = transfers;
              this.enabledTokensCodes = Array.from(
                this.transfersTokensCodesSet
              );
              this.labelTitles = labelTitlesFromTransfers(transfers);
              this.formLabels = this.labelTitles;
              this.defaultLabelTitle = this.labelTitles[0];
              this.isFormVisible = false;
              this.isProjectNameEditing = false;
              this.isProjectLoaded = true;
              this.adjustBalance();
            }
          },
        });
      }
      this.$refs.fileInput.value = null;
    },

    loadCurrentRate() {
      // if (process.env.NODE_ENV === "development") {
      //   const rate = 0.5
      //   this.currentRate = rate
      //   if (!this.isFormVisible) {
      //     this.formData.rate = rate
      //   }
      // } else {
      this.currentRate = null;
      this.currentRates = { ada: null };
      this.coinGeckoAPI.simple
        .price({
          ids: Object.values(this.geckoApiTokensIds),
          vs_currencies: ["usd"],
        })
        .then((result) => {
          if (result.success) {
            // const rate = parseFloat(result.data.cardano.usd.toFixed(15))
            // this.currentRate = rate
            //   Object.fromEntries(
            //     Object.keys(result.data).map((tokenId) => [
            //       coinGeckoTokensCodesReverse[tokenId],
            //       parseFloat(result.data[tokenId].usd.toFixed(15)),
            //     ])
            //   )
            // )
            this.currentRates = Object.fromEntries(
              Object.keys(result.data).map((tokenId) => [
                coinGeckoTokensCodesReverse[tokenId],
                parseFloat(result.data[tokenId].usd.toFixed(15)),
              ])
            );
            if (!this.isFormVisible && Object.keys(result.data).length) {
              this.formData.rate =
                this.currentRates.ada ||
                this.currentRates[this.enabledTokensCodes[0]];
            }
          }
        });
      // }
    },

    newProject() {
      this.projectName = "New project";
      this.isProjectLoaded = true;
      this.transfers = [];
      this.enabledTokensCodes = ["ada"];
      this.isFormVisible = false;
      this.isProjectNameEditing = false;
      this.formData = initialFormData(this.currentRates, {
        tokenCode: this.enabledTokensCodes[0] || "",
      });
      this.labelTitles = ["Label"];
      this.defaultLabelTitle = "Label";
      this.formLabels = [this.defaultLabelTitle];
      this.loadCurrentRate();
    },

    showPreferencesModal() {
      this.isProjectNameEditing = false;
      this.isFormVisible = false;
      this.isPreferencesModalActive = true;
    },

    hidePreferencesModal() {
      this.isPreferencesModalActive = false;
    },

    submitPreferencesForm({
      projectName,
      labelTitles,
      labelTitlesOrder,
      enabledTokensCodes,
    }) {
      this.projectName = projectName;
      const updatedTransfers = [];
      const updatedLabelTitles = [];
      const renamedLabels = [];
      const labelRenames = {};
      const newLabelTitles = labelTitlesOrder.filter(
        (title) => !this.labelTitles.includes(title)
      );
      const removedLabels = this.labelTitles.filter(
        (title) => !labelTitlesOrder.includes(title)
      );
      labelTitlesOrder.forEach((key) => {
        if (labelTitles[key]) {
          updatedLabelTitles.push(labelTitles[key]);
          if (key !== labelTitles[key]) {
            if (!newLabelTitles.includes(key)) {
              renamedLabels.push(key);
              labelRenames[key] = labelTitles[key];
            }
          }
        }
      });
      for (const transfer of this.transfers) {
        const labels = [];
        for (const label of transfer.labels) {
          if (renamedLabels.includes(label.title)) {
            labels.push({ ...label, title: labelRenames[label.title] });
          } else if (!removedLabels.includes(label.title)) {
            labels.push({ ...label });
          }
        }
        updatedTransfers.push({ ...transfer, labels });
      }
      this.labelTitles = updatedLabelTitles;
      this.enabledTokensCodes = Array.from(
        new Set(enabledTokensCodes, Array.from(this.transfersTokensCodesSet))
      );
      this.transfers = updatedTransfers;
      this.formLabels = [...this.labelTitles];
      this.defaultLabelTitle = this.formLabels[0];
      this.hidePreferencesModal();
    },

    showRateModal() {
      this.isRateModalActive = true;
    },

    hideRateModal() {
      this.isRateModalActive = false;
    },

    submitRateForm({ finalRate, adaAmount, usdAmount, lastTouchedAmount }) {
      this.lastTouchedAmount = lastTouchedAmount;
      this.formData.rate = finalRate;
      this.formData.amount = adaAmount;
      this.formData.amountUSD = usdAmount;
      this.hideRateModal();
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

    saveTransfersToStore(transfers) {
      const data = {
        projectName: this.projectName,
        transfers: transfers || this.transfers,
      };
      if (this.isPaidAccount) {
        this.$store.commit("user/setSavedTransfers", JSON.stringify(data));
      }
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
      let balanceUsd = 0;
      this.transfers = this.transfers.map((t) => ({
        ...t,
        balance: t.amountIn
          ? (balance += t.amountIn)
          : (balance -= t.amountOut),
        balanceUsd: t.amountIn
          ? (balanceUsd += t.amountIn * t.rate)
          : (balanceUsd -= t.amountOut * t.rate),
      }));
    },

    transferToForm(row) {
      this.formData = initialFormData(this.currentRates, row);
      this.formLabels = [...this.labelTitles];
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
      this.formData = initialFormData(this.currentRates, {
        tokenCode: this.enabledTokensCodes[0] || "",
      });
      this.formLabels = [...this.labelTitles];
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
      this.lastTouchedAmount = "ada";
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
      this.lastTouchedAmount = "usd";
    },

    adjustTransferAmountsFromRate(e) {
      const rate = e
        ? parseFloat(e.target.value)
        : parseFloat(this.formData.rate);
      if (rate) {
        if (this.lastTouchedAmount === "ada") {
          const adaAmount = parseFloat(this.formData.amount);
          let usdAmount = "";
          if (adaAmount === 0) {
            usdAmount = 0;
          } else if (adaAmount) {
            usdAmount = parseFloat((parseFloat(adaAmount) * rate).toFixed(2));
          }
          this.formData.amountUSD = usdAmount.toString();
        } else {
          const usdAmount = parseFloat(this.formData.amountUSD);
          let adaAmount = "";
          if (usdAmount === 0) {
            adaAmount = 0;
          } else if (usdAmount) {
            adaAmount = parseFloat((parseFloat(usdAmount) / rate).toFixed(2));
          }
          this.formData.amount = adaAmount.toString();
        }
      }
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

  watch: {
    isPaidAccount(isPaidAccount) {
      if (!isPaidAccount) {
        const isAdaOnly =
          this.transfersTokensCodesSet.size === 1 &&
          this.transfersTokensCodesSet.has("ada");
        if (!isAdaOnly) {
          this.newProject();
        }
      } else {
        if (!this.transfers.length) {
          this.loadFromStore();
        }
      }
    },

    transfers(transfers) {
      this.saveTransfersToStore(transfers);
    },

    projectName() {
      this.saveTransfersToStore();
    },

    geckoApiTokensIds() {
      this.loadCurrentRate();
    },

    "formData.tokenCode": {
      handler: function (tokenCode, oldTokenCode) {
        if (this.isFormVisible && tokenCode !== oldTokenCode) {
          this.formData.rate = this.currentRates[tokenCode];
          this.adjustTransferAmountsFromRate();
        }
      },
    },
  },

  mounted() {
    if (!this.loadFromStore()) {
      this.newProject();
    }
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

hr {
  margin: 0.25rem 0;
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
