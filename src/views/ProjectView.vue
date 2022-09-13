<template>
  <div id="project-root" class="section container">
    <h1 class="title is-1">AIM Dispersal Tool</h1>

    <ProjectToolbar
      @newProject="newProject"
      @showWallet="showWallet"
      @showPreferences="showPreferences"
      @importFile="importFile"
      @exportJson="exportJson"
      @exportCsv="exportCsv"
    />

    <EditableText
      :title="title"
      @submit="updateTitle"
      titlePlaceholder="[untitled project]"
      inputPlaceholder="Project Title"
      inputSize="is-large"
      tagName="h2"
      classes="title is-2"
      submitOnBlur
    />

    <hr />

    <div v-if="isFormVisible">
      <div class="box">
        <TransactionForm
          ref="transactionForm"
          :projectLabelTitles="projectLabelTitles"
          :projectTokens="projectTokens"
          :projectExchanges="projectExchanges"
          :transaction="editingTransaction"
          :maxTransactionRowsNum="maxTransactionRowsNum"
          @submit="editingTransaction && transactionFormSubmit()"
        />
        <div class="buttons">
          <b-button
            v-if="editingTransaction"
            type="is-primary"
            icon-left="check"
            @click="transactionFormSubmit()"
            >Save</b-button
          >
          <b-button
            v-if="!editingTransaction"
            type="is-primary"
            icon-left="arrow-up"
            @click="transactionFormSubmit('pay')"
            >Pay</b-button
          >
          <b-button
            v-if="!editingTransaction"
            type="is-primary"
            icon-left="arrow-down"
            @click="transactionFormSubmit('receive')"
            >Receive</b-button
          >
          <b-button @click="hideTransactionForm">Cancel</b-button>
        </div>
      </div>
    </div>

    <ProjectActions
      v-else
      @addTransaction="addTransaction"
      @makePayment="makePayment"
    />

    <hr />

    <TransactionsTable
      v-if="!isFormVisible && account.isSignedIn"
      :transactions="transactions"
      :projectLabelTitles="projectLabelTitles"
      :projectTokens="projectTokens"
      :projectExchanges="projectExchanges"
      @editTransaction="editTransaction"
      @removeTransaction="removeTransaction"
    />

    <TransactionsTableSimple
      v-if="!isFormVisible && !account.isSignedIn"
      :transactions="transactions"
      :projectLabelTitles="projectLabelTitles"
      :projectTokens="projectTokens"
      :projectExchanges="projectExchanges"
      @editTransaction="editTransaction"
      @removeTransaction="removeTransaction"
    />
  </div>
</template>

<script lang="ts">
import get from "lodash/get";
import Vue from "vue";
import { ICurrency } from "@/core/app";
import {
  getLastEditedProject,
  getNewProject,
  IProjectSerialized,
  IProjectData,
  IProjectPreferences,
  saveProject,
  serializeProject,
} from "@/core/project";
import {
  cleanTransactionFormValues,
  ITransaction,
  TTransactionDirection,
} from "@/core/transaction";
import EditableText from "@/components/form/EditableText.vue";
import PreferencesModal from "@/components/project/preferences/PreferencesModal.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";
import TransactionForm, {
  TTransactionForm,
} from "@/components/transaction/TransactionForm.vue";
import { TTransactionRowForm } from "@/components/transaction/TransactionRowForm.vue";
import {
  TransactionsTable,
  TransactionsTableSimple,
} from "@/components/transaction";
import { WalletModal } from "@/components/wallet";

export default Vue.extend({
  name: "ProjectView",

  data() {
    const data: IProjectData = {
      uuid: "",
      title: "",
      createdAt: 0,
      editedAt: 0,
      isSignedIn: get(this, "account.isSignedIn") || false,
      transactions: [],
      projectLabelTitles: new Set<string>(),
      projectTokens: new Set<ICurrency>(),
      projectExchanges: new Set<ICurrency>(),

      isLoaded: false,
      isFormVisible: false,
      editingTransaction: null,
      maxTransactionRowsNum: 10,
    };
    return data;
  },

  inject: ["account"],

  computed: {
    transactionsCurrencyTickers(): Set<string> {
      return this.transactions.reduce((tickers, transaction) => {
        transaction.rows.forEach(({ currencyTicker }) => {
          tickers.add(currencyTicker);
        });
        return tickers;
      }, new Set<string>());
    },

    essentials(): [
      string,
      ITransaction[],
      Set<string>,
      Set<ICurrency>,
      Set<ICurrency>,
    ] {
      return [
        this.title,
        this.transactions,
        this.projectLabelTitles,
        this.projectTokens,
        this.projectExchanges,
      ];
    },
  },

  methods: {
    load(project: IProjectSerialized) {
      const {
        uuid,
        title,
        createdAt,
        editedAt,
        isSignedIn,
        transactions,
        projectLabelTitles,
        projectTokens,
        projectExchanges,
      } = project;

      this.isLoaded = false;
      this.uuid = uuid;
      this.title = title;
      this.createdAt = createdAt;
      this.editedAt = editedAt;
      this.isSignedIn = isSignedIn;
      this.transactions = transactions;

      this.projectLabelTitles = new Set<string>(projectLabelTitles);
      this.projectTokens = new Set<ICurrency>(projectTokens);
      this.projectExchanges = new Set<ICurrency>(projectExchanges);

      this.$nextTick(() => (this.isLoaded = true));
    },

    updateTitle(title: string) {
      this.title = title;
    },

    updateProjectLabelTitles(labelTitles: Set<string>) {
      this.projectLabelTitles = labelTitles;
    },

    updateProjectTokens(tokens: Set<ICurrency>) {
      this.projectTokens = tokens;
    },

    updateProjectExchanges(exchanges: Set<ICurrency>) {
      this.projectExchanges = exchanges;
    },

    touchEditedTimestamp() {
      this.editedAt = Date.now();
    },

    saveToLocalStorage() {
      saveProject(serializeProject(this));
    },

    // load blank project
    newProject(isSignedIn: boolean) {
      this.load(getNewProject(isSignedIn));
    },

    // load last project from local storage
    loadLastStoredProject() {
      const isSignedIn: boolean = get(this, "account.isSignedIn") || false;
      const storedProject = getLastEditedProject(isSignedIn);
      if (storedProject === null) {
        this.newProject(isSignedIn);
      } else {
        this.load(storedProject);
      }
    },

    // preferences
    showPreferences() {
      this.$buefy.modal.open({
        parent: this,
        component: PreferencesModal,
        hasModalCard: true,
        props: {
          initialTitle: this.title,
          initialLabelTitles: this.projectLabelTitles,
          initialTokens: this.projectTokens,
          initialExchanges: this.projectExchanges,
        },
        events: {
          submit: this.preferencesSubmit,
        },
      });
    },

    preferencesSubmit(preferences: IProjectPreferences) {
      const { title, labelTitles, tokens, exchanges } = preferences;
      this.updateTitle(title);
      this.updateProjectLabelTitles(labelTitles);
      this.updateProjectTokens(tokens);
      this.updateProjectExchanges(exchanges);
    },

    showWallet() {
      this.$buefy.modal.open({
        parent: this,
        component: WalletModal,
        hasModalCard: true,
        props: {},
        events: {},
      });
    },

    importFile() {
      alert("importFile");
    },

    exportJson() {
      alert("exportJson");
    },

    exportCsv() {
      alert("exportCsv");
    },

    // project actions
    addTransaction() {
      this.showTransactionForm();
    },

    makePayment() {
      alert("Not implemented yet");
    },

    // transactions
    showTransactionForm(transaction?: ITransaction) {
      this.isFormVisible = true;
      if (transaction) {
        this.editingTransaction = transaction;
      }
    },

    hideTransactionForm() {
      this.isFormVisible = false;
      this.editingTransaction = null;
    },

    transactionFormSubmit(transactionDirection?: TTransactionDirection) {
      // get form ref
      const transactionForm = this.$refs.transactionForm as TTransactionForm;

      // get transaction form data
      const { formData, transaction } =
        transactionForm.getFormSubmit(transactionDirection);

      // throw an error if there is new transaction without direction specified
      if (!transaction && !transactionDirection) {
        throw new Error("Transaction direction missed");
      }

      // get transaction rows forms data
      const rowsFormData = formData.rowUuids.map((rowUuid) => {
        const rowForm = (
          transactionForm.$refs.rowForms as TTransactionRowForm[]
        ).find(({ uuid }) => rowUuid === uuid);
        if (!rowForm) {
          throw new Error(
            `No transaction row form with such uuid '${rowUuid}'`,
          );
        } else {
          const { formData: rowFormData } = rowForm?.getFormSubmit();
          return rowFormData;
        }
      });

      // cast form data to transaction data
      const updatedTransaction = cleanTransactionFormValues(
        formData,
        rowsFormData,
        transaction,
        transactionDirection,
      );

      // update transactions array
      if (!this.transactions.find(({ uuid }) => uuid === transaction?.uuid)) {
        this.transactions.push(updatedTransaction);
      } else {
        const transactionUuid = transaction.uuid;
        const transactionIndex = this.transactions.findIndex(
          ({ uuid }) => uuid === transactionUuid,
        );
        this.transactions.splice(transactionIndex, 1, updatedTransaction);
      }

      // hide the form
      this.hideTransactionForm();
    },

    editTransaction(uuid: string) {
      const transaction = this.transactions.find((t) => t.uuid === uuid);
      if (!transaction) {
        throw new Error("Transaction not found");
      }
      this.showTransactionForm(transaction);
    },

    removeTransaction(uuid: string) {
      const transactionIndex = this.transactions.findIndex(
        (transaction) => uuid === transaction.uuid,
      );
      this.transactions.splice(transactionIndex, 1);
    },
  },

  watch: {
    essentials() {
      if (this.isLoaded) {
        this.touchEditedTimestamp();
        this.saveToLocalStorage();
      }
    },

    ["account.isSignedIn"]() {
      this.loadLastStoredProject();
      if (!!this.editingTransaction) {
        this.hideTransactionForm();
      }
    },
  },

  created() {
    this.loadLastStoredProject();
  },

  components: {
    EditableText,
    ProjectActions,
    ProjectToolbar,
    TransactionForm,
    TransactionsTable,
    TransactionsTableSimple,
  },
});
</script>
