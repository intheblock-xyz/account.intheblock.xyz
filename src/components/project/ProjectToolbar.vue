<template>
  <div class="project-toolbar columns">
    <div class="column is-6">
      <div class="buttons">
        <b-button @click="newProject">New project</b-button>
        <b-button icon-left="cog" @click="showPreferences"></b-button>
      </div>
    </div>
    <div class="column is-6">
      <div class="buttons is-right">
        <b-button @click="importFromFile">Import from File</b-button>
        <b-dropdown aria-role="list" position="is-bottom-left">
          <template #trigger="{ active }">
            <b-button
              label="Export"
              :icon-right="active ? 'menu-up' : 'menu-down'"
            />
          </template>
          <b-dropdown-item aria-role="listitem" @click="exportToJSON"
            >JSON</b-dropdown-item
          >
          <b-dropdown-item aria-role="listitem" @click="exportToCSV"
            >CSV</b-dropdown-item
          >
        </b-dropdown>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProjectToolbar",
  components: {},
  methods: {
    newProject() {
      alert("new project");
    },
    showPreferences() {
      alert("show preferences");
    },
    importFromFile() {
      alert("import from file");
    },
    exportToJSON() {
      alert("export to JSON");
    },
    exportToCSV() {
      alert("export to CSV");
    },
  },
});
</script>
