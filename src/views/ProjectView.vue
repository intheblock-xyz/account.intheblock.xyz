<template>
  <div id="project-root" class="section container">
    <h1 class="title is-1">AIM Dispersal Tool</h1>
    <ProjectToolbar />
    <ProjectTitle />
    <hr />
    <ProjectActions />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ProjectActions from "@/components/project/ProjectActions.vue";
import ProjectTitle from "@/components/project/ProjectTitle.vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";

export default Vue.extend({
  name: "ProjectView",
  components: {
    ProjectActions,
    ProjectTitle,
    ProjectToolbar,
  },
});
</script>
