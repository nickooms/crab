module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "plugins": [
    /* "react"*/
  ],
  "rules": {
    "no-console": "off",
    "no-param-reassign": ["error", { "props": false }]
  },
  "env": {
    "browser": true,
    "node": true,
    "jasmine": true,
  }
};
