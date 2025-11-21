module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    'react-native-worklets/plugin',
    [
      'module-resolver',
      {
        root: ['./src'], // folder root proyekmu
        alias: {
          '@': './src', // sekarang @ → src
        },
      },
    ],
  ],
};
