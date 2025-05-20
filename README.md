# NudgeLang0: A Declarative Language for LLM Prompts

[![GitHub license](https://img.shields.io/github/license/nudgelang/nudgelang0.svg)](https://github.com/nudgelang/nudgelang0/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nudgelang/nudgelang0.svg)](https://github.com/nudgelang/nudgelang0/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/nudgelang/nudgelang0.svg)](https://github.com/nudgelang/nudgelang0/issues)

[EXPERIMENTAL]

NudgeLang0 is a powerful, declarative language designed for crafting sophisticated prompts for Large Language Models (LLMs). It provides a structured, modular, and reusable approach to prompt engineering, incorporating advanced techniques and best practices in the field.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Language Overview](#language-overview)
5. [Advanced Techniques](#advanced-techniques)
6. [Examples](#examples)
7. [API Reference](#api-reference)
8. [Contributing](#contributing)
9. [License](#license)

## Features

- **Declarative Syntax**: Write clear, readable prompts with a structured syntax that feels natural and intuitive.
- **Modularity**: Import and reuse prompts across your projects, saving time and maintaining consistency.
- **Advanced Techniques**: Built-in support for Chain-of-Thought, Tree-of-Thoughts, ReAct, and more - no need to implement these from scratch.
- **Type System**: Optional type annotations for improved safety and clarity, catching errors before they happen.
- **Dynamic Content**: Use interpolation and control structures for flexible prompt generation that adapts to your needs.
- **Execution Hooks**: Pre-process inputs and post-process outputs with custom logic, giving you full control over the prompt lifecycle.
- **Output Specification**: Define structured outputs, including JSON schemas, ensuring consistent and predictable results.
- **Extensibility**: Easily extend the language with new techniques and features to suit your specific use cases.

## Installation

To install NudgeLang0, use npm:

```bash
npm install nudgelang0
```

## Quick Start

Here's a simple example to get you started with NudgeLang0:

```nudgelang
prompt SimpleMathSolver {
  meta {
    name: "Simple Math Solver";
    version: "1.0";
  }

  params {
    problem: string;
  }

  body {
    text`Let's solve this math problem step by step:
    
    Problem: ${params.problem}
    
    Steps:`;

    chainOfThought {
      step("Understand the problem") {
        text`First, let's identify the key information and what we need to solve.`;
      }
      step("Plan the solution") {
        text`Now, let's outline the steps we'll take to solve this problem.`;
      }
      step("Solve") {
        text`Let's perform the calculations:`;
      }
      step("Check") {
        text`Finally, let's verify our solution:`;
      }
    }
  }

  output {
    format: "json";
    schema: {
      solution: number,
      steps: string[]
    }
  }
}
```

To use this prompt:

```javascript
import { parsePrompt, executePrompt } from 'nudgelang0';

const promptCode = '...'; // Your NudgeLang0 code here
const parsedPrompt = parsePrompt(promptCode);

const result = await executePrompt(parsedPrompt, {
  problem: "What is 15% of 80?"
});

console.log(result.solution); // Outputs the numeric solution
console.log(result.steps);    // Outputs the reasoning steps
```

## Language Overview

NudgeLang0 is structured into several key sections that make prompt engineering more manageable:

- **meta**: Metadata about the prompt (name, version, description)
- **params**: Input parameters for the prompt (with type safety)
- **body**: The main content of the prompt (where the magic happens)
- **technique**: Advanced prompting techniques to be used (CoT, ToT, etc.)
- **constraints**: Execution constraints (e.g., max tokens, temperature)
- **output**: Specification for the expected output (structure and format)
- **hooks**: Pre-processing and post-processing logic (custom transformations)

For a complete language specification, please refer to our [Language Guide](https://github.com/nudgelang/nudgelang0/blob/main/specs/LANGUAGE_GUIDE.md).

## Advanced Techniques

NudgeLang0 supports a variety of advanced prompting techniques that can significantly improve your LLM interactions:

- Chain of Thought (CoT): Break down complex problems into manageable steps
- Tree of Thoughts (ToT): Explore multiple solution paths simultaneously
- ReAct (Reasoning and Acting): Combine reasoning with action planning
- ReWOO (Reasoning Without Observation): Efficient problem-solving approach
- Active Prompting: Dynamically adapt prompts based on context
- Self-Consistency: Generate multiple solutions and find consensus
- Automatic Prompt Engineering (APE): Optimize prompts automatically
- Expert Prompting: Leverage domain-specific knowledge

For details on how to use these techniques, check our [Advanced Techniques Guide](https://github.com/nudgelang/nudgelang0/blob/main/specs/ADVANCED_TECHNIQUES.md).

## Examples

We provide a variety of examples to help you get started:

- [Simple Math Solver](https://github.com/nudgelang/nudgelang0/blob/main/examples/math_solver.nudge)
- [Creative Writing Assistant](https://github.com/nudgelang/nudgelang0/blob/main/examples/creative_writer.nudge)
- [Multi-step Reasoning Problem Solver](https://github.com/nudgelang/nudgelang0/blob/main/examples/problem_solver.nudge)

## API Reference

For detailed information about the NudgeLang0 API, including the `parsePrompt` and `executePrompt` functions, please refer to our [API Documentation](https://github.com/nudgelang/nudgelang0/blob/main/specs/API.md).

## Contributing

We welcome contributions to NudgeLang0! Whether you're fixing bugs, adding features, or improving documentation, your help makes NudgeLang0 better for everyone. Please see our [Contributing Guide](https://github.com/nudgelang/nudgelang0/blob/main/CONTRIBUTING.md) for more information on how to get started.

## License

NudgeLang0 is released under the MIT License. See the [LICENSE](https://github.com/nudgelang/nudgelang0/blob/main/LICENSE) file for more details.

---

For more information, updates, and community discussions, please visit our [GitHub repository](https://github.com/nudgelang/nudgelang0). If you encounter any issues or have suggestions, please [open an issue](https://github.com/nudgelang/nudgelang0/issues/new).

Happy prompting with NudgeLang0! 🚀
