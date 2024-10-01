// executor.test.js
const NudgeLangExecutor = require('../src/executor');
const NudgeLangParser = require('../src/parser');

jest.mock('../src/provider', () => ({
  createProvider: jest.fn(() => ({
    generateResponse: jest.fn((prompt, constraints) => {
      // For testing purposes, return the prompt to check the output
      return prompt;
    }),
  })),
}));
describe('NudgeLangExecutor', () => {
  let executor;
  let parser;

  beforeEach(() => {
    // Read provider and key from environment variables
    const provider = process.env.NUDGELANG_PROVIDER || 'openai';
    const apiKey = process.env.NUDGELANG_API_KEY || 'test-api-key';
    
    executor = new NudgeLangExecutor(provider, apiKey);
    parser = new NudgeLangParser();
  });

  test('should execute a simple prompt', async () => {
    const code = `
      prompt SimplePrompt {
        body {
          text\`Hello, world!\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const result = await executor.execute(ast);
    expect(result).toBe('Task:\nHello, world!');
  });

  test('should handle params correctly', async () => {
    const code = `
      prompt ParamPrompt {
        params {
          name: string;
          age: number = 30;
        }
        body {
          text\`Hello, \${params.name}! You are \${params.age} years old.\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const result = await executor.execute(ast, { name: 'Alice' });
    expect(result).toBe('Task:\nHello, Alice! You are 30 years old.');
  });

  test('should execute if statements', async () => {
    const code = `
      prompt ConditionalPrompt {
        params {
          condition: boolean;
        }
        body {
          if (params.condition) {
            text\`Condition is true\`;
          } else {
            text\`Condition is false\`;
          }
        }
      }
    `;
    const ast = parser.parse(code);
    const resultTrue = await executor.execute(ast, { condition: true });
    expect(resultTrue).toBe('Task:\nCondition is true');
    const resultFalse = await executor.execute(ast, { condition: false });
    expect(resultFalse).toBe('Task:\nCondition is false');
  });

  test('should execute for loops', async () => {
    const code = `
      prompt LoopPrompt {
        params {
          items: string[];
        }
        body {
          for (item of params.items) {
            text\`Item: \${item}\n\`;
          }
        }
      }
    `;
    const ast = parser.parse(code);
    const result = await executor.execute(ast, { items: ['apple', 'banana', 'cherry'] });
    expect(result).toBe('Task:\nItem: apple\nItem: banana\nItem: cherry\n');
  });

  test('should handle techniques', async () => {
    const code = `
      prompt TechniquePrompt {
        technique {
          chainOfThought {
            step("Step 1") {
              text\`This is step 1\`;
            }
            step("Step 2") {
              text\`This is step 2\`;
            }
          }
        }
        body {
          text\`Final answer\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const result = await executor.execute(ast);
    expect(result).toContain('Chain of Thought:');
    expect(result).toContain('Step: Step 1');
    expect(result).toContain('This is step 1');
    expect(result).toContain('Step: Step 2');
    expect(result).toContain('This is step 2');
    expect(result).toContain('Task:\nFinal answer');
  });

  test('should handle hooks', async () => {
    const code = `
      prompt HookPrompt {
        params {
          name: string;
        }
        hooks {
          preProcess(input) {
            input.name = input.name.toUpperCase();
            return input;
          }
        }
        body {
          text\`Hello,  \${params.name}!\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const result = await executor.execute(ast, { name: 'Alice' });
    expect(result).toBe('Task:\nHello, Alice!');
  });
});