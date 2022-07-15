<template>
  <div id="project-root" class="section container">
    <h1 class="title is-1">AIM Dispersal Tool</h1>
    <ProjectToolbar />
    <PreferencesModal />
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
    <ProjectActions />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import PreferencesModal from "@/components/layout/PreferencesModal.vue";
import ProjectActions from "@/components/project/ProjectActions.vue";
import EditableText from "@/components/form/EditableText.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";

export default Vue.extend({
  name: "ProjectView",

  data() {
    return {
      title: "",
    };
  },

  methods: {
    updateTitle(title: string) {
      this.title = title;
    },
  },

  components: {
    PreferencesModal,
    ProjectActions,
    EditableText,
    ProjectToolbar,
  },
});
</script>
