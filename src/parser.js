// parser.js
const ohm = require('ohm-js');
const fs = require('fs');
const path = require('path');

class NudgeLangParser {
  constructor() {
    const grammarContent = fs.readFileSync(path.join(__dirname, 'nudgelang.ohm'), 'utf-8');
    this.grammar = ohm.grammar(grammarContent);
    this.semantics = this.grammar.createSemantics();
    this.defineSemantics();
  }

  defineSemantics() {
    this.semantics.addOperation('toAST', {
      Program(prompts) {
        return {
          type: 'Program',
          prompts: prompts.toAST(),
        };
      },
      Prompt(_prompt, name, _open, sections, _close) {
        return {
          type: 'Prompt',
          name: name.sourceString,
          sections: sections.toAST(),
        };
      },
      Section(section) {
        return section.toAST();
      },
      MetaSection(_meta, _open, fields, _close) {
        return {
          type: 'MetaSection',
          fields: fields.toAST(),
        };
      },
      MetaField(name, _colon, value, _semicolon) {
        return {
          type: 'MetaField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      ContextSection(_context, _open, fields, _close) {
        return {
          type: 'ContextSection',
          fields: fields.toAST(),
        };
      },
      ContextField(name, _colon, value, _semicolon) {
        return {
          type: 'ContextField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      ParamsSection(_params, _open, declarations, _close) {
        return {
          type: 'ParamsSection',
          params: declarations.toAST(),
        };
      },
      ParamDeclaration(name, _colon, paramType, eq, expr, _semicolon) {
        const hasDefaultValue = eq.numChildren > 0;
        return {
          type: 'ParamDeclaration',
          name: name.sourceString,
          paramType: paramType.toAST(),
          defaultValue: hasDefaultValue ? expr.toAST() : null,
        };
      },
      Type(baseType, arrayModifier, optionalModifier) {
        let type = baseType.sourceString;
        if (arrayModifier.children.length > 0) {
          type += '[]';
        }
        if (optionalModifier.children.length > 0) {
          type += '?';
        }
        return type;
      },
      BodySection(_body, _open, content, _close) {
        return {
          type: 'BodySection',
          content: content.toAST(),
        };
      },
      BodyContent(content) {
        return content.toAST();
      },
      TextBlock(_text, content, _semicolon) {
        return {
          type: 'TextBlock',
          content: content.toAST(),
        };
      },
      BacktickString(_open, elements, _close) {
        return elements.toAST();
      },
      BacktickElement(element) {
        return element.toAST();
      },
      BacktickElement_interpolation(interp) {
        return interp.toAST();
      },
      BacktickElement_text(chars) {
        // Concatenate the text characters into a single string
        return chars.toAST();
      },
      TextChars(chars) {
        return chars.children.map(c => c.toAST()).join('');
      },
      TextChar_normal(chars) {
        return this.sourceString;
      },
      TextChar_dollar(dollar, chars) {
        return this.sourceString;
      },
      InterpolationContent(_open, expr, _close) {
        return {
          type: 'Interpolation',
          expression: expr.toAST(),
        };
      },
      CodeBlock(_code, _openParen, language, content, _closeParen, _semicolon) {
        return {
          type: 'CodeBlock',
          language: language.sourceString,
          content: content.toAST(),
        };
      },
      ImageBlock(_image, _openParen, src, _comma, alt, _closeParen, _semicolon) {
        return {
          type: 'ImageBlock',
          src: src.toAST(),
          alt: alt.toAST(),
        };
      },
      ControlStructure(structure) {
        return structure.toAST();
      },
      IfStatement(_if, _openParen, condition, _closeParen, thenBlock, elseKeyword, elseBlock) {
        const hasElseClause = elseKeyword.numChildren > 0;
        return {
          type: 'IfStatement',
          condition: condition.toAST(),
          thenBlock: thenBlock.toAST(),
          elseBlock: hasElseClause ? elseBlock.toAST() : null,
        };
      },
      ForLoop(_for, _openParen, variable, _of, iterable, _closeParen, block) {
        return {
          type: 'ForLoop',
          variable: variable.sourceString,
          iterable: iterable.toAST(),
          block: block.toAST(),
        };
      },
      Block(_open, content, _close) {
        return content.toAST();
      },
      UseStatement(_use, promptName, withKeyword, openBrace, paramAssignments, closeBrace, _semicolon) {
        const hasWithClause = withKeyword.numChildren > 0;
        let params = [];
        if (hasWithClause) {
          params = paramAssignments.toAST();
        }
        return {
          type: 'UseStatement',
          promptName: promptName.sourceString,
          params: params,
        };
      },
      ParamAssignment(name, _colon, value, _comma) {
        return {
          type: 'ParamAssignment',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      ExpressionStatement(expr, _semicolon) {
        return {
          type: 'ExpressionStatement',
          expression: expr.toAST(),
        };
      },
      ConstraintsSection(_constraints, _open, fields, _close) {
        return {
          type: 'ConstraintsSection',
          constraints: fields.toAST(),
        };
      },
      ConstraintField(name, _colon, value, _semicolon) {
        return {
          type: 'ConstraintField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      OutputSection(_output, _open, fields, _close) {
        return {
          type: 'OutputSection',
          fields: fields.toAST(),
        };
      },
      OutputField(name, _colon, value, _semicolon) {
        return {
          type: 'OutputField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      HooksSection(_hooks, _open, definitions, _close) {
        return {
          type: 'HooksSection',
          hooks: definitions.toAST(),
        };
      },
      HookDefinition(name, _openParen, param, _closeParen, block) {
        return {
          type: 'HookDefinition',
          name: name.sourceString,
          param: param.sourceString,
          block: block.toAST(),
        };
      },
      TechniqueSection(_technique, _open, definitions, _close) {
        return {
          type: 'TechniqueSection',
          techniques: definitions.toAST(),
        };
      },
      TechniqueDefinition(technique) {
        return technique.toAST();
      },
      ChainOfThought(_cot, _open, steps, _close) {
        return {
          type: 'ChainOfThought',
          steps: steps.toAST(),
        };
      },
      ChainOfThoughtStep(_step, _openParen, name, _closeParen, block) {
        return {
          type: 'ChainOfThoughtStep',
          name: name.sourceString,
          block: block.toAST(),
        };
      },
      FewShot(_fewShot, _open, examples, _close) {
        return {
          type: 'FewShot',
          examples: examples.toAST(),
        };
      },
      FewShotExample(_example, _open, _input, _colon1, input, _semicolon1, _output, _colon2, output, _semicolon2, _close) {
        return {
          type: 'FewShotExample',
          input: input.toAST(),
          output: output.toAST(),
        };
      },
      ZeroShot(_zeroShot, _open, fields, _close) {
        return {
          type: 'ZeroShot',
          fields: fields.toAST(),
        };
      },
      SelfConsistency(_selfConsistency, _open, fields, _close) {
        return {
          type: 'SelfConsistency',
          fields: fields.toAST(),
        };
      },
      TreeOfThoughts(_tot, _open, fields, _close) {
        return {
          type: 'TreeOfThoughts',
          fields: fields.toAST(),
        };
      },
      ActivePrompting(_activePrompting, _open, fields, _close) {
        return {
          type: 'ActivePrompting',
          fields: fields.toAST(),
        };
      },
      ReWOO(_rewoo, _open, components, _close) {
        return {
          type: 'ReWOO',
          components: components.toAST(),
        };
      },
      ReWOOComponent(name, block) {
        return {
          type: 'ReWOOComponent',
          name: name.sourceString,
          block: block.toAST(),
        };
      },
      ReAct(_react, _open, components, _close) {
        return {
          type: 'ReAct',
          components: components.toAST(),
        };
      },
      ReActComponent(name, block) {
        return {
          type: 'ReActComponent',
          name: name.sourceString,
          block: block.toAST(),
        };
      },
      Reflection(_reflection, _open, fields, _close) {
        return {
          type: 'Reflection',
          fields: fields.toAST(),
        };
      },
      ExpertPrompting(_expertPrompting, _open, fields, _close) {
        return {
          type: 'ExpertPrompting',
          fields: fields.toAST(),
        };
      },
      APE(_ape, _open, fields, _close) {
        return {
          type: 'APE',
          fields: fields.toAST(),
        };
      },
      AutoCoT(_autoCot, _open, fields, _close) {
        return {
          type: 'AutoCoT',
          fields: fields.toAST(),
        };
      },
      ART(_art, _open, fields, _close) {
        return {
          type: 'ART',
          fields: fields.toAST(),
        };
      },
      TechniqueField(name, _colon, value, _semicolon) {
        return {
          type: 'TechniqueField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      // Expression Rules
      Expression(expr) {
        return expr.toAST();
      },
      LogicalOrExpression_or(left, _op, right) {
        return {
          type: 'LogicalExpression',
          operator: '||',
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      LogicalAndExpression_and(left, _op, right) {
        return {
          type: 'LogicalExpression',
          operator: '&&',
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      EqualityExpression_eq(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      RelationalExpression_rel(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      AdditiveExpression_add(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      MultiplicativeExpression_mul(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      UnaryExpression_unary(op, expr) {
        return {
          type: 'UnaryExpression',
          operator: op.sourceString,
          argument: expr.toAST(),
        };
      },
      MemberExpression_member(object, _dot, property) {
        return {
          type: 'MemberExpression',
          object: object.toAST(),
          property: property.sourceString,
        };
      },
      MemberExpression(expr) {
        return expr.toAST();
      },
      PrimaryExpression(expr) {
        return expr.toAST();
      },
      ParenExpression(_open, expr, _close) {
        return expr.toAST();
      },
      identifier(_first, _rest) {
        return {
          type: 'Identifier',
          name: this.sourceString,
        };
      },
      number(_whole, _dot, _fraction) {
        return {
          type: 'NumberLiteral',
          value: parseFloat(this.sourceString),
        };
      },
      string(_open, chars, _close) {
        return {
          type: 'StringLiteral',
          value: chars.sourceString,
        };
      },
      trueLiteral(_true) {
        return {
          type: 'BooleanLiteral',
          value: true,
        };
      },
      falseLiteral(_false) {
        return {
          type: 'BooleanLiteral',
          value: false,
        };
      },
      nullLiteral(_null) {
        return {
          type: 'NullLiteral',
          value: null,
        };
      },
      ObjectLiteral(_open, properties, _close) {
        return {
          type: 'ObjectLiteral',
          properties: properties.asIteration().toAST(),
        };
      },
      PropertyAssignment(key, _colon, value) {
        return {
          type: 'PropertyAssignment',
          key: key.sourceString,
          value: value.toAST(),
        };
      },
      ArrayLiteral(_open, elements, _close) {
        return {
          type: 'ArrayLiteral',
          elements: elements.asIteration().toAST(),
        };
      },
      _iter(...children) {
        return children.map(c => c.toAST());
      },
      _terminal() {
        return this.sourceString;
      },
    });
  }

  parse(code) {
    const matchResult = this.grammar.match(code);
    if (matchResult.succeeded()) {
      return this.semantics(matchResult).toAST();
    } else {
      throw new Error('Parsing failed: ' + matchResult.message);
    }
  }
}

module.exports = NudgeLangParser;
