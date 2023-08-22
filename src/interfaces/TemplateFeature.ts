import constants from '../util/constants';

type TemplateFeature = keyof (typeof constants)['injectableModules'];

export default TemplateFeature;
