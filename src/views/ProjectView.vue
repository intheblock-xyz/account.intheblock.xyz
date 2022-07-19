<template>
  <div id="project-root" class="section container">
    <h1 class="title is-1">AIM Dispersal Tool</h1>

    <ProjectToolbar
      @newProject="newProject"
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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
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
import { areSetsEqual } from "@/lib/utils/areSetsEqual";
import EditableText from "@/components/form/EditableText.vue";
import PreferencesModal from "@/components/layout/PreferencesModal.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";
import TransactionForm, {
  TTransactionForm,
} from "@/components/transaction/TransactionForm.vue";

export default Vue.extend({
  name: "ProjectView",

  components: {
    EditableText,
    ProjectActions,
    ProjectToolbar,
    TransactionForm,
  },

  data() {
    const data: IProjectData = {
      uuid: "",
      title: "",
      createdAt: 0,
      editedAt: 0,
      transactions: [],
      isLoaded: false,
      isFormVisible: false,
      editingTransaction: null,
      projectLabelTitles: new Set<string>(),
    };
    return data;
  },

  computed: {
    transactionsCurrencyTickers(): Set<string> {
      return this.transactions.reduce((tickers, transaction) => {
        transaction.rows.forEach(({ currency }) => {
          tickers.add(currency.ticker);
        });
        return tickers;
      }, new Set<string>());
    },

    transactionsLabelTitles(): Set<string> {
      return this.transactions.reduce((titles, transaction) => {
        transaction.labels.forEach(({ title }) => titles.add(title));
        transaction.rows.forEach(({ labels }) => {
          labels.forEach(({ title }) => titles.add(title));
        });
        return titles;
      }, new Set<string>());
    },

    essentials(): [string, ITransaction[]] {
      return [this.title, this.transactions];
    },
  },

  methods: {
    load(project: IProjectSerialized) {
      const {
        uuid,
        title,
        createdAt,
        editedAt,
        transactions,
        projectLabelTitles,
      } = project;

      this.isLoaded = false;
      this.uuid = uuid;
      this.title = title;
      this.createdAt = createdAt;
      this.editedAt = editedAt;
      this.transactions = transactions;

      this.projectLabelTitles = new Set<string>(projectLabelTitles);

      this.$nextTick(() => (this.isLoaded = true));
    },

    updateTitle(title: string) {
      this.title = title;
    },

    updateTransactionsLabels(labelTitles: Set<string>) {
      this.projectLabelTitles = labelTitles;

      if (!areSetsEqual(this.transactionsLabelTitles, labelTitles)) {
        const titlesToRemove = new Set(
          [...this.transactionsLabelTitles].filter(
            (title) => !labelTitles.has(title),
          ),
        );

        const titlesToAdd = new Set(
          [...labelTitles].filter(
            (title) => !this.transactionsLabelTitles.has(title),
          ),
        );

        this.transactions.forEach((transaction) => {
          transaction.labels = [
            ...transaction.labels.filter(
              ({ title }) => !titlesToRemove.has(title),
            ),
            ...Array.from(titlesToAdd).map((title) => ({ title, text: "" })),
          ];
        });
      }
    },

    touchEditedTimestamp() {
      this.editedAt = Date.now();
    },

    saveToLocalStorage() {
      saveProject(serializeProject(this));
    },

    // load blank project
    newProject() {
      this.load(getNewProject());
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
        },
        events: {
          submit: this.preferencesSubmit,
        },
      });
    },

    preferencesSubmit(preferences: IProjectPreferences) {
      const { title, labelTitles } = preferences;
      this.updateTitle(title);
      this.updateTransactionsLabels(labelTitles);
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
    },

    transactionFormSubmit(transactionDirection?: TTransactionDirection) {
      const { formData, transaction } = (
        this.$refs.transactionForm as TTransactionForm
      ).getFormSubmit(transactionDirection);

      if (!transaction && !transactionDirection) {
        throw new Error("Missed new transaction direction");
      }

      if (!transaction) {
        this.transactions.push(cleanTransactionFormValues(formData));
      } else {
        const transactionUuid = transaction.uuid;
        const transactionIndex = this.transactions.findIndex(
          ({ uuid }) => uuid === transactionUuid,
        );

        this.transactions.splice(
          transactionIndex,
          1,
          cleanTransactionFormValues(formData, transaction),
        );
      }

      this.hideTransactionForm();
    },
  },

  watch: {
    essentials() {
      if (this.isLoaded) {
        this.touchEditedTimestamp();
        this.saveToLocalStorage();
      }
    },
  },

  created() {
    const storedProject = getLastEditedProject();
    if (storedProject === null) {
      this.newProject();
    } else {
      this.load(storedProject);
    }
  },
});
</script>
