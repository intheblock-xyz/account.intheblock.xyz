<template>
  <PageHeader />
</template>

<script lang="ts">
import Vue from "vue";
import PageHeader from "@/components/layout/PageHeader.vue";
export default Vue.extend({
  name: "App",
  components: {
    PageHeader,
  },
});
</script>
