import { createApp } from 'vue';

import GlobalComponentsPlugin from './components';
import App from './app.vue';

const app = createApp(App);
app.use(GlobalComponentsPlugin);

app.mount('#app');

export default app;