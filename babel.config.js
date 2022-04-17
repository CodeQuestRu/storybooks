module.exports = api => {
  api.cache(false);

  return {
    "presets": ["next/babel"],
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