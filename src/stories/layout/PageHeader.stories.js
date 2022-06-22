import PageHeader from "../../components/layout/PageHeader";

export default {
  title: "Layout/PageHeader",
  component: PageHeader,
  parameters: {
    layout: "fullscreen",
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { PageHeader },
  template: "<PageHeader />",
});

export const PageHeaderDefault = Template.bind({});
PageHeaderDefault.args = {};
