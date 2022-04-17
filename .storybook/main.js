module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  webpackFinal: async (config, { configType }) => {

    config.module.rules.push(
      {
        test: /\.less$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader', // translates CSS into CommonJS
        }, {
          loader: 'less-loader', // compiles Less to CSS
          options: {
            lessOptions: { // If you are using less-loader@5 please spread the lessOptions to options directly
              // modifyVars: {
              //   'primary-color': '#1DA57A',
              //   'link-color': '#1DA57A',
              //   'border-radius-base': '2px',
              // },
              javascriptEnabled: true,
            },
          },
        }]
      }
    );

    return config;
  },
}


