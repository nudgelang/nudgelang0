const Techniques = require('../src/techniques');

// Mock OpenAI API
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked API response' } }]
        })
      }
    }
  }))
}));

describe('Techniques', () => {
  let techniques;

  beforeEach(() => {
    techniques = new Techniques({});
  });

  describe('selectMostConsistent', () => {
    it('should select the most frequent result with majority_vote strategy', () => {
      const results = ['A', 'B', 'A', 'C', 'A'];
      expect(techniques.selectMostConsistent(results, 'majority_vote')).toBe('A');
    });

    it('should calculate the average with average strategy', () => {
      const results = [1, 2, 3, 4, 5];
      expect(techniques.selectMostConsistent(results, 'average')).toBe(3);
    });

    it('should throw an error for unknown strategy', () => {
      expect(() => techniques.selectMostConsistent([], 'unknown')).toThrow('Unknown selection strategy');
    });
  });

  describe('generateInitialThoughts', () => {
    it('should generate the specified number of thoughts', async () => {
      const thoughts = await techniques.generateInitialThoughts('Test prompt', 3);
      expect(thoughts).toHaveLength(3);
      thoughts.forEach(thought => expect(thought).toBe('Mocked API response'));
    });
  });

  describe('expandThoughts', () => {
    it('should expand each thought by the specified breadth', async () => {
      const thoughts = ['Thought 1', 'Thought 2'];
      const expanded = await techniques.expandThoughts(thoughts, 2, {});
      expect(expanded).toHaveLength(4);
      expanded.forEach(thought => expect(thought).toBe('Mocked API response'));
    });
  });

  describe('evaluateThoughts', () => {
    it('should select the longest thought with length strategy', () => {
      const thoughts = ['Short', 'Longer thought', 'Longest thought here'];
      expect(techniques.evaluateThoughts(thoughts, 'length')).toBe('Longest thought here');
    });

    it('should select thought with most keywords with keyword_match strategy', () => {
      const thoughts = ['This is important', 'This is crucial and significant', 'Nothing special'];
      expect(techniques.evaluateThoughts(thoughts, 'keyword_match')).toBe('This is crucial and significant');
    });

    it('should throw an error for unknown strategy', () => {
      expect(() => techniques.evaluateThoughts([], 'unknown')).toThrow('Unknown evaluation strategy');
    });
  });

  describe('estimateUncertainty', () => {
    it('should estimate uncertainty using entropy method', () => {
      const prompt = 'This is a test prompt with some repeated words like test and prompt';
      const uncertainty = techniques.estimateUncertainty(prompt, 'entropy');
      expect(uncertainty).toBeGreaterThan(0);
    });

    it('should estimate uncertainty using length method', () => {
      const prompt = 'Short prompt';
      expect(techniques.estimateUncertainty(prompt, 'length')).toBe(12);
    });

    it('should throw an error for unknown method', () => {
      expect(() => techniques.estimateUncertainty('', 'unknown')).toThrow('Unknown uncertainty estimation method');
    });
  });

  describe('selectQuestions', () => {
    const questions = [
      { text: 'Q1', uncertainty: 0.5 },
      { text: 'Q2', uncertainty: 0.8 },
      { text: 'Q3', uncertainty: 0.2 },
      { text: 'Q4', uncertainty: 0.9 },
      { text: 'Q5', uncertainty: 0.1 },
      { text: 'Q6', uncertainty: 0.7 }
    ];

    it('should select questions with highest uncertainty using max_uncertainty strategy', () => {
      const selected = techniques.selectQuestions(questions, 'max_uncertainty');
      expect(selected).toHaveLength(5);
      expect(selected[0].text).toBe('Q4');
      expect(selected[1].text).toBe('Q2');
    });

    it('should select random questions using random strategy', () => {
      const selected = techniques.selectQuestions(questions, 'random');
      expect(selected).toHaveLength(5);
      expect(questions.map(q => q.text)).toEqual(expect.arrayContaining(selected.map(q => q.text)));
    });

    it('should throw an error for unknown strategy', () => {
      expect(() => techniques.selectQuestions(questions, 'unknown')).toThrow('Unknown question selection strategy');
    });
  });

  describe('annotateQuestions', () => {
    const questions = ['Q1', 'Q2', 'Q3'];

    it('should annotate questions using auto process', async () => {
      const annotated = await techniques.annotateQuestions(questions, 'auto');
      expect(annotated).toHaveLength(3);
      annotated.forEach(q => expect(q.annotation).toBe('Mocked API response'));
    });

    it('should provide placeholder for human_in_the_loop process', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const annotated = await techniques.annotateQuestions(questions, 'human_in_the_loop');
      expect(annotated).toHaveLength(3);
      annotated.forEach(q => expect(q.annotation).toBe('Human annotation placeholder'));
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw an error for unknown process', async () => {
      await expect(techniques.annotateQuestions(questions, 'unknown')).rejects.toThrow('Unknown annotation process');
    });
  });

  describe('selectBestCandidate', () => {
    it('should select the candidate with the highest score', async () => {
      const candidates = ['Candidate 1', 'Candidate 2', 'Candidate 3'];
      const bestCandidate = await techniques.selectBestCandidate(candidates, 'mock_score_function');
      expect(bestCandidate).toBe('Mocked API response');
    });
  });

  describe('clusterQuestions', () => {
    const prompt = 'What is the capital of France? How tall is the Eiffel Tower? What is French cuisine known for?';

    it('should cluster questions by keyword', () => {
      const clusters = techniques.clusterQuestions(prompt, 'keyword');
      expect(Object.keys(clusters)).toContain('france');
      expect(Object.keys(clusters)).toContain('eiffel');
      expect(Object.keys(clusters)).toContain('cuisine');
    });

    it('should cluster questions by length', () => {
      const clusters = techniques.clusterQuestions(prompt, 'length');
      expect(clusters).toHaveProperty('short');
      expect(clusters).toHaveProperty('long');
    });

    it('should throw an error for unknown method', () => {
      expect(() => techniques.clusterQuestions(prompt, 'unknown')).toThrow('Unknown clustering method');
    });
  });

  describe('selectRepresentatives', () => {
    const clusters = {
      cluster1: ['Short', 'Medium length', 'Longest question here'],
      cluster2: ['Another short', 'Another longer question']
    };

    it('should select random representatives', () => {
      const representatives = techniques.selectRepresentatives(clusters, 'random');
      expect(representatives).toHaveLength(2);
      expect(Object.values(clusters).flat()).toEqual(expect.arrayContaining(representatives));
    });

    it('should select longest representatives', () => {
      const representatives = techniques.selectRepresentatives(clusters, 'longest');
      expect(representatives).toHaveLength(2);
      expect(representatives).toContain('Longest question here');
      expect(representatives).toContain('Another longer question');
    });

    it('should throw an error for unknown strategy', () => {
      expect(() => techniques.selectRepresentatives(clusters, 'unknown')).toThrow('Unknown representative selection strategy');
    });
  });

  describe('selectTask', () => {
    const taskLibrary = {
      math: 'Math Task',
      writing: 'Writing Task',
      analysis: 'Analysis Task',
      default: 'Default Task'
    };

    it('should select math task for math-related prompts', () => {
      expect(techniques.selectTask(taskLibrary, 'Calculate the area of a circle')).toBe('Math Task');
    });

    it('should select writing task for writing-related prompts', () => {
      expect(techniques.selectTask(taskLibrary, 'Write an essay about climate change')).toBe('Writing Task');
    });

    it('should select analysis task for analysis-related prompts', () => {
      expect(techniques.selectTask(taskLibrary, 'Analyze the impact of social media on society')).toBe('Analysis Task');
    });

    it('should select default task for unrecognized prompts', () => {
      expect(techniques.selectTask(taskLibrary, 'What is the meaning of life?')).toBe('Default Task');
    });
  });

  describe('selectTools', () => {
    const toolLibrary = {
      calculator: 'Calculator Tool',
      graphing_tool: 'Graphing Tool',
      thesaurus: 'Thesaurus Tool',
      grammar_checker: 'Grammar Checker Tool',
      data_visualizer: 'Data Visualizer Tool',
      statistical_tool: 'Statistical Tool'
    };

    it('should select math tools for math tasks', () => {
      const selected = techniques.selectTools(toolLibrary, 'math');
      expect(selected).toContain('Calculator Tool');
      expect(selected).toContain('Graphing Tool');
    });

    it('should select writing tools for writing tasks', () => {
      const selected = techniques.selectTools(toolLibrary, 'writing');
      expect(selected).toContain('Thesaurus Tool');
      expect(selected).toContain('Grammar Checker Tool');
    });

    it('should select analysis tools for analysis tasks', () => {
      const selected = techniques.selectTools(toolLibrary, 'analysis');
      expect(selected).toContain('Data Visualizer Tool');
      expect(selected).toContain('Statistical Tool');
    });

    it('should return an empty array for unrecognized tasks', () => {
      expect(techniques.selectTools(toolLibrary, 'unknown')).toEqual([]);
    });
  });

  describe('decomposeTask', () => {
    it('should decompose task sequentially', () => {
      const steps = techniques.decomposeTask('coding', 'sequential');
      expect(steps).toHaveLength(5);
      expect(steps[0]).toContain('Understand');
      expect(steps[1]).toContain('Gather');
      expect(steps[2]).toContain('Apply');
      expect(steps[3]).toContain('Review');
      expect(steps[4]).toContain('Present');
    });

    it('should decompose task in parallel', () => {
      const aspects = techniques.decomposeTask('research', 'parallel');
      expect(aspects).toHaveLength(5);
      expect(aspects[0]).toContain('theoretical perspective');
      expect(aspects[1]).toContain('practical implications');
      expect(aspects[2]).toContain('potential challenges');
      expect(aspects[3]).toContain('innovative approaches');
      expect(aspects[4]).toContain('Synthesize findings');
    });

    it('should throw an error for unknown strategy', () => {
      expect(() => techniques.decomposeTask('task', 'unknown')).toThrow('Unknown task decomposition strategy');
    });
  });
});