const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  pages: {
    index: {
      entry: "src/main.ts",
      title: "AIM Dispersal Tool",
    },
  },
});
