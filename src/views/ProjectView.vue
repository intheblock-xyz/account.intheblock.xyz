<template>
  <div id="project-root" class="section container">
    <h1 class="title is-1">AIM Dispersal Tool</h1>
    <ProjectToolbar />
    <b-modal
      aria-modal
      trap-focus
      has-modal-card
      destroy-on-hide
      aria-role="dialog"
      aria-label="Project preferences modal"
      close-button-aria-label="Close"
      :active="isPreferencesModalActive"
      :on-cancel="hidePreferencesModal"
    >
      <template>
        <PreferencesModal
          @close="hidePreferencesModal"
          @submit="submitPreferencesForm"
        ></PreferencesModal>
      </template>
    </b-modal>
    <ProjectTitle />
    <hr />
    <ProjectActions />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";
import PreferencesModal from "@/components/layout/PreferencesModal.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";
import ProjectTitle from "@/components/project/ProjectTitle.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";

export default Vue.extend({
  name: "ProjectView",

  components: {
    PreferencesModal,
    ProjectActions,
    ProjectTitle,
    ProjectToolbar,
  },

  computed: {
    ...mapGetters("ui", ["isPreferencesModalActive"]),
  },

  methods: {
    hidePreferencesModal() {
      this.$store.dispatch("ui/hidePreferencesModal");
    },

    submitPreferencesForm(formData: Record<string, unknown>) {
      const { projectTitle } = formData;
      this.$store.commit("project/setTitle", projectTitle);
      this.hidePreferencesModal();
    },
  },
});
</script>
