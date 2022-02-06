module.exports = {
  '*.{js,ts}': [
    'eslint --fix -c .eslintrc.js --ext',
    'prettier -c .prettierrc.js --write',
  ],
  '*.{yml,yaml,md,json}': ['prettier -c .prettierrc.js --write'],
};
