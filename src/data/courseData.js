// Course data — managed via admin portal, stored in localStorage
// Falls back to seed data on first load

const STORAGE_KEY = 'adlingo_course_data';

const SEED_WORLDS = [
  {
    id: 'w1',
    name: 'Editing Town',
    subtitle: 'MASTER ATTENTION',
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
        title: 'Mindset Shift',
        subtitle: 'Think like a performance editor',
        order: 1,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q1',
            type: 'text',
            question: "You're editing an ad for luxury watches targeting 45-year-old executives. Your hook shows a flashy sports car. What's the problem?",
            options: [
              { text: "Sports cars are off-brand for luxury watches", correct: false },
              { text: "It will attract car enthusiasts who won't buy watches, training the algorithm wrong", correct: true },
              { text: "The footage is probably too expensive to license", correct: false },
              { text: "Sports cars only work for younger audiences", correct: false }
            ],
            directorNote: "The hook must FILTER for your buyer. Car content attracts car people. You need to attract watch people from second one, or the algorithm learns wrong."
          },
          {
            id: 'q2',
            type: 'text',
            question: "You finish editing an ad. It looks rough and 'ugly,' but the message is clear and the clips show the problem well. What do you do?",
            options: [
              { text: "Spend 2 more hours polishing transitions and color grading", correct: false },
              { text: "Add smooth transitions and motion graphics", correct: false },
              { text: "Ship it—clear message beats pretty visuals", correct: true },
              { text: "Send to client with a warning that it needs more work", correct: false }
            ],
            directorNote: "Production value doesn't sell. Psychology does. Some of the highest-converting ads look 'cheap.' Ship it and test."
          },
          {
            id: 'q3',
            type: 'text',
            question: "The script says 'millions of people have this problem.' How do you visualize this line?",
            options: [
              { text: "Text overlay saying 'MILLIONS AFFECTED'", correct: false },
              { text: "Stock footage of a crowded city street", correct: false },
              { text: "Grid of 6-9 different people all experiencing the problem", correct: true },
              { text: "Animated counter going from 0 to 1,000,000", correct: false }
            ],
            directorNote: "Faces beat numbers. Showing multiple real people triggers 'I'm not alone' and 'everyone has this.' Stats and text don't create that feeling."
          },
          {
            id: 'q4',
            type: 'text',
            question: "You're cutting between clips of different people talking. In clip 1, the person's face is center-left. Where should clip 2's subject be?",
            options: [
              { text: "Center-right for visual balance", correct: false },
              { text: "Full screen close-up for variety", correct: false },
              { text: "Center-left, same spot as clip 1", correct: true },
              { text: "Wherever they naturally are in the footage", correct: false }
            ],
            directorNote: "The viewer's eyes should stay in ONE spot. If the focal point jumps around, it's tiring and they scroll."
          }
        ]
      },
      {
        id: 'l2',
        title: 'AI Toolshop',
        subtitle: 'Filter for your buyer instantly',
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q5',
            type: 'text',
            question: "You're editing for a sleep supplement. The script starts with 'Can't fall asleep?' What visual do you open with?",
            options: [
              { text: "Product bottle with calming blue background", correct: false },
              { text: "Person tossing and turning, staring at ceiling at 3am", correct: true },
              { text: "Peaceful sunrise over mountains", correct: false },
              { text: "Happy customer waking up refreshed", correct: false }
            ],
            directorNote: "Show the PAIN first. Someone who sleeps fine will scroll away—good. You want insomniacs to stop and think 'that's me every night.'"
          },
          {
            id: 'q6',
            type: 'text',
            question: "The script says 'This miracle serum fixes everything.' You need a curiosity hook. What do you show?",
            options: [
              { text: "The product bottle with sparkle effects", correct: false },
              { text: "Close-up of clear, glowing skin (the result)", correct: false },
              { text: "Blurred/pixelated dropper applying mysterious liquid", correct: true },
              { text: "Before/after comparison side by side", correct: false }
            ],
            directorNote: "Blur or pixelate something and the brain MUST figure out what it is before scrolling. The mystery buys you 1-2 seconds of attention."
          }
        ]
      },
      {
        id: 'l3',
        title: 'Mindset',
        subtitle: 'Make them see themselves',
        order: 3,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q7',
            type: 'text',
            question: "The script says 'Are those wrinkles getting worse?' What angle do you use?",
            options: [
              { text: "Professional beauty shot with studio lighting", correct: false },
              { text: "Selfie-angle close-up, like someone checking themselves in a mirror", correct: true },
              { text: "Side profile showing the jawline", correct: false },
              { text: "Wide shot of person at a vanity table", correct: false }
            ],
            directorNote: "POV = Point of View. Show exactly what they SEE when they check their own face. That's the selfie/mirror angle—raw and relatable."
          },
          {
            id: 'q8',
            type: 'text',
            question: "You're selling yoga mats to beginners in their 40s. You have footage of a flexible 22-year-old doing advanced poses. What do you use instead?",
            options: [
              { text: "The 22-year-old but slow it down to look easier", correct: false },
              { text: "A 40-something doing simple stretches, looking a bit stiff", correct: true },
              { text: "Just the yoga mat with text about features", correct: false },
              { text: "The 22-year-old with 'You could be this flexible' text", correct: false }
            ],
            directorNote: "Viewers need to see THEMSELVES in the first 2 seconds. A stiff 40-year-old sells to stiff 40-year-olds."
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
        title: 'Top AI Tools',
        subtitle: 'Your AI content creation stack',
        order: 1,
        videoUrl: 'https://www.tella.tv/video/top-ai-tools-for-content-creation-06vv',
        videoType: 'tella',
        questions: [
          {
            id: 'q9',
            type: 'text',
            question: "You need a realistic voiceover, a talking head video, and a product B-roll. Which tool stack covers all three?",
            options: [
              { text: "Canva for everything", correct: false },
              { text: "ElevenLabs for voice, HeyGen for talking head, Sora for B-roll", correct: true },
              { text: "ChatGPT for voice, Midjourney for video, Runway for B-roll", correct: false },
              { text: "Just record everything yourself on your phone", correct: false }
            ],
            directorNote: "Each AI tool has a sweet spot. ElevenLabs = voices, HeyGen = talking heads, Sora/Veo = video generation. Know which tool to reach for."
          },
          {
            id: 'q10',
            type: 'text',
            question: "You have a script but no creator footage. What's the fastest way to produce the full ad?",
            options: [
              { text: "Wait for the client to send real UGC footage", correct: false },
              { text: "Use stock footage for everything", correct: false },
              { text: "Generate AI voice, AI talking head, and AI B-rolls from the script", correct: true },
              { text: "Hire a freelance videographer", correct: false }
            ],
            directorNote: "AI lets you go from script to full ad without waiting on anyone. Voice + talking head + generated B-roll = complete ad."
          }
        ]
      },
      {
        id: 'l5',
        title: 'Realistic AI Voices',
        subtitle: 'Clone and create voices with ElevenLabs',
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q11',
            type: 'text',
            question: "You need a voiceover that matches a brand's existing creator. What's the right workflow?",
            options: [
              { text: "Use a generic ElevenLabs preset voice", correct: false },
              { text: "Record yourself doing an impression", correct: false },
              { text: "Clone the creator's voice from a TikTok video using ElevenLabs instant voice cloning", correct: true },
              { text: "Use text-to-speech with the default voice", correct: false }
            ],
            directorNote: "ElevenLabs can clone a voice from a short sample. Clone from existing creator content so the brand voice stays consistent."
          },
          {
            id: 'q12',
            type: 'text',
            question: "You've created a voice in ElevenLabs. How should you name it so the team can find it later?",
            options: [
              { text: "Voice_001", correct: false },
              { text: "'Avatar first name' + 'brand name'", correct: true },
              { text: "The date you created it", correct: false },
              { text: "Just use the default auto-generated name", correct: false }
            ],
            directorNote: "Name voices as 'avatar name + brand' so anyone on the team can find the right voice instantly. No guessing."
          },
          {
            id: 'q13',
            type: 'text',
            question: "Your ElevenLabs v3 output sounds robotic. What do you do?",
            options: [
              { text: "Increase the speed to make it sound more natural", correct: false },
              { text: "Click 'enhance' before generating, and if it's still off, try v2", correct: true },
              { text: "Add background music to hide the robotic tone", correct: false },
              { text: "Re-write the script with simpler words", correct: false }
            ],
            directorNote: "Always try 'enhance' on v3 first. If the output still isn't right, v2 can sometimes deliver a more natural result. Always double-check."
          }
        ]
      },
      {
        id: 'l6',
        title: 'Talking Heads',
        subtitle: 'Create AI UGC with HeyGen',
        order: 3,
        videoUrl: 'https://www.loom.com/share/cae714a66611485d846673d6ea398ba4',
        videoType: 'loom',
        questions: [
          {
            id: 'q14',
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
            id: 'q15',
            type: 'text',
            question: "Which tools can you use to generate AI talking head videos?",
            options: [
              { text: "Canva and Figma", correct: false },
              { text: "HeyGen and Google Flow", correct: true },
              { text: "Premiere Pro and After Effects", correct: false },
              { text: "ChatGPT and Claude", correct: false }
            ],
            directorNote: "HeyGen (photo-to-video) and Google Flow are your go-to tools for generating realistic AI talking heads."
          }
        ]
      },
      {
        id: 'l7',
        title: 'Sora UGC Process',
        subtitle: 'Generate B-rolls without creators',
        order: 4,
        videoUrl: 'https://www.loom.com/share/49a7ed0a4c32432ea0479ff7012fb45a',
        videoType: 'loom',
        questions: [
          {
            id: 'q16',
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
            id: 'q17',
            type: 'text',
            question: "You have an inspo video you want to recreate with AI. What's the first step?",
            options: [
              { text: "Upload it directly to Sora and click 'remix'", correct: false },
              { text: "Deconstruct it in Gemini first, then move to Claude to refine the prompt", correct: true },
              { text: "Describe it from memory in a text prompt", correct: false },
              { text: "Send it to the client and ask them to reshoot it", correct: false }
            ],
            directorNote: "Gemini can break down a video into its components. Take that breakdown to your Claude project to turn it into a precise Sora prompt."
          }
        ]
      },
      {
        id: 'l8',
        title: 'Image Generation',
        subtitle: 'Create ad visuals that look real',
        order: 5,
        videoUrl: 'https://www.tella.tv/video/strategic-video-generation-focus-on-message-emotion-bc3x',
        videoType: 'tella',
        questions: [
          {
            id: 'q18',
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
            id: 'q19',
            type: 'text',
            question: "Your AI-generated person has a phone visible in the frame and a 'REC' timestamp overlay. How do you fix this?",
            options: [
              { text: "Crop the image to hide the phone", correct: false },
              { text: "Add 'no phone visible, no text no UI no timestamp no REC' to the prompt", correct: true },
              { text: "Paint it out in Photoshop", correct: false },
              { text: "Generate at a lower resolution", correct: false }
            ],
            directorNote: "Always explicitly exclude what you don't want in the prompt. AI will add phones and UI overlays unless you tell it not to."
          },
          {
            id: 'q20',
            type: 'text',
            question: "What format and resolution should UGC avatar images always be generated in?",
            options: [
              { text: "16:9, 1080p", correct: false },
              { text: "1:1 square, 4K", correct: false },
              { text: "9:16 vertical, 2K resolution", correct: true },
              { text: "4:3, 720p", correct: false }
            ],
            directorNote: "Always 9:16 vertical (phone format) at 2K resolution. This matches how people hold their phones and scroll social media."
          }
        ]
      },
      {
        id: 'l9',
        title: 'Frames to Videos',
        subtitle: 'Turn images into motion',
        order: 6,
        videoUrl: 'https://www.tella.tv/video/image-to-video-generation-with-vo-3-1-cling-3-0-g7r6',
        videoType: 'tella',
        questions: [
          {
            id: 'q21',
            type: 'text',
            question: "You need a quick B-roll from a product image. What's the fastest workflow?",
            options: [
              { text: "Animate it manually in After Effects", correct: false },
              { text: "Attach the frame in Claude, describe what you want, paste the prompt into Veo via Flow", correct: true },
              { text: "Upload to Canva and use their animation feature", correct: false },
              { text: "Just use a static image with a Ken Burns zoom", correct: false }
            ],
            directorNote: "For quick B-rolls: Claude writes the prompt, Flow/Veo generates the video. Fast and easy."
          },
          {
            id: 'q22',
            type: 'text',
            question: "You need a high-fidelity product application video (e.g., someone applying a serum). Which tool do you reach for?",
            options: [
              { text: "Sora — it's best for everything", correct: false },
              { text: "Veo via Flow — fastest for all video", correct: false },
              { text: "Kling AI frame mode — precise and high fidelity for application shots", correct: true },
              { text: "Just use stock footage", correct: false }
            ],
            directorNote: "Kling is slower but more precise. When you need high fidelity (product application, detailed movements), Kling beats Veo. Speed vs precision — pick the right tool."
          }
        ]
      },
      {
        id: 'l10',
        title: 'The Editing Mindset',
        subtitle: 'Work smarter, ship faster',
        order: 7,
        videoUrl: 'https://www.loom.com/share/317092ccaa0c477a9601e2a3f30b9549',
        videoType: 'loom',
        questions: [
          {
            id: 'q23',
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
            id: 'q24',
            type: 'text',
            question: "You need a B-roll of someone pouring coffee. What should you ask yourself first?",
            options: [
              { text: "Which AI model generates the best coffee?", correct: false },
              { text: "Do I even need AI for this, or can I find it in brand footage, YouTube, or TikTok?", correct: true },
              { text: "Should I film it myself?", correct: false },
              { text: "What resolution should I generate it in?", correct: false }
            ],
            directorNote: "Before reaching for AI, check if the footage already exists. Brand assets, YouTube, TikTok — don't generate what you can grab in 10 seconds."
          }
        ]
      }
    ]
  },
  {
    id: 'w3',
    name: 'Working Faster',
    subtitle: 'TECHNICAL PRECISION',
    themeColor: 'from-purple-600 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-900/40 to-violet-900/20',
    borderColor: 'border-purple-500/30',
    accentColor: 'text-purple-400',
    order: 3,
    imageUrl: null,
    description: 'The 2-second rule, sound design, and timeline mastery.',
    unlockAfterWorld: 'w2',
    lessons: [
      {
        id: 'l11',
        title: 'The 2-Second Rule',
        subtitle: 'Never let a shot breathe too long',
        order: 1,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q25',
            type: 'text',
            question: "Your timeline shows the same shot for 4 seconds straight. What do you do?",
            options: [
              { text: "Add a voiceover to keep it interesting", correct: false },
              { text: "Add a zoom, cut, or overlay at the 2-second mark", correct: true },
              { text: "Speed up the clip to 2x", correct: false },
              { text: "Leave it—some shots need breathing room", correct: false }
            ],
            directorNote: "Every 2-3 seconds needs a VISUAL change. Zoom, cut, text pop, overlay—anything you can SEE."
          },
          {
            id: 'q26',
            type: 'text',
            question: "You drag quickly through your timeline and notice the person's face jumps from left to center to right across cuts. What's wrong?",
            options: [
              { text: "The cuts are too fast", correct: false },
              { text: "The colors aren't matched between clips", correct: false },
              { text: "The focal point is jumping around—eyes can't rest in one spot", correct: true },
              { text: "Nothing—variety is good for engagement", correct: false }
            ],
            directorNote: "If the main thing jumps around the frame, viewers' eyes get tired and they swipe."
          },
          {
            id: 'q27',
            type: 'text',
            question: "Your talking-head video needs captions. Where do you place them?",
            options: [
              { text: "Top of the screen so they don't block the face", correct: false },
              { text: "Just below the chin, centered", correct: true },
              { text: "Left side where English readers start", correct: false },
              { text: "Bottom of the screen like movie subtitles", correct: false }
            ],
            directorNote: "Eyes focus on the face (center). Put captions just below the chin so eyes don't travel."
          }
        ]
      },
      {
        id: 'l12',
        title: 'Sound Design',
        subtitle: 'If it moves, it needs a sound',
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q28',
            type: 'text',
            question: "A text box slides onto the screen. Do you add a sound effect?",
            options: [
              { text: "No—sounds distract from the message", correct: false },
              { text: "Only if it's an important message", correct: false },
              { text: "Yes—add a 'whoosh' or 'pop' sound", correct: true },
              { text: "Only if there's no music playing", correct: false }
            ],
            directorNote: "Movement Rule: anything that MOVES needs a sound. Slide = whoosh. Pop-up = click."
          },
          {
            id: 'q29',
            type: 'text',
            question: "The script structure is: Problem -> Agitation -> Solution. You're picking music. What do you do?",
            options: [
              { text: "Use one consistent track throughout", correct: false },
              { text: "Start upbeat, then go quiet for the testimonials", correct: false },
              { text: "Start dark/tense, then switch to upbeat right when the product appears", correct: true },
              { text: "No music—let the voiceover carry it", correct: false }
            ],
            directorNote: "Music mirrors the emotional journey. Dark = 'life is hard.' Product appears = bright/upbeat = 'problem solved.'"
          },
          {
            id: 'q30',
            type: 'text',
            question: "The script says 'My joints were killing me.' The visual shows someone rubbing their knee. What sound do you add?",
            options: [
              { text: "Sad piano music", correct: false },
              { text: "A creaking/cracking bone sound effect", correct: true },
              { text: "The person's voice saying 'ouch'", correct: false },
              { text: "No sound—the visual speaks for itself", correct: false }
            ],
            directorNote: "Body sounds make pain REAL. Joints = creak. Back = crack. Stomach = rumble."
          }
        ]
      }
    ]
  },
  {
    id: 'w4',
    name: 'Troubleshooting',
    subtitle: 'VISUAL STORYTELLING',
    themeColor: 'from-pink-600 to-rose-500',
    bgColor: 'bg-gradient-to-br from-pink-900/40 to-rose-900/20',
    borderColor: 'border-pink-500/30',
    accentColor: 'text-pink-400',
    order: 4,
    imageUrl: null,
    description: 'Pain shots, proof shots, and choosing the right footage.',
    unlockAfterWorld: 'w3',
    lessons: [
      {
        id: 'l13',
        title: 'Pain Shots',
        subtitle: 'Show the problem they feel',
        order: 1,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q31',
            type: 'text',
            question: "You're editing for a dandruff shampoo. The script says 'Embarrassing flakes ruining your look?' What do you search for?",
            options: [
              { text: "Woman flipping shiny healthy hair in slow-mo", correct: false },
              { text: "Top-down close-up of scalp with visible white flakes", correct: true },
              { text: "Person happily washing hair in shower", correct: false },
              { text: "Split screen before/after transformation", correct: false }
            ],
            directorNote: "Show the PROBLEM. A gross close-up of flaky scalp makes people with dandruff think 'that's me.'"
          },
          {
            id: 'q32',
            type: 'text',
            question: "You're editing for a teeth whitening kit. 'Yellow teeth holding you back?' What shot opens the ad?",
            options: [
              { text: "Celebrity with perfect white smile", correct: false },
              { text: "Product box with '10 shades whiter' text", correct: false },
              { text: "Close-up of yellowed teeth next to a coffee cup", correct: true },
              { text: "Time-lapse of whitening process", correct: false }
            ],
            directorNote: "Show the embarrassing reality first. Coffee cup adds context. Pain before solution."
          },
          {
            id: 'q33',
            type: 'text',
            question: "You're editing for a posture corrector. 'Slouching all day?' What do you show?",
            options: [
              { text: "Person standing tall with perfect posture", correct: false },
              { text: "3D animation of healthy spine", correct: false },
              { text: "Someone hunched over laptop, rubbing their neck", correct: true },
              { text: "Athlete doing stretches", correct: false }
            ],
            directorNote: "Show the relatable moment they experience every day. Hunched at desk, in pain."
          },
          {
            id: 'q34',
            type: 'text',
            question: "You're editing for a foot cream. 'Cracked heels you're embarrassed to show?' What's your pain shot?",
            options: [
              { text: "Smooth feet on a beach towel", correct: false },
              { text: "Extreme close-up of dry, cracked heel skin", correct: true },
              { text: "Person applying cream at bedtime", correct: false },
              { text: "Testimonial about soft feet", correct: false }
            ],
            directorNote: "Gross close-ups work. They make people with that problem feel seen—and grossed out enough to want the fix NOW."
          }
        ]
      },
      {
        id: 'l14',
        title: 'Proof Shots',
        subtitle: "Show, don't tell",
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q35',
            type: 'text',
            question: "You're editing for a blender. 'Crushes ice in seconds.' How do you PROVE it?",
            options: [
              { text: "Show the blender on a kitchen counter", correct: false },
              { text: "Overhead shot of ice cubes being pulverized in real-time", correct: true },
              { text: "Happy family drinking smoothies", correct: false },
              { text: "Text listing motor specs and wattage", correct: false }
            ],
            directorNote: "Don't tell—SHOW. The satisfying destruction of ice cubes proves the claim better than any spec sheet."
          },
          {
            id: 'q36',
            type: 'text',
            question: "You're editing for waterproof shoes. 'Completely waterproof.' How do you prove it?",
            options: [
              { text: "Model walking on a rainy street", correct: false },
              { text: "Customer saying 'These are so waterproof!'", correct: false },
              { text: "Close-up of water being poured directly on shoe and beading off", correct: true },
              { text: "5-star review screenshots", correct: false }
            ],
            directorNote: "Pour water on it. Show the water bounce off. Visual proof beats any testimonial."
          },
          {
            id: 'q37',
            type: 'text',
            question: "You're editing for a vacuum. 'Picks up everything in one pass.' How do you prove it?",
            options: [
              { text: "Person smiling while vacuuming a clean floor", correct: false },
              { text: "Close-up of dirt and crumbs disappearing in one swipe", correct: true },
              { text: "The vacuum sitting in a tidy room", correct: false },
              { text: "Comparison chart vs competitors", correct: false }
            ],
            directorNote: "Show the problem (crumbs) disappearing in real-time. The satisfying 'suck' proves it works."
          },
          {
            id: 'q38',
            type: 'text',
            question: "You're editing for a stain remover. 'Removes stains instantly.' What's your money shot?",
            options: [
              { text: "Clean white shirt on a clothesline", correct: false },
              { text: "Product bottle with 'Powerful Formula' text", correct: false },
              { text: "Red wine stain disappearing as product is applied", correct: true },
              { text: "Person happily folding laundry", correct: false }
            ],
            directorNote: "The 'magic moment' is the stain vanishing in real-time. That transformation is what makes people believe and buy."
          }
        ]
      }
    ]
  }
];

export function getWorlds() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return SEED_WORLDS;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_WORLDS));
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
