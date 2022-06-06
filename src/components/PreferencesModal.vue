<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Project preferences</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-field label="Project name">
        <b-input v-model="projectName" required> </b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        label="OK"
        @click="$emit('submit', { projectName })"
        type="is-primary"
      />
      <b-button label="Close" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
export default {
  props: ["initials"],

  data() {
    return { projectName: this.initials.projectName };
  },
};
</script>
