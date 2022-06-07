<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Rate calculator</p>
    </header>
    <section class="modal-card-body">
      <div class="columns">
        <b-field label="$ Amount" class="column is-3">
          <b-input
            type="number"
            step="0.01"
            v-model="usdAmount"
            @keyup.native="adjustAmountFromUSD"
          ></b-input>
        </b-field>

        <b-field label="₳ Amount" class="column is-3">
          <b-input
            type="number"
            step="0.01"
            v-model="adaAmount"
            @keyup.native="adjustAmountFromAda"
          ></b-input>
        </b-field>
      </div>
      <div class="columns">
        <b-field label="Calculated Rate" class="column is-3 is-offset-3">
          <b-input
            type="number"
            step="0.000000000000001"
            v-model="finalRate"
            @keyup.native="adjustAmountsFromRate"
          >
          </b-input>
        </b-field>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button
        icon-left="check"
        label="Apply Rate"
        @click="
          $emit('submit', {
            finalRate,
            adaAmount,
            usdAmount,
            lastTouchedAmount,
          })
        "
        type="is-primary"
      />
      <b-button label="Cancel" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
export default {
  props: [
    "initialTransfers",
    "currentRate",
    "initialAdaAmount",
    "initialUsdAmount",
    "initialLastTouchedAmount",
  ],

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
      adaAmount: this.initialAdaAmount,
      usdAmount: this.initialUsdAmount,
      lastTouchedAmount: this.initialLastTouchedAmount,
    };
  },

  methods: {
    adjustAmountFromAda(e) {
      const rate = this.finalRate || 1;
      const value = parseFloat(e.target.value);
      let usdAmount = "";
      if (value === 0) {
        usdAmount = 0;
      } else if (value) {
        usdAmount = parseFloat((parseFloat(value) * rate).toFixed(2));
      }
      this.usdAmount = usdAmount.toString();
      this.lastTouchedAmount = "ada";
    },

    adjustAmountFromUSD(e) {
      const rate = this.finalRate || 1;
      const value = parseFloat(e.target.value);
      let adaAmount = "";
      if (value === 0) {
        adaAmount = 0;
      } else if (value) {
        adaAmount = parseFloat((parseFloat(value) / rate).toFixed(2));
      }
      this.adaAmount = adaAmount.toString();
      this.lastTouchedAmount = "usd";
    },

    adjustAmountsFromRate(e) {
      const rate = parseFloat(e.target.value);
      if (rate) {
        if (this.lastTouchedAmount === "ada") {
          const adaAmount = parseFloat(this.adaAmount);
          let usdAmount = "";
          if (adaAmount === 0) {
            usdAmount = 0;
          } else if (adaAmount) {
            usdAmount = parseFloat((parseFloat(adaAmount) * rate).toFixed(2));
          }
          this.usdAmount = usdAmount.toString();
        } else {
          const usdAmount = parseFloat(this.usdAmount);
          let adaAmount = "";
          if (usdAmount === 0) {
            adaAmount = 0;
          } else if (usdAmount) {
            adaAmount = parseFloat((parseFloat(usdAmount) / rate).toFixed(2));
          }
          this.adaAmount = adaAmount.toString();
        }
      }
    },
  },
};
</script>
