module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["standard", "prettier", "prettier/standard"],
  plugins: ["import", "prettier", "standard"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "prettier/prettier": "error",
  },
};
