# NudgeLang Language Guide

NudgeLang is a declarative language designed for crafting sophisticated prompts for Large Language Models (LLMs). This guide provides a comprehensive overview of the language syntax, features, and advanced techniques.

## Table of Contents

1. [Basic Structure](#basic-structure)
2. [Sections in Detail](#sections-in-detail)
   - [Meta Section](#meta-section)
   - [Context Section](#context-section)
   - [Params Section](#params-section)
   - [Body Section](#body-section)
   - [Constraints Section](#constraints-section)
   - [Output Section](#output-section)
   - [Hooks Section](#hooks-section)
   - [Technique Section](#technique-section)
3. [Body Content](#body-content)
   - [Text Blocks](#text-blocks)
   - [Code Blocks](#code-blocks)
   - [Image Blocks](#image-blocks)
   - [Annotations](#annotations)
4. [Expressions and Control Flow](#expressions-and-control-flow)
   - [Variables](#variables)
   - [Conditional Statements](#conditional-statements)
   - [Loops](#loops)
5. [Advanced Techniques](#advanced-techniques)
6. [Importing and Reusing Prompts](#importing-and-reusing-prompts)
7. [Best Practices](#best-practices)

## Basic Structure

A NudgeLang prompt consists of several optional sections, each serving a specific purpose:

```nudgelang
prompt PromptName {
  meta { ... }
  context { ... }
  params { ... }
  body { ... }
  constraints { ... }
  output { ... }
  hooks { ... }
  technique { ... }
}
```

## Sections in Detail

### Meta Section

The meta section provides metadata about the prompt:

```nudgelang
meta {
  name: "Example Prompt";
  version: "1.0";
  description: "This is an example prompt.";
  author: "John Doe";
}
```

### Context Section

The context section sets up the background for the LLM:

```nudgelang
context {
  role: "You are an expert mathematician.";
  background: "You specialize in algebra and calculus.";
  task: "Solve complex mathematical problems step by step.";
}
```

### Params Section

The params section defines input parameters for the prompt:

```nudgelang
params {
  problem: string;
  difficulty: string = "medium";
  steps?: number;
  topics: string[];
}
```

Parameters can have default values and can be optional (marked with `?`).

### Body Section

The body section contains the main content of the prompt. It can include text blocks, code blocks, image blocks, and control structures.

```nudgelang
body {
  text`Let's solve the following ${params.difficulty} problem: ${params.problem}`;
  
  if (params.steps) {
    text`Please provide your solution in ${params.steps} steps.`;
  }
  
  for (topic of params.topics) {
    text`Consider how ${topic} might be relevant to this problem.`;
  }
}
```

### Constraints Section

The constraints section specifies execution constraints for the LLM:

```nudgelang
constraints {
  maxTokens: 500;
  temperature: 0.7;
  topP: 0.9;
  frequencyPenalty: 0.5;
  presencePenalty: 0.5;
}
```

### Output Section

The output section defines the expected output format:

```nudgelang
output {
  format: "json";
  schema: {
    solution: string,
    steps: string[],
    confidence: number
  }
}
```

### Hooks Section

The hooks section allows for pre- and post-processing of inputs and outputs:

```nudgelang
hooks {
  preProcess(input) {
    input.problem = input.problem.toLowerCase();
    return input;
  }
  postProcess(output) {
    output.confidence = Math.round(output.confidence * 100) / 100;
    return output;
  }
}
```

### Technique Section

The technique section specifies advanced prompting techniques to be used:

```nudgelang
technique {
  chainOfThought {
    step("Understand") {
      text`First, let's understand the problem.`;
    }
    step("Plan") {
      text`Now, let's plan our approach.`;
    }
    step("Solve") {
      text`Let's solve the problem step by step.`;
    }
    step("Verify") {
      text`Finally, let's verify our solution.`;
    }
  }
}
```

## Body Content

### Text Blocks

Text blocks are the primary way to include content in your prompt:

```nudgelang
text`This is a text block. It can include ${interpolated} values.`;
```

### Code Blocks

Code blocks allow you to include formatted code in your prompts:

```nudgelang
code(python`
def example():
    return "This is a code block"
`);
```

### Image Blocks

Image blocks let you reference images in your prompts:

```nudgelang
image("/path/to/image.jpg", "Description of the image");
```

### Annotations

Annotations provide semantic markup within text blocks:

```nudgelang
text`This is @emphasis("emphasized") text. Here's an @example("example") of how to use annotations.`;
```

## Expressions and Control Flow

### Variables

You can declare and use variables within your prompts:

```nudgelang
let x = 5;
text`The value of x is ${x}.`;
```

### Conditional Statements

Conditional statements allow for dynamic prompt construction:

```nudgelang
if (params.difficulty === "hard") {
  text`This is a challenging problem. Take your time.`;
} else {
  text`This problem should be manageable. Good luck!`;
}
```

### Loops

Loops can be used to generate repetitive content:

```nudgelang
for (i of range(1, 5)) {
  text`Step ${i}: ...`;
}
```

## Advanced Techniques

NudgeLang supports various advanced prompting techniques. See the ADVANCED_TECHNIQUES.md document for detailed explanations and examples of:

- Chain of Thought
- Few-Shot Learning
- Zero-Shot Learning
- Self-Consistency
- Tree of Thoughts
- Active Prompting
- ReWOO
- ReAct
- Reflection
- Expert Prompting
- Automatic Prompt Engineering (APE)
- Auto-CoT
- Automatic Reasoning and Tool-use (ART)

## Importing and Reusing Prompts

You can import and reuse prompts to create more complex workflows:

```nudgelang
import { MathSolver } from "math_prompts.nudge";

prompt ComplexProblemSolver {
  // ...
  body {
    use MathSolver with {
      problem: ${params.mathProblem}
    };
    text`Now that we've solved the math problem, let's analyze the result.`;
  }
}
```

## Best Practices

1. Keep your prompts modular and reusable.
2. Use clear and descriptive names for prompts and parameters.
3. Leverage advanced techniques appropriately based on the task at hand.
4. Use annotations to provide semantic structure to your text.
5. Take advantage of the type system in the params section for better error checking.
6. Use hooks for input validation and output formatting.
7. When using multiple techniques, consider their order and how they interact.

For more detailed information on specific features or techniques, please refer to the API documentation or the examples in the repository.