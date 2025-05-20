// parser.test.js
const NudgeLangParser = require('../src/parser');

describe('NudgeLangParser', () => {
  let parser;

  beforeEach(() => {
    parser = new NudgeLangParser();
  });

  test('should parse a simple prompt', () => {
    const code = `
      prompt SimplePrompt {
        body {
          text\`Hello, world!\`
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.type).toBe('Program');
    expect(ast.prompts.length).toBe(1);
    expect(ast.prompts[0].type).toBe('Prompt');
    expect(ast.prompts[0].name).toBe('SimplePrompt');
    expect(ast.prompts[0].sections.length).toBe(1);
    expect(ast.prompts[0].sections[0].type).toBe('BodySection');
  });

  test('should parse interpolation in text blocks', () => {
    const code = `
      prompt InterpolationPrompt {
        body {
          text\`Hello, \${params.name}! You are \${params.age} years old.\`
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].content[0].type).toBe('TextBlock');
  });

  test('should parse a prompt with all section types', () => {
    const code = `
      prompt ComplexPrompt {
        meta {
          name: "Complex Prompt"
          version: 1.0
        }
        context {
          role: "You are an AI assistant."
        }
        params {
          name: string
          age: number = 30
        }
        body {
          text\`Hello, \${params.name}! You are \${params.age} years old.\`
        }
        constraints {
          maxTokens: 100
          temperature: 0.7
        }
        output {
          format: "json"
        }
        hooks {
          preProcess {
            input.name = input.name.toUpperCase()
            return input
          }
        }
        technique {
          chainOfThought {
            step {
              name: "Understand"
              text\`First, let's understand the input.\`
            }
          }
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.type).toBe('Program');
    expect(ast.prompts.length).toBe(1);
    expect(ast.prompts[0].type).toBe('Prompt');
    expect(ast.prompts[0].name).toBe('ComplexPrompt');
    expect(ast.prompts[0].sections.length).toBe(8);
  });

  test('should parse nested structures correctly', () => {
    const code = `
      prompt NestedPrompt {
        body {
          if (params.condition) {
            text\`Condition is true\`
          } else {
            text\`Condition is false\`
          }
          for (item of params.items) {
            text\`Item: \${item}\`
          }
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].type).toBe('BodySection');
    expect(ast.prompts[0].sections[0].content.length).toBe(2);
  });

  test('should parse expressions correctly', () => {
    const code = `
      prompt ExpressionPrompt {
        body {
          text\`Result: \${2 + 3 * (4 - 1)}\`
          text\`Is adult: \${params.age >= 18}\`
          text\`Full name: \${params.firstName + " " + params.lastName}\`
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].type).toBe('BodySection');
    expect(ast.prompts[0].sections[0].content.length).toBe(3);
  });

  test('should parse object and array literals', () => {
    const code = `
      prompt LiteralPrompt {
        body {
          text\`Object: \${{ name: "John", age: 30 }}\`
          text\`Array: \${[1, 2, 3, 4, 5]}\`
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].type).toBe('BodySection');
    expect(ast.prompts[0].sections[0].content.length).toBe(2);
  });

  test('should parse all prompting techniques', () => {
    const code = `
      prompt TechniquePrompt {
        technique {
          chainOfThought {
            step {
              name: "Step 1"
              text\`Think\`
            }
          }
          fewShot {
            example {
              input: text\`Question\`
              output: text\`Answer\`
            }
          }
          zeroShot {
            instruction: "Solve the problem"
          }
          selfConsistency {
            generations: 5
          }
          treeOfThoughts {
            branches: 3
          }
          activePrompting {
            strategy: "uncertainty"
          }
          reWOO {
            planner {
              text\`Plan\`
            }
            solver {
              text\`Solve\`
            }
          }
          reAct {
            thought {
              text\`Think\`
            }
            action {
              text\`Act\`
            }
          }
          reflection {
            prompt: "Reflect on the answer"
          }
          expertPrompting {
            expert: "Mathematician"
          }
          ape {
            iterations: 10
          }
          autoCoT {
            examples: 3
          }
          art {
            tools: ["calculator", "web_search"]
          }
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].type).toBe('TechniqueSection');
  });

  test('should parse different literal types correctly', () => {
    const code = `
      prompt LiteralTypesPrompt {
        body {
          text\`Boolean: \${true}\`
          text\`Null: \${null}\`
          text\`Number: \${42.5}\`
          text\`String: \${"Hello"}\`
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].type).toBe('BodySection');
    expect(ast.prompts[0].sections[0].content.length).toBe(4);
  });

  test('should throw an error for invalid syntax', () => {
    const code = `
      prompt InvalidPrompt {
        invalid_section {
          content: "This is not a valid section"
        }
      }
    `;
    expect(() => parser.parse(code)).toThrow();
  });
});
