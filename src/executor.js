const { Configuration, OpenAIApi } = require("openai");
const Techniques = require("./techniques");

class NudgeLangExecutor {
    constructor(apiKey) {
        const configuration = new Configuration({ apiKey });
        this.openai = new OpenAIApi(configuration);
        this.techniques = new Techniques(this);
        this.promptLibrary = {};
      }

  validateAST(ast) {
    // Implement AST validation logic
    // Throw error if AST is invalid
  }

  buildContext(ast, params) {
    return {
      ...ast.context,
      ...params
    };
  }

  buildPrompt(ast, context) {
    let prompt = '';
    
    if (ast.meta) {
      prompt += this.buildMetaSection(ast.meta);
    }
    
    if (ast.context) {
      prompt += this.buildContextSection(ast.context);
    }
    
    prompt += this.buildBodySection(ast.body, context);
    
    if (ast.technique) {
      prompt += this.applyTechniques(ast.technique, context);
    }
    
    return prompt;
  }

  buildMetaSection(meta) {
    let section = "Metadata:\n";
    for (const prop of meta.properties) {
      section += `${prop.name}: ${prop.value}\n`;
    }
    return section + "\n";
  }

  buildContextSection(context) {
    let section = "Context:\n";
    for (const prop of context.properties) {
      section += `${prop.name}: ${prop.value}\n`;
    }
    return section + "\n";
  }

  buildBodySection(body, context) {
    let section = "";
    for (const statement of body.statements) {
      section += this.executeStatement(statement, context);
    }
    return section;
  }

  executeStatement(statement, context) {
    switch (statement.type) {
      case 'TextBlock':
        return this.interpolate(statement.content, context);
      case 'CodeBlock':
        return `Code:\n${statement.code}\n`;
      case 'ImageBlock':
        return `[Image: ${statement.image}${statement.description ? ` - ${statement.description}` : ''}]\n`;
      case 'ConditionalStatement':
        return this.executeConditionalStatement(statement, context);
      case 'LoopStatement':
        return this.executeLoopStatement(statement, context);
      case 'PromptReference':
        return this.executePromptReference(statement, context);
      default:
        throw new Error(`Unknown statement type: ${statement.type}`);
    }
  }

  interpolate(text, context) {
    return text.replace(/\${([^}]+)}/g, (_, expr) => {
      return eval(`with (context) { ${expr} }`);
    });
  }

  executeConditionalStatement(statement, context) {
    if (this.evaluateCondition(statement.condition, context)) {
      return this.executeBlock(statement.ifBlock, context);
    } else if (statement.elseIfs) {
      for (const elseIf of statement.elseIfs) {
        if (this.evaluateCondition(elseIf.condition, context)) {
          return this.executeBlock(elseIf.block, context);
        }
      }
    }
    if (statement.elseBlock) {
      return this.executeBlock(statement.elseBlock, context);
    }
    return '';
  }

  executeLoopStatement(statement, context) {
    let result = '';
    const iterable = this.evaluateExpression(statement.iterable, context);
    for (const item of iterable) {
      const loopContext = { ...context, [statement.variable]: item };
      result += this.executeBlock(statement.block, loopContext);
    }
    return result;
  }

  async executePromptReference(statement, context) {
    const referencedPrompt = this.promptLibrary[statement.name];
    if (!referencedPrompt) {
      throw new Error(`Referenced prompt not found: ${statement.name}`);
    }
    
    const paramValues = {};
    if (statement.params) {
      for (const [key, value] of Object.entries(statement.params)) {
        paramValues[key] = this.evaluateExpression(value, context);
      }
    }
    
    const result = await this.execute(referencedPrompt, { ...context, ...paramValues });
    return result;
  }

  executeBlock(block, context) {
    let result = '';
    for (const statement of block) {
      result += this.executeStatement(statement, context);
    }
    return result;
  }

  evaluateCondition(condition, context) {
    // Implement condition evaluation logic
    return this.evaluateExpression(condition, context);
  }

  evaluateExpression(expression, context) {
    switch (expression.type) {
      case 'StringLiteral':
      case 'NumberLiteral':
      case 'BooleanLiteral':
      case 'NullLiteral':
        return expression.value;
      case 'Identifier':
        return context[expression.name];
      case 'FunctionCall':
        return this.executeFunctionCall(expression, context);
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expression, context);
      case 'ArrayLiteral':
        return expression.elements.map(elem => this.evaluateExpression(elem, context));
      case 'ObjectLiteral':
        return Object.fromEntries(
          expression.properties.map(prop => [
            prop.name,
            this.evaluateExpression(prop.value, context)
          ])
        );
      default:
        throw new Error(`Unknown expression type: ${expression.type}`);
    }
  }

  executeFunctionCall(expression, context) {
    const func = context[expression.name];
    if (typeof func !== 'function') {
      throw new Error(`${expression.name} is not a function`);
    }
    const args = expression.arguments.map(arg => this.evaluateExpression(arg, context));
    return func(...args);
  }

  evaluateBinaryExpression(expression, context) {
    const left = this.evaluateExpression(expression.left, context);
    const right = this.evaluateExpression(expression.right, context);
    switch (expression.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '%': return left % right;
      case '==': return left == right;
      case '!=': return left != right;
      case '<': return left < right;
      case '>': return left > right;
      case '<=': return left <= right;
      case '>=': return left >= right;
      default:
        throw new Error(`Unknown operator: ${expression.operator}`);
    }
  }

  applyTechniques(techniques, context) {
    let result = '';
    for (const technique of techniques) {
      result += this.applyTechnique(technique, context);
    }
    return result;
  }

  async applyTechnique(technique, context) {
    // Use the Techniques instance to apply the technique
    return await this.techniques[`apply${technique.type}`](technique, context);
  }

  registerPrompt(name, promptAst) {
    this.promptLibrary[name] = promptAst;
  }

  async executeHooks(hooks, stage, input) {
    if (!hooks || !hooks[stage]) {
      return input;
    }
    const hook = hooks[stage];
    // Here we're assuming the hook is a function that takes the input and returns the processed output
    // In a more advanced implementation, you might want to provide a sandboxed environment for hook execution
    return hook(input);
  }

  async callLLM(prompt, constraints) {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-002", // or another appropriate model
        prompt: prompt,
        max_tokens: constraints.maxTokens || 100,
        temperature: constraints.temperature || 0.5,
        top_p: constraints.topP || 1,
        frequency_penalty: constraints.frequencyPenalty || 0,
        presence_penalty: constraints.presencePenalty || 0,
      });
      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw new Error("Failed to generate response from LLM");
    }
  }

  processOutput(result, outputSpec) {
    if (outputSpec && outputSpec.format === 'json') {
      try {
        return JSON.parse(result);
      } catch (error) {
        console.error("Error parsing JSON output:", error);
        throw new Error("Failed to parse LLM output as JSON");
      }
    }
    return result;
  }

  async execute(ast, params) {
    this.validateAST(ast);
    let context = this.buildContext(ast, params);
    
    // Execute pre-process hook
    if (ast.hooks && ast.hooks.preProcess) {
      context = await this.executeHooks(ast.hooks, 'preProcess', context);
    }
    
    const prompt = await this.buildPrompt(ast, context);
    let result = await this.callLLM(prompt, ast.constraints);
    
    // Execute post-process hook
    if (ast.hooks && ast.hooks.postProcess) {
      result = await this.executeHooks(ast.hooks, 'postProcess', result);
    }
    
    return this.processOutput(result, ast.output);
  }

}

module.exports = NudgeLangExecutor;