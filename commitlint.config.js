module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["global", "soda", 'moon', "mint", "maze"]],
  },
};
