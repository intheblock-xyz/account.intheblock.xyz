<template>
  <div class="project-actions columns">
    <div class="column is-12">
      <div class="buttons">
        <b-button
          icon-left="plus-thick"
          type="is-primary"
          @click="$emit('addTransaction')"
          >Add transaction</b-button
        >
        <b-button
          icon-left="cash-multiple"
          type="is-primary"
          @click="$emit('makePayment')"
          >Make payment</b-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ProjectActions",
});
</script>
