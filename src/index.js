const { parseNudgeLang } = require('./parser');
const NudgeLangExecutor = require('./executor');

function createNudgeLang(apiKey) {
  const executor = new NudgeLangExecutor(apiKey);

  return {
    parsePrompt: parseNudgeLang,
    executePrompt: async (ast, params) => {
      if (typeof ast === 'string') {
        ast = parseNudgeLang(ast);
      }
      return executor.execute(ast, params);
    },
    Executor: NudgeLangExecutor
  };
}

module.exports = createNudgeLang;