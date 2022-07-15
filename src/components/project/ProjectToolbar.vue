<template>
  <div class="project-toolbar columns">
    <div class="column is-6">
      <div class="buttons">
        <b-button @click="$emit('newProject')">New project</b-button>
        <b-button icon-left="cog" @click="$emit('showPreferences')"></b-button>
      </div>
    </div>
    <div class="column is-6">
      <div class="buttons is-right">
        <b-button @click="$emit('importFile')">Import from File</b-button>
        <b-dropdown aria-role="list" position="is-bottom-left">
          <template #trigger="{ active }">
            <b-button
              label="Export"
              :icon-right="active ? 'menu-up' : 'menu-down'"
            />
          </template>
          <b-dropdown-item aria-role="listitem" @click="$emit('exportJson')"
            >JSON</b-dropdown-item
          >
          <b-dropdown-item aria-role="listitem" @click="$emit('exportCsv')"
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
});
</script>
