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
      @submit="handleTransactionFormSubmit"
      @cancel="hideTransactionForm"
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
  saveProject,
  serializeProject,
} from "@/core/project";
import {
  cleanTransactionFormValues,
  getTransactionForm,
  ITransaction,
  ITransactionFormSubmit,
} from "@/core/transaction";
import EditableText from "@/components/form/EditableText.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import PreferencesModal, {
  IProjectPreferences,
} from "@/components/layout/PreferencesModal.vue";
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
    };
    return data;
  },

  computed: {
    essentials(): [string, ITransaction[]] {
      return [this.title, this.transactions];
    },

    toSave(): IProject {
      return serializeProject(this);
    },
  },

  methods: {
    load(project: IProject) {
      this.isLoaded = false;
      Object.assign(this, project);
      this.$nextTick(() => (this.isLoaded = true));
    },

    updateTitle(title: string) {
      this.title = title;
    },

    touchEditedTimestamp() {
      this.editedAt = Date.now();
    },

    saveToLocalStorage() {
      saveProject(this.toSave);
    },

    // project toolbar
    newProject() {
      this.load(getNewProject());
    },

    showPreferences() {
      this.$buefy.modal.open({
        parent: this,
        component: PreferencesModal,
        hasModalCard: true,
        props: {
          initialTitle: this.title,
        },
        events: {
          submit: this.preferencesSubmit,
        },
      });
    },

    preferencesSubmit(formData: IProjectPreferences) {
      const { title } = formData;
      this.title = title;
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
