import Hliquid from './src/h-liquid';

/* istanbul ignore next */
Hliquid.install = function(Vue) {
  Vue.component(Hliquid.name, Hliquid);
};

export default Hliquid;
