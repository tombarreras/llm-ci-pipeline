require('dotenv').config();

/** @type {import('promptfoo').UnifiedConfig} */
module.exports = {
  description: 'LLM CI regression tests for a support assistant',

  prompts: ['file://prompts/support-assistant.txt'],

  providers: [
    {
      id: `openai:chat:${process.env.OPENAI_MODEL}`,
      config: {
        apiKeyEnvar: 'OPENAI_API_KEY_PROMPTFOO',
      },
    },
  ],

  // CSV columns are referenced as variables inside the prompt.
  tests: 'tests/support-tests.csv',

  defaultTest: {
    options: {
      transformVars: `return {
        ...vars,
        user_input: vars.user_input || ''
      };`,
    },
  },
};
