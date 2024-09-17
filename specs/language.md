/* LLM Prompt Programming Language Final Specification */

/* Top-level constructs */
Program ::= ImportStatement* PromptDefinition+

ImportStatement ::= "import" (ImportAll | ImportSpecific) "from" StringLiteral ";"
ImportAll ::= "*" "as" Identifier
ImportSpecific ::= "{" Identifier ("," Identifier)* "}"

PromptDefinition ::= "prompt" Identifier ("extends" Identifier)? "{" PromptBody "}"

PromptBody ::= MetaSection? ContextSection? ParamsSection BodySection ConstraintsSection? OutputSection? HooksSection? TechniqueSection?

/* Section definitions */
MetaSection ::= "meta" "{" MetaProperty+ "}"
MetaProperty ::= Identifier ":" (StringLiteral | NumberLiteral) ";"

ContextSection ::= "context" "{" ContextProperty+ "}"
ContextProperty ::= Identifier ":" StringLiteral ";"

ParamsSection ::= "params" "{" ParamDefinition+ "}"
ParamDefinition ::= Identifier ":" Type ("?" | "[]")? ("=" Expression)? ";"

BodySection ::= "body" "{" (BodyStatement | ParadigmBlock | PromptReference)+ "}"
BodyStatement ::= TextBlock | CodeBlock | ImageBlock | ConditionalStatement | LoopStatement

PromptReference ::= "use" Identifier ("with" "{" ParamAssignment ("," ParamAssignment)* "}")? ";"
ParamAssignment ::= Identifier ":" Expression

ConstraintsSection ::= "constraints" "{" ConstraintProperty+ "}"
ConstraintProperty ::= Identifier ":" (NumberLiteral | BooleanLiteral) ";"

OutputSection ::= "output" "{" OutputProperty+ "}"
OutputProperty ::= Identifier ":" (StringLiteral | SchemaDefinition) ";"

HooksSection ::= "hooks" "{" HookDefinition+ "}"
HookDefinition ::= ("preProcess" | "postProcess") "(" Identifier ")" Block

/* Technique Section */
TechniqueSection ::= "technique" "{" TechniqueDefinition+ "}"
TechniqueDefinition ::= ChainOfThoughtTechnique | FewShotTechnique | ZeroShotTechnique | SelfConsistencyTechnique | 
                        TreeOfThoughtsTechnique | ActivePromptingTechnique | ReWOOTechnique | ReActTechnique | 
                        ReflectionTechnique | ExpertPromptingTechnique | APETechnique | AutoCoTTechnique | ARTTechnique

/* Technique-specific definitions */
ChainOfThoughtTechnique ::= "chainOfThought" "{" StepBlock+ "}"
StepBlock ::= "step" "(" StringLiteral ")" "{" BodyStatement+ "}"

FewShotTechnique ::= "fewShot" "{" ExampleBlock+ "}"
ExampleBlock ::= "example" "{" 
  "input" ":" TextBlock 
  "output" ":" TextBlock
"}"

ZeroShotTechnique ::= "zeroShot" "{" "instruction" ":" StringLiteral "}"

SelfConsistencyTechnique ::= "selfConsistency" "{" 
  "generations" ":" NumberLiteral
  "selectionStrategy" ":" StringLiteral
"}"

TreeOfThoughtsTechnique ::= "treeOfThoughts" "{" 
  "breadth" ":" NumberLiteral
  "depth" ":" NumberLiteral
  "evaluationStrategy" ":" StringLiteral
"}"

ActivePromptingTechnique ::= "activePrompting" "{" 
  "uncertaintyEstimation" ":" StringLiteral
  "selectionStrategy" ":" StringLiteral
  "annotationProcess" ":" StringLiteral
"}"

ReWOOTechnique ::= "reWOO" "{" 
  "planner" ":" Block
  "worker" ":" Block
  "solver" ":" Block
"}"

ReActTechnique ::= "reAct" "{" 
  "observation" ":" Block
  "thought" ":" Block
  "action" ":" Block
"}"

ReflectionTechnique ::= "reflection" "{" 
  "reflectionPrompt" ":" StringLiteral
  "memoryBuffer" ":" StringLiteral
"}"

ExpertPromptingTechnique ::= "expertPrompting" "{" 
  "expertIdentity" ":" StringLiteral
  "expertDescription" ":" TextBlock
"}"

APETechnique ::= "ape" "{" 
  "candidatePool" ":" NumberLiteral
  "scoreFunction" ":" StringLiteral
"}"

AutoCoTTechnique ::= "autoCoT" "{" 
  "clusteringMethod" ":" StringLiteral
  "representativeSelection" ":" StringLiteral
"}"

ARTTechnique ::= "art" "{" 
  "taskLibrary" ":" StringLiteral
  "toolLibrary" ":" StringLiteral
  "decompositionStrategy" ":" StringLiteral
"}"

/* Text and Code Blocks */
TextBlock ::= "text" "`" AnnotatedText "`" ";"
AnnotatedText ::= (PlainText | Interpolation | Annotation)*

PlainText ::= /[^`$@]+/
Interpolation ::= "${" Expression "}"
Annotation ::= "@" AnnotationType "(" AnnotationParams ")" "{" AnnotatedText "}"

AnnotationType ::= "emphasis" | "context" | "instruction" | "example" | "definition"
AnnotationParams ::= (Identifier ":" Expression ("," Identifier ":" Expression)*)?

CodeBlock ::= "code" "(" Expression ")" ";"
ImageBlock ::= "image" "(" Expression ("," StringLiteral)? ")" ";"

/* Control Structures */
ConditionalStatement ::= "if" "(" Expression ")" Block ("else" "if" "(" Expression ")" Block)* ("else" Block)?
LoopStatement ::= "for" "(" Identifier "of" Expression ")" Block

/* Expressions and Types */
Expression ::= Literal | Identifier | FunctionCall | BinaryExpression
Literal ::= StringLiteral | NumberLiteral | BooleanLiteral | NullLiteral | ArrayLiteral | ObjectLiteral
Type ::= "string" | "number" | "boolean" | "Image" | "any" | ArrayType | ObjectType
ArrayType ::= Type "[]"
ObjectType ::= "{" (Identifier ":" Type ("," Identifier ":" Type)*)? "}"

/* Utility */
Block ::= "{" Statement* "}"
Statement ::= BodyStatement | VariableDeclaration | ExpressionStatement
VariableDeclaration ::= "let" Identifier (":" Type)? "=" Expression ";"
ExpressionStatement ::= Expression ";"
Identifier ::= /[a-zA-Z_][a-zA-Z0-9_]*/
StringLiteral ::= /"([^"\\]|\\.)*"/
NumberLiteral ::= /[0-9]+(\.[0-9]+)?/
BooleanLiteral ::= "true" | "false"
NullLiteral ::= "null"
