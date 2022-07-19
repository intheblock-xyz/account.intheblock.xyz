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
    <TransactionForm
      v-if="isFormVisible"
      :projectLabelTitles="projectLabelTitles"
      @submit="handleTransactionFormSubmit"
      @close="hideTransactionForm"
    />
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
  IProject,
  IProjectData,
  IProjectPreferences,
  saveProject,
  serializeProject,
} from "@/core/project";
import {
  cleanTransactionFormValues,
  ITransaction,
  ITransactionFormSubmit,
} from "@/core/transaction";
import { areSetsEqual } from "@/lib/utils/areSetsEqual";
import EditableText from "@/components/form/EditableText.vue";
import PreferencesModal from "@/components/layout/PreferencesModal.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";
import TransactionForm from "@/components/transaction/TransactionForm.vue";

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
    transactionsLabelTitles(): Set<string> {
      return this.transactions.reduce((acc, transaction) => {
        transaction.labels.forEach(({ title }) => acc.add(title));
        return acc;
      }, new Set<string>());
    },

    essentials(): [string, ITransaction[]] {
      return [this.title, this.transactions];
    },
  },

  methods: {
    load(project: IProject) {
      const { uuid, title, createdAt, editedAt, transactions } = project;

      this.isLoaded = false;
      this.uuid = uuid;
      this.title = title;
      this.createdAt = createdAt;
      this.editedAt = editedAt;
      this.transactions = transactions;

      this.projectLabelTitles = new Set<string>(
        Array.from(this.transactionsLabelTitles),
      );

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

    handleTransactionFormSubmit(transactionFormSubmit: ITransactionFormSubmit) {
      const { formData, transaction, transactionDirection } =
        transactionFormSubmit;

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
