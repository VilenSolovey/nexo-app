/** @param {import('@babel/core').ConfigAPI} api */
module.exports = function (api) {
  api.cache.forever();
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@nexo': './src',
          '@': './src'
        }
      }],
      'react-native-reanimated/plugin'
    ]
  };
};
