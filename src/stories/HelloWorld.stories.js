import HelloWorld from "../components/HelloWorld";

export default {
  title: "Example/HelloWorld",
  component: HelloWorld,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { HelloWorld },
  template: "<hello-world />",
});

export const HelloWorldDefault = Template.bind({});
HelloWorldDefault.args = {};
