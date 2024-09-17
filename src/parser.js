const ohm = require('ohm-js');
const fs = require('fs');
const path = require('path');

const grammarFile = path.join(__dirname, 'nudgelang.ohm');
const grammar = ohm.grammar(fs.readFileSync(grammarFile, 'utf-8'));

const semantics = grammar.createSemantics();

semantics.addOperation('ast', {
  Program(imports, prompts) {
    return {
      type: 'Program',
      imports: imports.ast(),
      prompts: prompts.ast()
    };
  },
  ImportStatement(_import, spec, _from, path, _semi) {
    return {
      type: 'ImportStatement',
      spec: spec.ast(),
      path: path.ast()
    };
  },
  ImportAll(_star, _as, name) {
    return {
      type: 'ImportAll',
      name: name.ast()
    };
  },
  ImportSpecific(_left, names, _right) {
    return {
      type: 'ImportSpecific',
      names: names.ast()
    };
  },
  PromptDefinition(_prompt, name, extend, _left, body, _right) {
    return {
      type: 'PromptDefinition',
      name: name.ast(),
      extends: extend.ast()[0] || null,
      body: body.ast()
    };
  },
  PromptBody(meta, context, params, body, constraints, output, hooks, technique) {
    return {
      meta: meta.ast()[0] || null,
      context: context.ast()[0] || null,
      params: params.ast()[0] || null,
      body: body.ast(),
      constraints: constraints.ast()[0] || null,
      output: output.ast()[0] || null,
      hooks: hooks.ast()[0] || null,
      technique: technique.ast()[0] || null
    };
  },
  MetaSection(_meta, _left, properties, _right) {
    return {
      type: 'MetaSection',
      properties: properties.ast()
    };
  },
  MetaProperty(name, _colon, value, _semi) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  },
  ContextSection(_context, _left, properties, _right) {
    return {
      type: 'ContextSection',
      properties: properties.ast()
    };
  },
  ContextProperty(name, _colon, value, _semi) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  },
  ParamsSection(_params, _left, definitions, _right) {
    return {
      type: 'ParamsSection',
      params: definitions.ast()
    };
  },
  ParamDefinition(name, _colon, paramType, optional, defaultValue, _semi) {
    return {
      name: name.ast(),
      paramType: paramType.ast(),
      optional: optional.ast()[0] === '?',
      isArray: optional.ast()[0] === '[]',
      defaultValue: defaultValue.ast()[0] || null
    };
  },
  BodySection(_body, _left, statements, _right) {
    return {
      type: 'BodySection',
      statements: statements.ast()
    };
  },
  PromptReference(_use, name, withClause, _semi) {
    return {
      type: 'PromptReference',
      name: name.ast(),
      params: withClause.ast()[0] || null
    };
  },
  ConstraintsSection(_constraints, _left, properties, _right) {
    return {
      type: 'ConstraintsSection',
      constraints: properties.ast()
    };
  },
  ConstraintProperty(name, _colon, value, _semi) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  },
  OutputSection(_output, _left, properties, _right) {
    return {
      type: 'OutputSection',
      properties: properties.ast()
    };
  },
  OutputProperty(name, _colon, value, _semi) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  },
  HooksSection(_hooks, _left, definitions, _right) {
    return {
      type: 'HooksSection',
      hooks: definitions.ast()
    };
  },
  HookDefinition(type, _left, param, _right, block) {
    return {
      type: type.sourceString,
      param: param.ast(),
      block: block.ast()
    };
  },
  TechniqueSection(_technique, _left, definitions, _right) {
    return {
      type: 'TechniqueSection',
      techniques: definitions.ast()
    };
  },
  ChainOfThoughtTechnique(_cot, _left, steps, _right) {
    return {
      type: 'ChainOfThoughtTechnique',
      steps: steps.ast()
    };
  },
  StepBlock(_step, _leftParen, name, _rightParen, _left, content, _right) {
    return {
      name: name.ast(),
      content: content.ast()
    };
  },
  FewShotTechnique(_fewShot, _left, examples, _right) {
    return {
      type: 'FewShotTechnique',
      examples: examples.ast()
    };
  },
  ExampleBlock(_example, _left, _input, _colon1, input, _output, _colon2, output, _right) {
    return {
      input: input.ast(),
      output: output.ast()
    };
  },
  ZeroShotTechnique(_zeroShot, _left, _instruction, _colon, instruction, _right) {
    return {
      type: 'ZeroShotTechnique',
      instruction: instruction.ast()
    };
  },
  SelfConsistencyTechnique(_selfConsistency, _left, _generations, _colon1, generations, _selectionStrategy, _colon2, strategy, _right) {
    return {
      type: 'SelfConsistencyTechnique',
      generations: generations.ast(),
      selectionStrategy: strategy.ast()
    };
  },
  TreeOfThoughtsTechnique(_tot, _left, _breadth, _colon1, breadth, _depth, _colon2, depth, _evalStrategy, _colon3, strategy, _right) {
    return {
      type: 'TreeOfThoughtsTechnique',
      breadth: breadth.ast(),
      depth: depth.ast(),
      evaluationStrategy: strategy.ast()
    };
  },
  ActivePromptingTechnique(_active, _left, _uncertainty, _colon1, uncertainty, _selection, _colon2, selection, _annotation, _colon3, annotation, _right) {
    return {
      type: 'ActivePromptingTechnique',
      uncertaintyEstimation: uncertainty.ast(),
      selectionStrategy: selection.ast(),
      annotationProcess: annotation.ast()
    };
  },
  ReWOOTechnique(_rewoo, _left, _planner, _colon1, planner, _worker, _colon2, worker, _solver, _colon3, solver, _right) {
    return {
      type: 'ReWOOTechnique',
      planner: planner.ast(),
      worker: worker.ast(),
      solver: solver.ast()
    };
  },
  ReActTechnique(_react, _left, _observation, _colon1, observation, _thought, _colon2, thought, _action, _colon3, action, _right) {
    return {
      type: 'ReActTechnique',
      observation: observation.ast(),
      thought: thought.ast(),
      action: action.ast
    };
  },
  ReflectionTechnique(_reflection, _left, _prompt, _colon1, prompt, _buffer, _colon2, buffer, _right) {
    return {
      type: 'ReflectionTechnique',
      reflectionPrompt: prompt.ast(),
      memoryBuffer: buffer.ast()
    };
  },
  ExpertPromptingTechnique(_expert, _left, _identity, _colon1, identity, _description, _colon2, description, _right) {
    return {
      type: 'ExpertPromptingTechnique',
      expertIdentity: identity.ast(),
      expertDescription: description.ast()
    };
  },
  APETechnique(_ape, _left, _pool, _colon1, pool, _score, _colon2, score, _right) {
    return {
      type: 'APETechnique',
      candidatePool: pool.ast(),
      scoreFunction: score.ast()
    };
  },
  AutoCoTTechnique(_autocot, _left, _clustering, _colon1, clustering, _selection, _colon2, selection, _right) {
    return {
      type: 'AutoCoTTechnique',
      clusteringMethod: clustering.ast(),
      representativeSelection: selection.ast()
    };
  },
  ARTTechnique(_art, _left, _task, _colon1, task, _tool, _colon2, tool, _decomp, _colon3, decomp, _right) {
    return {
      type: 'ARTTechnique',
      taskLibrary: task.ast(),
      toolLibrary: tool.ast(),
      decompositionStrategy: decomp.ast()
    };
  },
  TextBlock(_text, _backtick1, content, _backtick2, _semi) {
    return {
      type: 'TextBlock',
      content: content.ast()
    };
  },
  AnnotatedText(elements) {
    return elements.ast();
  },
  PlainText(text) {
    return {
      type: 'PlainText',
      text: text.sourceString
    };
  },
  Interpolation(_dollar, _left, expr, _right) {
    return {
      type: 'Interpolation',
      expression: expr.ast()
    };
  },
  Annotation(_at, annotationType, _left, params, _right, _leftBrace, content, _rightBrace) {
    return {
      type: 'Annotation',
      annotationType: annotationType.ast(),
      params: params.ast(),
      content: content.ast()
    };
  },
  CodeBlock(_code, _left, expr, _right, _semi) {
    return {
      type: 'CodeBlock',
      code: expr.ast()
    };
  },
  ImageBlock(_image, _left, expr, optionalDesc, _right, _semi) {
    return {
      type: 'ImageBlock',
      image: expr.ast(),
      description: optionalDesc.ast()[0]
    };
  },
  ConditionalStatement(_if, _left, condition, _right, ifBlock, elseIfs, elseBlock) {
    return {
      type: 'ConditionalStatement',
      condition: condition.ast(),
      ifBlock: ifBlock.ast(),
      elseIfs: elseIfs.ast(),
      elseBlock: elseBlock.ast()[0]
    };
  },
  LoopStatement(_for, _left, variable, _of, iterable, _right, block) {
    return {
      type: 'LoopStatement',
      variable: variable.ast(),
      iterable: iterable.ast(),
      block: block.ast()
    };
  },
  Expression(expr) {
    return expr.ast();
  },
  Literal(literal) {
    return literal.ast();
  },
  Type(type) {
    return type.sourceString;
  },
  ArrayType(baseType, _brackets) {
    return {
      type: 'ArrayType',
      baseType: baseType.ast()
    };
  },
  ObjectType(_left, properties, _right) {
    return {
      type: 'ObjectType',
      properties: properties.ast()
    };
  },
  ObjectTypeProperty(name, _colon, type) {
    return {
      name: name.ast(),
      type: type.ast()
    };
  },
  SchemaDefinition(_left, properties, _right) {
    return {
      type: 'SchemaDefinition',
      properties: properties.ast()
    };
  },
  SchemaProperty(name, _colon, value) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  },
  Block(_left, statements, _right) {
    return statements.ast();
  },
  Statement(stmt) {
    return stmt.ast();
  },
  VariableDeclaration(_let, name, optionalType, _eq, value, _semi) {
    return {
      type: 'VariableDeclaration',
      name: name.ast(),
      variableType: optionalType.ast()[0],
      value: value.ast()
    };
  },
  ExpressionStatement(expr, _semi) {
    return expr.ast();
  },
  FunctionCall(name, _left, args, _right) {
    return {
      type: 'FunctionCall',
      name: name.ast(),
      arguments: args.ast()
    };
  },
  BinaryExpression(left, op, right) {
    return {
      type: 'BinaryExpression',
      left: left.ast(),
      operator: op.sourceString,
      right: right.ast()
    };
  },
  annotationType(type) {
    return type.sourceString;
  },
  AnnotationParam(name, _colon, value) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  },
  identifier(name) {
    return name.sourceString;
  },
  stringLiteral(_open, chars, _close) {
    return {
      type: 'StringLiteral',
      value: chars.sourceString
    };
  },
  numberLiteral(digits, optionalFraction) {
    return {
      type: 'NumberLiteral',
      value: parseFloat(this.sourceString)
    };
  },
  booleanLiteral(value) {
    return {
      type: 'BooleanLiteral',
      value: value.sourceString === 'true'
    };
  },
  nullLiteral(_) {
    return {
      type: 'NullLiteral',
      value: null
    };
  },
  ArrayLiteral(_left, elements, _right) {
    return {
      type: 'ArrayLiteral',
      elements: elements.ast()
    };
  },
  ObjectLiteral(_left, properties, _right) {
    return {
      type: 'ObjectLiteral',
      properties: properties.ast()
    };
  },
  ObjectLiteralProperty(name, _colon, value) {
    return {
      name: name.ast(),
      value: value.ast()
    };
  }
});

function parseNudgeLang(code) {
    const matchResult = grammar.match(code);
    if (matchResult.failed()) {
      throw new Error(matchResult.message);
    }
    return semantics(matchResult).ast();
  }
  
  module.exports = { parseNudgeLang };