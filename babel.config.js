module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    // IMPORTANT: keep Reanimated plugin listed last.
    plugins: ['react-native-reanimated/plugin'],
  };
};
