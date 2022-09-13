<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Connected wallet info</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <img :src="icon" />
      <p>
        <strong>{{ name }}</strong>
      </p>
      <p>API version: {{ apiVersion }}</p>
      <p>Network ID: {{ networkId }}</p>
    </section>
    <footer class="modal-card-foot">
      <b-button label="OK" @click="$emit('close')" />
      <b-button
        icon-left="close"
        label="Disconnect"
        type="is-danger"
        @click="disconnect"
      />
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "WalletModal",

  props: {
    name: {
      type: String,
      required: true,
    },

    icon: {
      type: String,
      required: true,
    },

    apiVersion: {
      type: String,
      required: true,
    },

    networkId: {
      type: Number,
      required: true,
    },
  },

  methods: {
    disconnect() {
      this.$emit("disconnect");
      this.$emit("close");
    },
  },
});
</script>

<style scoped>
.modal-card-body {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.modal-card-body > img {
  width: 80px;
  height: 80px;
}

.modal-card-foot {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
</style>
