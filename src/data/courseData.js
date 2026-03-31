// Course data — managed via admin portal, stored in localStorage
// Falls back to seed data on first load

const STORAGE_KEY = 'adlingo_course_data';
const SEED_VERSION_KEY = 'adlingo_seed_version';
const CURRENT_SEED_VERSION = 2; // Bump this to force seed data refresh

const SEED_WORLDS = [
  {
    id: 'w1',
    name: 'Editing Town',
    subtitle: 'THE BASICS',
    themeColor: 'from-orange-600 to-amber-500',
    bgColor: 'bg-gradient-to-br from-orange-900/40 to-amber-900/20',
    borderColor: 'border-orange-500/30',
    accentColor: 'text-orange-400',
    order: 1,
    imageUrl: null,
    description: 'The first 3 seconds decide everything. Learn to stop the scroll.',
    unlockAfterWorld: null,
    lessons: [
      {
        id: 'l1',
        title: 'A-Roll Shortcuts and Prep',
        subtitle: 'Step 1',
        order: 1,
        videoUrl: 'https://www.tella.tv/video/editing-a-roll-shortcuts-and-prep-6khy',
        videoType: 'tella',
        questions: [
          {
            id: 'q1',
            type: 'text',
            question: "You have talking head footage on your timeline. What does pressing Q do?",
            options: [
              { text: "Adds a crossfade transition", correct: false },
              { text: "Ripple trims — deletes everything in front of the playhead", correct: true },
              { text: "Splits the clip at the playhead", correct: false },
              { text: "Selects the entire clip", correct: false }
            ],
            directorNote: "Q = ripple trim (deletes before playhead). Master this shortcut to remove silences instantly instead of dragging clips manually."
          },
          {
            id: 'q2',
            type: 'text',
            question: "You hear audio cracks and pops between your A-roll cuts on Mac. How do you fix this?",
            options: [
              { text: "Lower the volume between clips", correct: false },
              { text: "Add a music track to cover the pops", correct: false },
              { text: "Use Command+Shift+D to add audio transitions between clips", correct: true },
              { text: "Re-export the audio at a higher bitrate", correct: false }
            ],
            directorNote: "Cmd+Shift+D adds a short audio transition at every cut, eliminating cracks and pops. Do this after your rough cut."
          },
          {
            id: 'q3',
            type: 'text',
            question: "You're about to start editing but assets are scattered across Google Drive. What should you do first?",
            options: [
              { text: "Start editing and download assets as you need them", correct: false },
              { text: "Make all Drive assets available offline and collect everything before you start editing", correct: true },
              { text: "Ask the client to re-send everything in a zip file", correct: false },
              { text: "Just use placeholder images for now", correct: false }
            ],
            directorNote: "Prepare like a hamster for winter. Make Drive assets available offline and collect everything in one session BEFORE editing. Don't waste time waiting on downloads mid-edit."
          },
          {
            id: 'q4',
            type: 'text',
            question: "You're reviewing the script before editing. What should you write down as you read?",
            options: [
              { text: "A list of fonts and colors to use", correct: false },
              { text: "Enhancement ideas — how to visualize each line strategically", correct: true },
              { text: "Timestamps for where each cut should go", correct: false },
              { text: "Notes about what music to use", correct: false }
            ],
            directorNote: "Read the script and note your creative enhancement ideas for each line. This pre-planning means you're not guessing in the timeline — you know exactly what visual supports the narrative."
          }
        ]
      },
      {
        id: 'l2',
        title: 'Ai Visuals for Scripts (Flow Studio)',
        subtitle: 'Step 2',
        order: 2,
        videoUrl: 'https://www.tella.tv/video/ai-visuals-for-scripts-flow-gen-editor-ai-4lyd',
        videoType: 'tella',
        questions: [
          {
            id: 'q5',
            type: 'text',
            question: "When generating visuals for a script, what are the four asset categories?",
            options: [
              { text: "Intro, body, outro, CTA", correct: false },
              { text: "Pain/agitation, solution, product application, product shots", correct: true },
              { text: "Hooks, testimonials, features, pricing", correct: false },
              { text: "Close-ups, wide shots, B-roll, text overlays", correct: false }
            ],
            directorNote: "Every script visual falls into one of four buckets: pain/agitation (the problem), solution (step-by-step fix), product application (using the product), and product shots (the product itself)."
          },
          {
            id: 'q6',
            type: 'text',
            question: "Your AI-generated B-roll from Flow looks too polished and cinematic. What prompt additions improve UGC authenticity?",
            options: [
              { text: "Add 'professional photography, studio lighting'", correct: false },
              { text: "Add 'spontaneous snapshot, UGC perspective, filmed on iPhone, no UI elements'", correct: true },
              { text: "Add '4K resolution, color graded, bokeh background'", correct: false },
              { text: "Just lower the resolution in post", correct: false }
            ],
            directorNote: "Prompting on Flow is tricky. Add 'spontaneous snapshot,' 'UGC perspective,' and 'filmed on iPhone, no UI elements' to get authentic-looking footage instead of cinematic AI output."
          },
          {
            id: 'q7',
            type: 'text',
            question: "You need B-roll for a client's ad. What's the correct asset sourcing priority?",
            options: [
              { text: "AI-generated first, then TikTok, then client footage", correct: false },
              { text: "Stock footage first, then AI, then client assets", correct: false },
              { text: "Existing client assets first, then TikTok content, then AI-generated", correct: true },
              { text: "Film everything yourself for maximum quality", correct: false }
            ],
            directorNote: "Don't rely on AI for everything. Check client assets first, grab relevant TikTok content second (use watermark removal), and only generate with AI for concept-specific needs — especially avoid AI for product application shots."
          }
        ]
      },
      {
        id: 'l3',
        title: 'Editing Hooks (Compositing)',
        subtitle: 'Step 3',
        order: 3,
        videoUrl: 'https://www.tella.tv/video/editing-hooks-compositing-1-gjr3',
        videoType: 'tella',
        questions: [
          {
            id: 'q8',
            type: 'text',
            question: "You're about to composite hooks from your organized assets. What should you generate first?",
            options: [
              { text: "Sound effects for each transition", correct: false },
              { text: "Color grades for visual consistency", correct: false },
              { text: "Subtitles — so you can work without sound playback", correct: true },
              { text: "A storyboard for each hook variation", correct: false }
            ],
            directorNote: "Always generate subtitles first. Working without constant sound playback is a drastic improvement in editing flow — you save all that playback time and can move faster."
          },
          {
            id: 'q9',
            type: 'text',
            question: "Why does working without sound playback during compositing improve your workflow?",
            options: [
              { text: "The audio is usually low quality anyway", correct: false },
              { text: "It saves playback time and lets you extend your editing window — add sound effects later", correct: true },
              { text: "Music rights haven't been cleared yet", correct: false },
              { text: "It forces you to focus on color grading", correct: false }
            ],
            directorNote: "Skipping playback saves enormous time. You read the subtitles, match shots visually, and defer audio work for a later pass when you add sound effects."
          },
          {
            id: 'q10',
            type: 'text',
            question: "You're compositing a hook and realize a detail is slightly off. What's the right approach?",
            options: [
              { text: "Move on and fix it in the final review pass", correct: false },
              { text: "Get the hook details right now — don't plan on revisiting them later", correct: true },
              { text: "Ask the client if they even notice", correct: false },
              { text: "Delete the hook and start from scratch", correct: false }
            ],
            directorNote: "Hooks require getting details right the first time. If you plan to 'fix it later,' you probably won't — and a weak hook kills the entire ad."
          }
        ]
      }
    ]
  },
  {
    id: 'w2',
    name: 'AI Toolkit',
    subtitle: 'CREATING ASSETS WITH AI',
    themeColor: 'from-cyan-600 to-blue-500',
    bgColor: 'bg-gradient-to-br from-cyan-900/40 to-blue-900/20',
    borderColor: 'border-cyan-500/30',
    accentColor: 'text-cyan-400',
    order: 2,
    imageUrl: null,
    description: 'Master AI tools for voices, talking heads, video generation, and images.',
    unlockAfterWorld: 'w1',
    lessons: [
      {
        id: 'l4',
        title: 'Realistic AI Voices',
        subtitle: 'Create voices that sound human',
        order: 1,
        videoUrl: 'https://www.tella.tv/video/how-to-create-realistic-ai-voices-d3wl',
        videoType: 'tella',
        questions: [
          {
            id: 'q11',
            type: 'text',
            question: "You need a realistic AI voice for a UGC ad. What's the first step before generating in ElevenLabs?",
            options: [
              { text: "Pick a random ElevenLabs preset voice", correct: false },
              { text: "Upload the talking head image to Gemini and analyze the visual context", correct: true },
              { text: "Record yourself and use that as the base", correct: false },
              { text: "Write the script first, then pick any voice", correct: false }
            ],
            directorNote: "Context matters. Upload the avatar image to Gemini first — a person in a bathroom sounds different than someone in a podcast studio. The AI voice must match the visual setting."
          },
          {
            id: 'q12',
            type: 'text',
            question: "Your ElevenLabs voice sounds too clean and podcast-quality for a UGC ad filmed on an iPhone. Why?",
            options: [
              { text: "The bitrate is too high", correct: false },
              { text: "Standard ElevenLabs templates default to podcast-quality voices that don't match iPhone/TikTok recordings", correct: true },
              { text: "You need to add reverb in post-production", correct: false },
              { text: "The script is too formal", correct: false }
            ],
            directorNote: "Default ElevenLabs voices sound like studio recordings. UGC is filmed on phones with room tone. Use Voice Design with a context-aware prompt from Gemini to match the real setting."
          },
          {
            id: 'q13',
            type: 'text',
            question: "You need a voice matching a brand's existing creator. What's the fastest approach?",
            options: [
              { text: "Use Voice Design and describe the voice manually", correct: false },
              { text: "Search TikTok for the creator, then clone their voice with ElevenLabs instant voice cloning", correct: true },
              { text: "Hire the creator to record new audio", correct: false },
              { text: "Use the closest-sounding preset voice", correct: false }
            ],
            directorNote: "Find existing creator content on TikTok and clone the voice directly in ElevenLabs. Keeps the brand voice consistent without waiting on anyone."
          },
          {
            id: 'q14',
            type: 'text',
            question: "A word in your ElevenLabs Studio output is mispronounced. How do you fix it?",
            options: [
              { text: "Re-generate the entire voiceover", correct: false },
              { text: "Rewrite the word phonetically and regenerate just that sentence", correct: true },
              { text: "Edit the audio waveform manually", correct: false },
              { text: "Add a sound effect to cover it", correct: false }
            ],
            directorNote: "Studio mode lets you regenerate sentence-by-sentence. Rewrite mispronounced words phonetically until every word sounds 100% human."
          }
        ]
      },
      {
        id: 'l5',
        title: 'Talking Heads',
        subtitle: 'Turn voiceovers into fictional characters',
        order: 2,
        videoUrl: 'https://www.loom.com/share/cae714a66611485d846673d6ea398ba4',
        videoType: 'loom',
        questions: [
          {
            id: 'q15',
            type: 'text',
            question: "You need a talking head video for an ad. What two things do you need before generating?",
            options: [
              { text: "A logo and a color palette", correct: false },
              { text: "A voiceover and an avatar image", correct: true },
              { text: "A storyboard and a mood board", correct: false },
              { text: "A finished script and background music", correct: false }
            ],
            directorNote: "Talking head generation needs two inputs: the voice (from ElevenLabs) and the avatar image. Everything else is optional."
          },
          {
            id: 'q16',
            type: 'text',
            question: "You're creating an AI avatar. What should you experiment with to improve the final result?",
            options: [
              { text: "Only use the first generation — retrying wastes time", correct: false },
              { text: "Try different prompts, reference images, and tools to refine the output", correct: true },
              { text: "Just increase the resolution", correct: false },
              { text: "Add filters in post-production", correct: false }
            ],
            directorNote: "Experiment with various prompts and different tools. Test reference imagery, animation styles, and product placement until you get a lifelike result."
          }
        ]
      },
      {
        id: 'l6',
        title: 'Sora UGC Process',
        subtitle: 'Generate B-rolls with Claude and Sora',
        order: 3,
        videoUrl: 'https://www.loom.com/share/49a7ed0a4c32432ea0479ff7012fb45a',
        videoType: 'loom',
        questions: [
          {
            id: 'q17',
            type: 'text',
            question: "You need UGC-style B-roll but have no creator footage. What's the Sora workflow?",
            options: [
              { text: "Type a prompt directly into Sora and hope for the best", correct: false },
              { text: "Create a Claude project, craft prompts there, then paste into Sora with a product image", correct: true },
              { text: "Use Sora's auto-generate feature with just a brand name", correct: false },
              { text: "Screenshot a competitor's ad and upload it to Sora", correct: false }
            ],
            directorNote: "The workflow is: Claude project for prompt crafting → Sora for generation. Always attach a product image so Sora knows what to show."
          },
          {
            id: 'q18',
            type: 'text',
            question: "You want to maximize B-roll output while minimizing cost. What's the key strategy?",
            options: [
              { text: "Generate as many random clips as possible and pick the best ones", correct: false },
              { text: "Customize prompts per shot using Claude, and download the prompt guide for consistency", correct: true },
              { text: "Use only free AI tools to avoid costs", correct: false },
              { text: "Reuse the same B-roll across different ads", correct: false }
            ],
            directorNote: "Customized prompts per shot = higher quality with fewer generations. Use Claude to craft precise prompts and follow the prompt guide so every generation counts."
          }
        ]
      },
      {
        id: 'l7',
        title: 'Image Generation',
        subtitle: 'Strategic visuals focused on message and emotion',
        order: 4,
        videoUrl: 'https://www.tella.tv/video/strategic-video-generation-focus-on-message-emotion-bc3x',
        videoType: 'tella',
        questions: [
          {
            id: 'q19',
            type: 'text',
            question: "You're generating a UGC-style avatar image. The output has blurry bokeh background and dramatic lighting. What's wrong?",
            options: [
              { text: "The resolution is too low", correct: false },
              { text: "iPhones don't blur in video mode and real UGC has flat lighting — it looks too cinematic", correct: true },
              { text: "You need to add a filter in post", correct: false },
              { text: "Nothing — bokeh looks professional", correct: false }
            ],
            directorNote: "Real UGC is shot on phones: sharp background, flat even lighting, no dramatic shadows. If it looks like a movie, it won't feel authentic."
          },
          {
            id: 'q20',
            type: 'text',
            question: "Your AI-generated person has a phone visible in the frame and a 'REC' timestamp overlay. How do you fix this?",
            options: [
              { text: "Crop the image to hide the phone", correct: false },
              { text: "Add 'no phone visible, no text, no UI, no timestamp, no REC' to the prompt", correct: true },
              { text: "Paint it out in Photoshop", correct: false },
              { text: "Generate at a lower resolution", correct: false }
            ],
            directorNote: "Always explicitly exclude what you don't want in the prompt. AI will add phones and UI overlays unless you tell it not to."
          },
          {
            id: 'q21',
            type: 'text',
            question: "When generating images for ads, what should you focus on first — aesthetics or message?",
            options: [
              { text: "Aesthetics — beautiful images always perform better", correct: false },
              { text: "Message and emotion — the visual must support the script's intent", correct: true },
              { text: "Resolution — higher quality means better performance", correct: false },
              { text: "Variety — generate as many different styles as possible", correct: false }
            ],
            directorNote: "Strategic image generation means focusing on message and emotion first. Analyze the script, understand what feeling each line needs, then generate visuals that support that intent."
          }
        ]
      },
      {
        id: 'l8',
        title: 'Frames to Videos',
        subtitle: 'Turn images into motion',
        order: 5,
        videoUrl: 'https://www.tella.tv/video/image-to-video-generation-with-vo-3-1-cling-3-0-g7r6',
        videoType: 'tella',
        questions: [
          {
            id: 'q22',
            type: 'text',
            question: "You need a quick B-roll from a product image. What's the fastest workflow?",
            options: [
              { text: "Animate it manually in After Effects", correct: false },
              { text: "Attach the frame in Claude, describe what you want, paste the prompt into Veo via Flow", correct: true },
              { text: "Upload to Canva and use their animation feature", correct: false },
              { text: "Just use a static image with a Ken Burns zoom", correct: false }
            ],
            directorNote: "For quick B-rolls: Claude writes the prompt, Flow/Veo generates the video. Fast and easy — Veo 3.1 handles about 80% of cases with phenomenal results."
          },
          {
            id: 'q23',
            type: 'text',
            question: "You need a high-fidelity product application video (e.g., someone applying a serum). Which tool do you reach for?",
            options: [
              { text: "Sora — it's best for everything", correct: false },
              { text: "Veo via Flow — fastest for all video", correct: false },
              { text: "Kling AI frame mode — precise and high fidelity for application shots", correct: true },
              { text: "Just use stock footage", correct: false }
            ],
            directorNote: "Kling is slower but more precise. When you need high fidelity (product application, detailed movements), Kling beats Veo. Use Veo for speed, Kling for precision."
          },
          {
            id: 'q24',
            type: 'text',
            question: "Before generating a video from an image, what's the most important thing to get right first?",
            options: [
              { text: "The video length setting", correct: false },
              { text: "The background music", correct: false },
              { text: "The source image — download it in 2K resolution", correct: true },
              { text: "The export format", correct: false }
            ],
            directorNote: "The main part is getting the images right. Always download source images in 2K resolution before feeding them into Veo or Kling — garbage in, garbage out."
          }
        ]
      }
    ]
  },
  {
    id: 'w3',
    name: 'Working Faster',
    subtitle: 'EFFICIENCY & MINDSET',
    themeColor: 'from-purple-600 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-900/40 to-violet-900/20',
    borderColor: 'border-purple-500/30',
    accentColor: 'text-purple-400',
    order: 3,
    imageUrl: null,
    description: 'The editing mindset — work smarter, ship faster.',
    unlockAfterWorld: 'w2',
    lessons: [
      {
        id: 'l9',
        title: 'The Editing Mindset',
        subtitle: 'Work smarter, ship faster',
        order: 1,
        videoUrl: 'https://www.loom.com/share/317092ccaa0c477a9601e2a3f30b9549',
        videoType: 'loom',
        questions: [
          {
            id: 'q25',
            type: 'text',
            question: "You've spent 3 hours perfecting one 30-second ad. What's the problem?",
            options: [
              { text: "Nothing — quality takes time", correct: false },
              { text: "You should have spent 4 hours to make it even better", correct: false },
              { text: "Your hourly rate just dropped — perfectionism kills efficiency", correct: true },
              { text: "You should charge more per video", correct: false }
            ],
            directorNote: "The longer you spend on one video, the lower your hourly rate. Find the fastest way to hit 90% quality and ship it."
          },
          {
            id: 'q26',
            type: 'text',
            question: "You need a B-roll of someone pouring coffee. What should you ask yourself first?",
            options: [
              { text: "Which AI model generates the best coffee?", correct: false },
              { text: "Do I even need AI for this, or can I find it in brand footage, YouTube, or TikTok?", correct: true },
              { text: "Should I film it myself?", correct: false },
              { text: "What resolution should I generate it in?", correct: false }
            ],
            directorNote: "Before reaching for AI, check if the footage already exists. Brand assets, YouTube, TikTok — don't generate what you can grab in 10 seconds."
          },
          {
            id: 'q27',
            type: 'text',
            question: "You have two approaches: spend 20 minutes making one perfect B-roll clip, or spend 20 minutes making three 'good enough' clips. Which is better?",
            options: [
              { text: "One perfect clip — quality over quantity", correct: false },
              { text: "Three good enough clips — volume and testing beats perfection", correct: true },
              { text: "Neither — ask the client what they prefer", correct: false },
              { text: "Skip B-roll entirely and use text overlays", correct: false }
            ],
            directorNote: "More variations to test beats one 'perfect' version. The algorithm decides what works, not your taste. Ship more, test more, learn faster."
          }
        ]
      }
    ]
  },
  {
    id: 'w4',
    name: 'Ad Anatomy',
    subtitle: 'AD STRUCTURE & PSYCHOLOGY',
    themeColor: 'from-pink-600 to-rose-500',
    bgColor: 'bg-gradient-to-br from-pink-900/40 to-rose-900/20',
    borderColor: 'border-pink-500/30',
    accentColor: 'text-pink-400',
    order: 4,
    imageUrl: null,
    description: 'Hooks, trust-building, pain points, and analyzing winning ads.',
    unlockAfterWorld: 'w3',
    lessons: [
      {
        id: 'l10',
        title: 'Ad Editing Basics',
        subtitle: 'The anatomy of ads that convert',
        order: 1,
        videoUrl: 'https://www.loom.com/share/4e2292309a0c45f090b66bcb050513e4',
        videoType: 'loom',
        questions: [
          {
            id: 'q28',
            type: 'text',
            question: "What matters more for an ad's success — total views or driving purchases from the right audience?",
            options: [
              { text: "Total views — more eyeballs is always better", correct: false },
              { text: "Driving clicks and purchases from the right audience", correct: true },
              { text: "Engagement rate — likes and comments", correct: false },
              { text: "Watch time — longer is better", correct: false }
            ],
            directorNote: "Views mean nothing if the wrong people watch. Every editing decision should drive clicks and purchases from the RIGHT audience — not just accumulate views."
          },
          {
            id: 'q29',
            type: 'text',
            question: "What are the three structural pillars of an effective ad?",
            options: [
              { text: "Intro, features list, pricing", correct: false },
              { text: "Hook, body that builds trust, and social proof", correct: true },
              { text: "Problem, product demo, testimonial", correct: false },
              { text: "Attention, interest, desire", correct: false }
            ],
            directorNote: "Every converting ad has: a strong hook (stops the scroll), a body that builds trust and authority, and social proof that pushes them to buy."
          },
          {
            id: 'q30',
            type: 'text',
            question: "You're selecting clips for the 'agitation' section of an ad. What's your goal with clip selection?",
            options: [
              { text: "Show the product from multiple angles", correct: false },
              { text: "Use the most visually impressive footage available", correct: false },
              { text: "Choose clips that make the viewer FEEL the pain point — psychology drives clip selection", correct: true },
              { text: "Keep it short and move to the solution quickly", correct: false }
            ],
            directorNote: "Clip selection is psychology, not aesthetics. In the agitation phase, every clip should make the viewer feel the pain deeper. The worse it feels, the more they need the solution."
          },
          {
            id: 'q31',
            type: 'text',
            question: "You're studying a successful DrSquatch or HighSmile ad. What should you analyze first?",
            options: [
              { text: "The color grading and visual effects", correct: false },
              { text: "How the hook stops the scroll, how trust is built, and where social proof appears", correct: true },
              { text: "The music and sound design choices", correct: false },
              { text: "The product packaging and branding", correct: false }
            ],
            directorNote: "When analyzing winning ads, study the structure: how does the hook filter for the right audience? Where does trust get built? When does social proof land? Copy the framework, not the surface."
          }
        ]
      }
    ]
  }
];

export function getWorlds() {
  const storedVersion = parseInt(localStorage.getItem(SEED_VERSION_KEY) || '0', 10);
  if (storedVersion < CURRENT_SEED_VERSION) {
    // New seed data available — replace localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WORLDS));
    localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
    return SEED_WORLDS;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_WORLDS;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WORLDS));
  localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION));
  return SEED_WORLDS;
}

export function saveWorlds(worlds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(worlds));
}

export function getWorldById(worldId) {
  return getWorlds().find((w) => w.id === worldId) || null;
}

export function getLessonById(lessonId) {
  for (const world of getWorlds()) {
    const lesson = world.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, world };
  }
  return { lesson: null, world: null };
}

export function getAllLessonIds() {
  return getWorlds()
    .sort((a, b) => a.order - b.order)
    .flatMap((w) => w.lessons.sort((a, b) => a.order - b.order).map((l) => l.id));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}
