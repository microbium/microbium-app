import Vue from 'vue'
import VueElectron from 'vue-electron'

import MicrobiumApp from './MicrobiumApp'
import router from './router/main'
import store from './store'

Vue.use(VueElectron)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { MicrobiumApp },
  router,
  store,
  template: '<MicrobiumApp/>'
}).$mount('#app')
