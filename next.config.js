const fs = require("fs");
const path = require("path");

// Next плагины + Less для Ant Design
const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');
const withOptimizedImages = require('next-optimized-images');
const withBundleAnalyzer = require('@next/bundle-analyzer');

// Работа с Less-переменными
const lessToJS = require('less-vars-to-js');


// Наши переменные для Less
const themeVariables = lessToJS(
  fs.readFileSync(
    path.resolve(__dirname, "./src/assets/antd-custom.less"),
    "utf8"
  )
);


// Обработка Less
const pluginAntdLess = withAntdLess({
  modifyVars: themeVariables,
  // lessVarsFilePath: './src/styles/variables.less', 
  lessVarsFilePathAppendToEndOfContent: false,
  cssLoaderOptions: {},

  // for Next.js ONLY
  nextjs: {
    localIdentNameFollowDev: true, // default false, for easy to debug on PROD mode
  },

  // Other Config Here...
  webpack(config) {
    return config;
  },
});


// Оптимизация изображений
const pluginOptimizedImages = [
  withOptimizedImages,
  {
    handleImages: ['jpeg', 'png', 'svg', 'webp', 'gif', 'ico'],
    responsive: {
      adapter: require('responsive-loader/jimp'),
      sizes: [375, 768, 1024],
      placeholder: true,
      placeholderSize: 128,
    },
    svgo: {
      plugins: [{ removeUnknownsAndDefaults: false }],
    },
  },
];


// Анализатор
const pluginAnalyzer = [
  withBundleAnalyzer,
  {
    enabled: process.env.ANALYZE === 'true'
  }
];


module.exports = withPlugins([
  pluginAntdLess,
  pluginOptimizedImages,
  pluginAnalyzer
]);