module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated 4 uses worklets plugin (replaces old reanimated/plugin)
      'react-native-worklets/plugin',
    ],
  };
};
