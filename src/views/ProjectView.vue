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
import { v4 as uuidv4 } from "uuid";
import { getLastEditedProject, IProject, saveProject } from "@/core/project";
import EditableText from "@/components/form/EditableText.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import PreferencesModal, {
  IProjectPreferences,
} from "@/components/layout/PreferencesModal.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";

function getNewProject(): IProject {
  return {
    uuid: uuidv4(),
    title: "New Project",
    createdAt: Date.now(),
    editedAt: Date.now(),
  };
}

export default Vue.extend({
  name: "ProjectView",

  components: {
    EditableText,
    ProjectActions,
    ProjectToolbar,
  },

  data() {
    return {
      uuid: "",
      title: "",
      createdAt: 0,
      editedAt: 0,
      isLoaded: false,
    };
  },

  computed: {
    essentials(): [string] {
      return [this.title];
    },

    toSave(): IProject {
      return {
        uuid: this.uuid,
        title: this.title,
        createdAt: this.createdAt,
        editedAt: this.editedAt,
      };
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
      alert("addTransaction");
    },

    makePayment() {
      alert("makePayment");
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
