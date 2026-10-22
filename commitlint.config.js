// Conventional Commits, como pede o AGENTS.md (feat:, fix:, refactor:, test:, docs:, chore:...).
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // mensagens em português costumam começar com verbo no infinitivo ou substantivo; não forçar minúsculas
    "subject-case": [0],
  },
};
