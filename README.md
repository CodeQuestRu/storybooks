## Пакеты

Установим в наш проект нужные пакеты:

* Next js
* Ant Design
* Tailwind CSS и Twin Macro
* Emotion

```
yarn add next antd tailwindcss twin.macro @emotion/css @emotion/react @emotion/styled
```

Также установим StoryBook:

```
npx sb init
```



## SSR

В нашем проекте не нужен SSR.
Отключаем его глобально в файле `_app.tsx`:


```js
import dynamic from "next/dynamic";
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// Отключаем SSR
export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});
```



## Next.js + Ant Design

Next.js из коробки умеет работать с CSS, CSS-modules и Sass.
Таким образом мы легко можем подключить в файле `_app.tsx` готовый CSS-файл:


```js
import 'antd/dist/antd.css';
```


Но так мы тянем лишние классы и не сможем кастомизировать компоненты.
Вместо этого нам нужно испортировать исходные файлы:


```js
import 'antd/dist/antd.less';
```


Проблема заключается в том, что Ant Design использует Less-файлы, с которыми Next.js работать не умеет.
В качестве решения мы можем изменить конфигурацию webpack в `next.config.js`:


```js
const nextConfig = {
  reactStrictMode: true,

  // Настройка для Webpack
  webpack(config, options) {
    const { dev, isServer } = options;
    // Добавить свои loaders
    // ...
    return config
  }
}
```


Но в данном случае мы получим ошибку, поскольку webpack будет запускаться два раза: на серверной и клиентской части.
Вместо прямого указания лоадеров для Less, мы можем воспользоваться готовым плагином.

Устанавливаем пакет `next-compose-plugins` для работы с плагинами и нужный нам плагин `next-with-less` для работы с Less:


```
yarn add next-compose-plugins next-with-less
```


Теперь наша конфигурация в `next.config.js` будет выглядеть следующим образом:


```js
const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Настройка для Webpack
  webpack(config, options) {
    const { dev, isServer } = options;
    return config
  }
}

// Плагины для Next.js
module.exports = withPlugins(
  [
    withLess,
    {
      lessLoaderOptions: {
        javascriptEnabled: true
      }
    }
  ],
  nextConfig
);
```


Теперь мы можем подключать Less-файлы к нашему проекту.
В том числе и файл `antd/dist/antd.less` с его последующей кастомзацией.

Но одна проблема при этом остается - в наш проект попадет весь конечный CSS.



## babel-plugin-import

Для решения этой проблемы, мы можем настроить работу `babel-plugin-import`:


```
yarn add --dev babel-plugin-import
```


Этот плагин умеет работать с Ant Design и будет автоматически подтягивать стили нужного компонента при его импорте.

Для конфигурации Babel создаем файл `babel.config.js`:


```js
module.exports = api => {
  api.cache(false);

  return {
    // Прессеты Next.js
    "presets": ["next/babel"],
    // Наши дополнения
    "plugins": [
      [
        "import",
        {
          libraryName: "antd",
          style: true,
        },
      ],
    ]
  }
};
```

Теперь нам не нужно подключать весь Less-файл целиком, да и вообще думать про стили Ant Design.
Но в таком случае мы опять получим ошибку и нам придется лезть менять конфигурацию.



## Конфигурация для Next.js

Окончательная конфигурация Next.js для работы с Antd должна выглядеть примерно так:

https://github.com/Acerbic/NextJS-AntDesign/blob/master/next.config.js

В нашем проекте используется похожий вариант.
Но с Next.js 12 это не работает.




## Готовый плагин

В качестве решения я нашел готовый плагин, который позволяет настроить конфигурацию для связки Next.js и Ant Design:

https://www.npmjs.com/package/next-plugin-antd-less

```
yarn add next-plugin-antd-less
```

Минимальная конфигурация при этом имеет следующий вид:


```js
const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess({
  lessVarsFilePathAppendToEndOfContent: false, // optional
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
```


## Переопределение Less-переменных

Добавим возможность кастомизировать Ant Design за счет переопределения его Less-переменных.
Для этого установим пакет `less-vars-to-js`, который преобразует переменные из Less в объект:


```
yarn add less-vars-to-js
```


Создадим собственный файл с переменными `./src/assets/antd-custom.less` и изменим конфигурацию:


```js
const fs = require("fs");
const path = require("path");

// ...

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
  // ...
})
```



## Другие плагины

Чтобы использовать этот плагин с другими, используем пакет `next-compose-plugins`:


```
yarn add next-compose-plugins
```


Изменим вид конфигурации:


```js
const withPlugins = require('next-compose-plugins');
const withAntdLess = require('next-plugin-antd-less');

// Обработка Less
const pluginAntdLess = withAntdLess({
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


// Экспортируем все плагины
module.exports = withPlugins([
  pluginAntdLess
]);
```



## Оптимизация изображений

Добавим плагин для оптимизации изображений и нужные обработчики:


```
yarn add next-optimized-images responsive-loader jimp
```


Изменим конфигцрацию:


```js
// ...
const withOptimizedImages = require('next-optimized-images');

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

// ...

module.exports = withPlugins([
  pluginAntdLess,
  pluginOptimizedImages
]);
```


Правда при запуске сборка ругается, что не видит никаких пакетов для оптимизации.
Нужно разобраться в чем проблема.




## Анализ сборки

Добавим еще один плагин для оптимизации нашей сборки:


```
yarn add next-optimized-images
```


И добавим в конфигурацию:


```js
// ...
const withBundleAnalyzer = require('@next/bundle-analyzer');

// Анализатор
const pluginAnalyzer = [
  withBundleAnalyzer,
  {
    enabled: process.env.ANALYZE === 'true'
  }
];

// ...

module.exports = withPlugins([
  pluginAntdLess,
  pluginOptimizedImages,
  pluginAnalyzer
]);
```


Чтобы его запустить, добавим пакет `cross-env`:


```
yarn add cross-env
```


И напишем скрипт запуска в `package.json`:


```js
"scripts": {  
  "analyze": "cross-env ANALYZE=true yarn build"
},
```

Теперь мы можем запустить анализ нашего проекта простой командой:


```
yarn analyze
```



## Конечный вид конфигурации

```js
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
```




## .editorConfig

Также предлагаю добавить в проект файт `.editorConfig` с настройками редактора:


```
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
max_line_length = off
trim_trailing_whitespace = false
```