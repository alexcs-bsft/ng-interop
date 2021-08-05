import FormInput from './form-input.vue';
import FormSelect from './form-select.vue';


// This is mostly just me being lazy
const components = [
  FormInput,
  FormSelect,
]

/**
 * A plugin to register all of our directives
 * @type {import('vue').Plugin}
 */
const GlobalComponentsPlugin = {
  install(app) {
    components.forEach((component) => {
      console.log('registering', component.name);
      app.component(component.name, component);
    })
  },
};

export default GlobalComponentsPlugin;