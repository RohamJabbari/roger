
export const motifCategories = [
  { title: 'Content-based', key: 'content-based' },
  { title: 'Language style', key: 'language-style' },
  { title: 'Structural', key: 'structural' },
  { title: 'Contextual', key: 'contextual' },
  { title: 'Emotional/stress-related', key: 'emotional-stress-related' }
]

export const predefinedMotifs = [
  {
    id: 'only_questions',
    description: 'Only questions',
    type: 'llm',
    category: 'content-based'
  },
  {
    id: 'msg_before_unclear',
    description: 'Last messages prior to ambiguity',
    user_prompt: 'Identify all messages that were the last clear message before an unclear or incomprehensible message.',
    type: 'llm',
    category: 'content-based'
  },
  {
    id: 'strict_order',
    description: 'Strict order',
    user_prompt: 'Identify messages that contain strict orders or authoritative commands give to colleagues or to third parties.',
    type: 'llm',
    category: 'language-style'
  },
  {
    id: 'filler_words',
    description: 'Excessive use of filler words',
    user_prompt: 'Identify messages that contain excessive use of filler words.',
    type: 'llm',
    category: 'language-style'
  },
  {
    id: 'overlapping_speech',
    description: 'Overlapping speech and interruptions',
    category: 'structural'
  },
  {
    id: 'rapid_turn_taking',
    description: 'Rapid turn-taking',
    category: 'structural'
  },
  {
    id: 'during_events',
    description: 'In relation to events',
    category: 'contextual'
  },
  {
    id: 'high_stress_messages',
    description: 'High stress messages',
    category: 'emotional-stress-related'
  },
  {
    id: 'leading_to_high_stress',
    description: 'Leading to high stress',
    category: 'emotional-stress-related'
  }
];