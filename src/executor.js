// executor.js
const { createProvider } = require('./provider');

class NudgeLangExecutor {
    constructor(providerType, apiKey) {
        this.provider = createProvider(providerType, apiKey);
    }

    async execute(ast, params = {}) {
        const context = {
            params,
            output: {},
            constraints: {},
            hooks: {},
            techniques: [],
        };

        for (const prompt of ast.prompts) {
            await this.executePrompt(prompt, context);
        }

        return this.formatOutput(context);
    }

    async executePrompt(prompt, context) {
        for (const section of prompt.sections) {
            await this.executeSection(section, context);
        }
    }

    async executeSection(section, context) {
        switch (section.type) {
            case 'meta':
                this.executeMeta(section, context);
                break;
            case 'params':
                this.executeParams(section, context);
                break;
            case 'body':
                await this.executeBody(section, context);
                break;
            case 'technique':
                await this.executeTechnique(section, context);
                break;
            case 'constraints':
                this.executeConstraints(section, context);
                break;
            case 'output':
                this.executeOutput(section, context);
                break;
            case 'hooks':
                this.executeHooks(section, context);
                break;
            default:
                throw new Error(`Unknown section type: ${section.type}`);
        }
    }

    executeMeta(section, context) {
        context.meta = section.fields.reduce((acc, field) => {
            acc[field.name] = this.evaluateExpression(field.value, context);
            return acc;
        }, {});
    }

    executeParams(section, context) {
        for (const param of section.fields) {
            if (!(param.name in context.params)) {
                throw new Error(`Missing required parameter: ${param.name}`);
            }
            // Type checking could be added here
        }
    }

    async executeBody(section, context) {
        let bodyContent = '';
        for (const content of section.content) {
            if (content.type === 'text') {
                bodyContent += this.interpolate(content.value, context);
            }
            // Handle other content types as needed
        }
        context.bodyContent = bodyContent;
    }

    async executeTechnique(section, context) {
        for (const technique of section.techniques) {
            const handler = this.getTechniqueHandler(technique.type);
            await handler(technique, context);
            context.techniques.push(technique);
        }
    }

    executeConstraints(section, context) {
        for (const constraint of section.fields) {
            context.constraints[constraint.name] = this.evaluateExpression(constraint.value, context);
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

    getTechniqueHandler(techniqueType) {
        const handlers = {
            'chainOfThought': this.executeChainOfThought.bind(this),
            'fewShot': this.executeFewShot.bind(this),
            'zeroShot': this.executeZeroShot.bind(this),
            'selfConsistency': this.executeSelfConsistency.bind(this),
            'treeOfThoughts': this.executeTreeOfThoughts.bind(this),
            'reWOO': this.executeReWOO.bind(this),
            'reAct': this.executeReAct.bind(this),
            // Add other technique handlers here
        };

        const handler = handlers[techniqueType];
        if (!handler) {
            throw new Error(`Unknown technique type: ${techniqueType}`);
        }
        return handler;
    }

    async executeChainOfThought(technique, context) {
        context.chainOfThought = [];
        for (const step of technique.steps) {
            const stepContent = await this.executeBlock(step.block, context);
            context.chainOfThought.push(`Step: ${step.name}\n${stepContent}`);
        }
    }

    async executeFewShot(technique, context) {
        context.examples = technique.examples.map(example => ({
            input: this.interpolate(example.input, context),
            output: this.interpolate(example.output, context),
        }));
    }

    async executeZeroShot(technique, context) {
        context.instruction = this.interpolate(technique.instruction, context);
    }

    async executeSelfConsistency(technique, context) {
        // Implementation for Self-Consistency technique
    }

    async executeTreeOfThoughts(technique, context) {
        // Implementation for Tree of Thoughts technique
    }

    async executeReWOO(technique, context) {
        // Implementation for ReWOO technique
    }

    async executeReAct(technique, context) {
        // Implementation for ReAct technique
    }

    async executeBlock(block, context) {
        // Execute a block of content (used in techniques)
        let content = '';
        for (const item of block) {
            if (item.type === 'text') {
                content += this.interpolate(item.value, context);
            }
            // Handle other block content types as needed
        }
        return content;
    }

    interpolate(text, context) {
        return text.replace(/\$\{([^}]+)\}/g, (match, expr) => {
            return this.evaluateExpression(expr, context);
        });
    }

    evaluateExpression(expr, context) {
        // Simple expression evaluation
        // This should be expanded for more complex expressions
        if (expr.startsWith('params.')) {
            const key = expr.split('.')[1];
            return context.params[key];
        }
        return expr; // Return as-is for now
    }

    createHookFunction(hook, context) {
        // Create a function from the hook definition
        return (input) => {
            // Execute the hook logic here
            return input; // Placeholder implementation
        };
    }

    async formatOutput(context) {
        let result = '';

        if (context.meta) {
            result += `Meta:\n${JSON.stringify(context.meta, null, 2)}\n\n`;
        }

        if (context.chainOfThought) {
            result += `Chain of Thought:\n${context.chainOfThought.join('\n')}\n\n`;
        }

        if (context.examples) {
            result += `Examples:\n${JSON.stringify(context.examples, null, 2)}\n\n`;
        }

        if (context.instruction) {
            result += `Instruction:\n${context.instruction}\n\n`;
        }

        result += `Task:\n${context.bodyContent}\n\n`;

        if (Object.keys(context.output).length > 0) {
            result += `Output:\n${JSON.stringify(context.output, null, 2)}\n`;
        }

        // Apply post-processing hook if it exists
        if (context.hooks.postProcess) {
            result = context.hooks.postProcess(result);
        }

        return result;
    }

    async callLLM(prompt, constraints) {
        return this.provider.generateResponse(prompt, constraints);
    }
}

module.exports = NudgeLangExecutor;
