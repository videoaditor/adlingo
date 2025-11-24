export const COURSE_DATA = [
  {
    id: 1,
    title: "Unit 1: The First 3 Seconds",
    description: "Mastering hooks and pattern interrupts.",
    color: "bg-green-500",
    levels: [
      {
        id: "l1",
        title: "Hook Theory",
        icon: "🪝",
        totalQuestions: 3,
        questions: [
          {
            type: "choice",
            question: "What is the primary goal of the first 3 seconds of a DR video?",
            options: [
              { text: "To introduce the company logo", correct: false },
              { text: "To stop the scroll", correct: true },
              { text: "To explain the product features", correct: false },
              { text: "To show cinematic B-roll", correct: false },
            ]
          },
          {
            type: "choice",
            question: "Which visual technique creates an immediate Pattern Interrupt?",
            options: [
              { text: "Slow fade in", correct: false },
              { text: "Static talking head", correct: false },
              { text: "Rapid zoom or color change", correct: true },
            ]
          },
          {
            type: "binary",
            question: "True or False: Audio should start 0.5s after the video starts.",
            options: [
              { text: "True", correct: false },
              { text: "False (It needs to be instant)", correct: true },
            ]
          }
        ]
      },
      {
        id: "l2",
        title: "Visual Pacing",
        icon: "⚡",
        totalQuestions: 3,
        questions: [
          {
            type: "choice",
            question: "In a high-energy ad, how often should the visual state change?",
            options: [
              { text: "Every 2-5 seconds", correct: true },
              { text: "Every 10-15 seconds", correct: false },
              { text: "Only when the speaker breathes", correct: false },
            ]
          },
          {
            type: "choice",
            question: "What helps bridge a jump cut seamlessly?",
            options: [
              { text: "A cross dissolve", correct: false },
              { text: "A scale bump (Zoom In/Out)", correct: true },
              { text: "Leaving it raw", correct: false },
            ]
          },
          {
            type: "choice",
            question: "Which asset is best for emphasizing a keyword?",
            options: [
              { text: "Kinetic Typography", correct: true },
              { text: "Subtitle at bottom", correct: false },
              { text: "Voiceover only", correct: false },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Unit 2: Retention Engineering",
    description: "Keeping them watching until the offer.",
    color: "bg-purple-500",
    levels: [
      {
        id: "l3",
        title: "Sound Design",
        icon: "🔊",
        locked: true,
        totalQuestions: 4,
        questions: []
      },
      {
        id: "l4",
        title: "The Payoff",
        icon: "🎁",
        locked: true,
        totalQuestions: 4,
        questions: []
      }
    ]
  }
];

export const RANKS = [
  { name: "Intern", minXp: 0, bonus: "0%" },
  { name: "Jr. Editor", minXp: 100, bonus: "5%" },
  { name: "Sr. Cutter", minXp: 500, bonus: "10%" },
  { name: "Retention God", minXp: 1000, bonus: "20% + RevShare" },
];

