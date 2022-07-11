<template>
  <div id="project-root" class="section container">
    <h1 class="title is-1">AIM Dispersal Tool</h1>
    <ProjectToolbar />
    <ProjectTitle />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ProjectToolbar from "@/components/project/ProjectToolbar.vue";
import ProjectTitle from "@/components/project/ProjectTitle.vue";

export default Vue.extend({
  name: "ProjectView",
  components: {
    ProjectToolbar,
    ProjectTitle,
  },
});
</script>
