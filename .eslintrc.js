module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "standard",
    "standard-react"
  ],
  "env": {
    "browser": true
  },
  "rules": {
    "semi": [2, "never"],
    "comma-dangle": [2, "always-multiline"],
    "space-infix-ops": 0,
    "max-len": [2, 1200, 2],
    "react/jsx-no-bind": [1, {
      "allowArrowFunctions": true
    }],
    "indent": ["error", 2, { "MemberExpression": 0 }],
    "space-before-function-paren": ["error", {
        "anonymous": "always",
        "named": "never",
        "asyncArrow": "always"
    }],
    "padded-blocks": [2, {"classes": "always"}],
    "jsx-quotes": [2, "prefer-single"],
    "graphql/template-strings": ['error', {
      env: 'apollo',
      schemaJson: require('./schema.json'),
    }]
  },
  "plugins": [
    "graphql"
  ],
  "globals": {
    "gql": true
  }
};
