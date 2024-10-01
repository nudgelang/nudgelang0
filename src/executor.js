// executor.js
const { createProvider } = require('./provider');

class NudgeLangExecutor {
  constructor(providerType, apiKey) {
    this.provider = createProvider(providerType, apiKey);
    this.registeredPrompts = new Map();
  }

  setProvider(providerType, apiKey) {
    this.provider = createProvider(providerType, apiKey);
  }

  registerPrompt(name, ast) {
    if (ast.type !== 'Program' || ast.prompts.length === 0) {
      throw new Error('Invalid AST: Expected a Program with at least one Prompt');
    }
    this.registeredPrompts.set(name, ast.prompts[0]);
  }

  async execute(ast, params = {}) {
    if (ast.type !== 'Program' || ast.prompts.length === 0) {
      throw new Error('Invalid AST: Root node must be a Program with at least one Prompt');
    }
  
    const promptAst = ast.prompts[0]; // Execute the first prompt in the program
  
    if (promptAst.type !== 'Prompt') {
      throw new Error('Invalid AST: Expected a Prompt node');
    }
  
    const context = {
      params,
      meta: {},
      context: {},
      constraints: {},
      output: {},
      hooks: {},
    };
  
    for (const section of promptAst.sections) {
      await this.executeSection(section, context);
    }
  
    // Call preProcess hook if it exists
    if (context.hooks.preProcess) {
      context.params = await context.hooks.preProcess(context.params);
    }
  
    const finalPrompt = this.generateFinalPrompt(context);
    const response = await this.provider.generateResponse(finalPrompt, context.constraints);
  
    // Call postProcess hook if it exists
    if (context.hooks.postProcess) {
      return context.hooks.postProcess(response);
    }
  
    return response;
  }
  

  async executeSection(section, context) {
    switch (section.type) {
      case 'MetaSection':
        this.executeMeta(section, context);
        break;
      case 'ContextSection':
        this.executeContext(section, context);
        break;
      case 'ParamsSection':
        this.executeParams(section, context);
        break;
      case 'BodySection':
        await this.executeBody(section, context);
        break;
      case 'ConstraintsSection':
        this.executeConstraints(section, context);
        break;
      case 'OutputSection':
        this.executeOutput(section, context);
        break;
      case 'HooksSection':
        this.executeHooks(section, context);
        break;
      case 'TechniqueSection':
        await this.executeTechnique(section, context);
        break;
      default:
        throw new Error(`Unknown section type: ${section.type}`);
    }
  }

  executeMeta(section, context) {
    for (const field of section.fields) {
      context.meta[field.name] = this.evaluateExpression(field.value, context);
    }
  }

  executeContext(section, context) {
    for (const field of section.fields) {
      context.context[field.name] = this.evaluateExpression(field.value, context);
    }
  }

  executeParams(section, context) {
    for (const param of section.params) {
      if (!(param.name in context.params) && param.defaultValue !== null) {
        context.params[param.name] = this.evaluateExpression(param.defaultValue, context);
      }
    }
  }

  async executeBody(section, context) {
    context.bodyContent = [];
    for (const content of section.content) {
      const result = await this.executeBodyContent(content, context);
      if (result !== undefined) {
        context.bodyContent.push(result);
      }
    }
  }

  async executeBodyContent(content, context) {
    switch (content.type) {
      case 'TextBlock':
        return this.interpolate(content.content, context);
      case 'CodeBlock':
        return `\`\`\`${content.language}\n${this.interpolate(content.content, context)}\n\`\`\``;
      case 'ImageBlock':
        return `![${this.interpolate(content.alt, context)}](${this.interpolate(content.src, context)})`;
      case 'IfStatement':
        if (this.evaluateExpression(content.condition, context)) {
          return this.executeBlock(content.thenBlock, context);
        } else if (content.elseBlock) {
          return this.executeBlock(content.elseBlock, context);
        }
        break;
      case 'ForLoop':
        let result = '';
        const iterable = this.evaluateExpression(content.iterable, context);
        for (const item of iterable) {
          const loopContext = { ...context, [content.variable]: item };
          result += await this.executeBlock(content.block, loopContext);
        }
        return result;
      case 'UseStatement':
        return this.executeUseStatement(content, context);
      default:
        throw new Error(`Unknown body content type: ${content.type}`);
    }
  }

  executeConstraints(section, context) {
    for (const field of section.constraints) {
      context.constraints[field.name] = this.evaluateExpression(field.value, context);
    }
  }

  executeOutput(section, context) {
    for (const field of section.fields) {
      context.output[field.name] = this.evaluateExpression(field.value, context);
    }
  }

  executeHooks(section, context) {
    for (const hook of section.hooks) {
      context.hooks[hook.name] = this.createHookFunction(hook, context);
    }
  }

  async executeTechnique(section, context) {
    for (const technique of section.techniques) {
      switch (technique.type) {
        case 'ChainOfThought':
          await this.executeChainOfThought(technique, context);
          break;
        case 'FewShot':
          this.executeFewShot(technique, context);
          break;
        case 'ZeroShot':
          this.executeZeroShot(technique, context);
          break;
        // Implement other techniques here
        default:
          throw new Error(`Unknown technique type: ${technique.type}`);
      }
    }
  }

  async executeChainOfThought(technique, context) {
    context.chainOfThought = [];
    for (const step of technique.steps) {
      const stepContent = await this.executeBlock(step.block, context);
      context.chainOfThought.push(`Step: ${step.name}\n${stepContent}`);
    }
  }

  executeFewShot(technique, context) {
    context.fewShotExamples = technique.examples.map(example => ({
      input: this.interpolate(example.input.content, context),
      output: this.interpolate(example.output.content, context),
    }));
  }

  executeZeroShot(technique, context) {
    context.zeroShotInstruction = this.interpolate(technique.instruction, context);
  }

  async executeBlock(block, context) {
    let result = '';
    for (const content of block) {
      const blockResult = await this.executeBodyContent(content, context);
      if (blockResult !== undefined) {
        result += blockResult;
      }
    }
    return result;
  }

  async executeUseStatement(useStatement, context) {
    const promptAst = this.registeredPrompts.get(useStatement.promptName);
    if (!promptAst) {
      throw new Error(`Unknown prompt: ${useStatement.promptName}`);
    }

    const useParams = {};
    for (const param of useStatement.params) {
      useParams[param.name] = this.evaluateExpression(param.value, context);
    }

    const useContext = { ...context, params: useParams };
    return this.execute(promptAst, useContext);
  }

  interpolate(contentArray, context) {
    if (typeof contentArray === 'string') {
      return contentArray.replace(/\${([^}]+)}/g, (_, exp) => {
        return this.evaluateExpression({ type: 'Identifier', name: exp.trim() }, context);
      });
    } else if (Array.isArray(contentArray)) {
      return contentArray.map(item => {
        if (typeof item === 'string') {
          return item;
        } else if (item.type === 'Interpolation') {
          return this.evaluateExpression(item.expression, context);
        } else {
          return '';
        }
      }).join(''); // Ensure no spaces are removed
    } else {
      return '';
    }
  }
  
  evaluateExpression(expr, context) {
  switch (expr.type) {
    case 'Identifier':
      // Handle identifiers (variables)
      return context[expr.name] || context.params[expr.name] || context[expr.name];
    case 'StringLiteral':
      return expr.value;
    case 'NumberLiteral':
      return expr.value;
    case 'BooleanLiteral':
      return expr.value;
    case 'NullLiteral':
      return null;
    case 'ArrayLiteral':
      return expr.elements.map(element => this.evaluateExpression(element, context));
    case 'ObjectLiteral':
      const obj = {};
      for (const prop of expr.properties) {
        obj[prop.key] = this.evaluateExpression(prop.value, context);
      }
      return obj;
    case 'BinaryExpression':
      const left = this.evaluateExpression(expr.left, context);
      const right = this.evaluateExpression(expr.right, context);
      switch (expr.operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
        // Add other operators as needed
      }
      break;
    case 'LogicalExpression':
        const leftLogical = this.evaluateExpression(expr.left, context);
        const rightLogical = this.evaluateExpression(expr.right, context);
        switch (expr.operator) {
          case '&&':
            return leftLogical && rightLogical;
          case '||':
            return leftLogical || rightLogical;
          // Add other logical operators as needed
        }
      break;     
    case 'MemberExpression':
        const object = this.evaluateExpression(expr.object, context);
        let property;
        if (expr.computed) {
          property = this.evaluateExpression(expr.property, context);
        } else {
          property = expr.property;
        }
        return object[property];
      break;
    case 'CallExpression':
        const calleeObj = expr.callee;
        let func, thisArg;
      
        if (calleeObj.type === 'MemberExpression') {
          thisArg = this.evaluateExpression(calleeObj.object, context);
          const prop = calleeObj.computed
            ? this.evaluateExpression(calleeObj.property, context)
            : calleeObj.property;
          func = thisArg[prop];
        } else {
          func = this.evaluateExpression(calleeObj, context);
          thisArg = null;
        }
      
        const args = expr.arguments.map(arg => this.evaluateExpression(arg, context));
      
        if (typeof func !== 'function') {
          throw new Error(`Callee is not a function: ${func}`);
        }
      
        return func.apply(thisArg, args);
    // Handle other expression types
    default:
      throw new Error(`Unknown expression type: ${expr.type}`);
  }
}

createHookFunction(hook, context) {
  return async (input) => {
    const hookContext = { ...context, params: input };
    await this.executeStatements(hook.body, hookContext);
    return hookContext.params;
  };
}

async executeStatements(statements, context) {
  for (const stmt of statements) {
    await this.executeStatement(stmt, context);
  }
}

async executeStatement(stmt, context) {
  switch (stmt.type) {
    case 'AssignmentStatement':
      const value = this.evaluateExpression(stmt.right, context);
      context.params[stmt.left.name] = value;
      break;
    case 'ReturnStatement':
      context.returnValue = this.evaluateExpression(stmt.argument, context);
      break;
    // Handle other statement types as needed
    default:
      throw new Error(`Unknown statement type: ${stmt.type}`);
  }
}

  generateFinalPrompt(context) {
    let prompt = '';

    if (context.context && Object.keys(context.context).length > 0) {
      prompt += `Context:\n${JSON.stringify(context.context, null, 2)}\n\n`;
    }

    if (context.fewShotExamples) {
      prompt += 'Few-shot examples:\n';
      for (const example of context.fewShotExamples) {
        prompt += `Input: ${example.input}\nOutput: ${example.output}\n\n`;
      }
    }

    if (context.zeroShotInstruction) {
      prompt += `Instruction: ${context.zeroShotInstruction}\n\n`;
    }

    if (context.chainOfThought) {
      prompt += 'Chain of Thought:\n';
      prompt += context.chainOfThought.join('\n\n');
      prompt += '\n\n';
    }

    prompt += 'Task:\n';
    prompt += context.bodyContent.join('\n');

    return prompt;
  }
}

module.exports = NudgeLangExecutor;