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
          text\`Hello, world!\`;
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast).toEqual({
      type: 'Program',
      prompts: [{
        type: 'Prompt',
        name: 'SimplePrompt',
        sections: [{
          type: 'BodySection',
          content: [{
            type: 'TextBlock',
            content: ['Hello, world!']
          }]
        }]
      }]
    });
  });

  test('should parse interpolation in text blocks', () => {
    const code = `
      prompt InterpolationPrompt {
        body {
          text\`Hello, \${params.name}! You are \${params.age} years old.\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const textBlock = ast.prompts[0].sections[0].content[0];
    expect(textBlock.type).toBe('TextBlock');
    expect(textBlock.content).toEqual([
      'Hello, ',
      { type: 'Interpolation', expression: { type: 'MemberExpression', object: { type: 'Identifier', name: 'params' }, property: 'name' } },
      '! You are ',
      { type: 'Interpolation', expression: { type: 'MemberExpression', object: { type: 'Identifier', name: 'params' }, property: 'age' } },
      ' years old.'
    ]);
  });

  test('should parse a prompt with all section types', () => {
    const code = `
      prompt ComplexPrompt {
        meta {
          name: "Complex Prompt";
          version: 1.0;
        }
        context {
          role: "You are an AI assistant.";
        }
        params {
          name: string;
          age: number = 30;
        }
        body {
          text\`Hello, \${params.name}! You are \${params.age} years old.\`;
        }
        constraints {
          maxTokens: 100;
          temperature: 0.7;
        }
        output {
          format: "json";
        }
        hooks {
          preProcess(input) {
            input.name = input.name.toUpperCase();
            return input;
          }
        }
        technique {
          chainOfThought {
            step("Understand") {
              text\`First, let's understand the input.\`;
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
    expect(ast.prompts[0].sections.map(s => s.type)).toEqual([
      'MetaSection',
      'ContextSection',
      'ParamsSection',
      'BodySection',
      'ConstraintsSection',
      'OutputSection',
      'HooksSection',
      'TechniqueSection'
    ]);
  });

  test('should parse nested structures correctly', () => {
    const code = `
      prompt NestedPrompt {
        body {
          if (params.condition) {
            text\`Condition is true\`;
          } else {
            text\`Condition is false\`;
          }
          for (item of params.items) {
            text\`Item: \${item}\`;
          }
        }
      }
    `;
    const ast = parser.parse(code);
    expect(ast.prompts[0].sections[0].type).toBe('BodySection');
    expect(ast.prompts[0].sections[0].content.length).toBe(2);
    expect(ast.prompts[0].sections[0].content[0].type).toBe('IfStatement');
    expect(ast.prompts[0].sections[0].content[1].type).toBe('ForLoop');
  });

  test('should parse expressions correctly', () => {
    const code = `
      prompt ExpressionPrompt {
        body {
          text\`Result: \${2 + 3 * (4 - 1)}\`;
          text\`Is adult: \${params.age >= 18}\`;
          text\`Full name: \${params.firstName + " " + params.lastName}\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const expressions = ast.prompts[0].sections[0].content.map(c => c.content[1].expression);
    expect(expressions[0].type).toBe('BinaryExpression');
    expect(expressions[1].type).toBe('BinaryExpression');
    expect(expressions[2].type).toBe('BinaryExpression');
  });

  test('should parse object and array literals', () => {
    const code = `
      prompt LiteralPrompt {
        body {
          text\`Object: \${{ name: "John", age: 30 }}\`;
          text\`Array: \${[1, 2, 3, 4, 5]}\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const literals = ast.prompts[0].sections[0].content.map(c => c.content[1].expression);
    expect(literals[0].type).toBe('ObjectLiteral');
    expect(literals[1].type).toBe('ArrayLiteral');
  });

  test('should parse all prompting techniques', () => {
    const code = `
      prompt TechniquePrompt {
        technique {
          chainOfThought {
            step("Step 1") { text\`Think\`; }
          }
          fewShot {
            example {
              input: text\`Question\`;
              output: text\`Answer\`;
            }
          }
          zeroShot { instruction: "Solve the problem"; }
          selfConsistency { generations: 5; }
          treeOfThoughts { branches: 3; }
          activePrompting { strategy: "uncertainty"; }
          reWOO {
            planner { text\`Plan\`; }
            solver { text\`Solve\`; }
          }
          reAct {
            thought { text\`Think\`; }
            action { text\`Act\`; }
          }
          reflection { prompt: "Reflect on the answer"; }
          expertPrompting { expert: "Mathematician"; }
          ape { iterations: 10; }
          autoCoT { examples: 3; }
          art { tools: ["calculator", "web_search"]; }
        }
      }
    `;
    const ast = parser.parse(code);
    const techniques = ast.prompts[0].sections[0].techniques;
    expect(techniques.length).toBe(13);
    expect(techniques.map(t => t.type)).toEqual([
      'ChainOfThought', 'FewShot', 'ZeroShot', 'SelfConsistency', 
      'TreeOfThoughts', 'ActivePrompting', 'ReWOO', 'ReAct', 
      'Reflection', 'ExpertPrompting', 'APE', 'AutoCoT', 'ART'
    ]);
  });

  test('should parse different literal types correctly', () => {
    const code = `
      prompt LiteralTypesPrompt {
        body {
          text\`Boolean: \${true}\`;
          text\`Null: \${null}\`;
          text\`Number: \${42.5}\`;
          text\`String: \${"Hello"}\`;
        }
      }
    `;
    const ast = parser.parse(code);
    const literals = ast.prompts[0].sections[0].content.map(c => c.content[1].expression);
    expect(literals[0]).toEqual({ type: 'BooleanLiteral', value: true });
    expect(literals[1]).toEqual({ type: 'NullLiteral', value: null });
    expect(literals[2]).toEqual({ type: 'NumberLiteral', value: 42.5 });
    expect(literals[3]).toEqual({ type: 'StringLiteral', value: 'Hello' });
  });

  test('should throw an error for invalid syntax', () => {
    const code = `
      prompt InvalidPrompt {
        invalid_section {
          content: "This is not a valid section";
        }
      }
    `;
    expect(() => parser.parse(code)).toThrow();
  });
});