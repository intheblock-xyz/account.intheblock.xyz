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
    <ProjectActions
      @addTransaction="addTransaction"
      @makePayment="makePayment"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import EditableText from "@/components/form/EditableText.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import PreferencesModal, {
  IProjectPreferences,
} from "@/components/layout/PreferencesModal.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";

export default Vue.extend({
  name: "ProjectView",

  components: {
    EditableText,
    ProjectActions,
    ProjectToolbar,
  },

  data() {
    return {
      title: "",
    };
  },

  methods: {
    updateTitle(title: string) {
      this.title = title;
    },

    // project toolbar
    newProject() {
      this.title = "New Project";
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
      alert("addTransaction");
    },

    makePayment() {
      alert("makePayment");
    },
  },
});
</script>
