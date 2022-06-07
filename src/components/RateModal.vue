<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Rate calculator</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-field label="Rate">
        <b-input v-model="finalRate"> </b-input>
      </b-field>
    </section>
    <footer class="modal-card-foot">
      <b-button
        label="OK"
        @click="$emit('submit', { finalRate })"
        type="is-primary"
      />
      <b-button label="Close" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
export default {
  props: ["initialTransfers", "currentRate"],

  data() {
    const transfers = Object.freeze(
      this.initialTransfers
        .filter((transfer) => transfer.amountIn > 0)
        .map((transfer) => ({
          id: transfer.id,
          date: transfer.date,
          rate: transfer.rate,
          amount: transfer.amountIn,
        }))
    );
    return {
      transfers,
      finalRate: this.currentRate,
    };
  },

  methods: {},
};
</script>
