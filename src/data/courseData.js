// Course data — managed via admin portal, stored in localStorage
// Falls back to seed data on first load

const STORAGE_KEY = 'adlingo_course_data';

const SEED_WORLDS = [
  {
    id: 'w1',
    name: 'Timeline Town',
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
    name: 'CTA Canyon',
    subtitle: 'CLOSING MASTERY',
    themeColor: 'from-cyan-600 to-blue-500',
    bgColor: 'bg-gradient-to-br from-cyan-900/40 to-blue-900/20',
    borderColor: 'border-cyan-500/30',
    accentColor: 'text-cyan-400',
    order: 2,
    imageUrl: null,
    description: 'Building trust, showing the problem, and making them click.',
    unlockAfterWorld: 'w1',
    lessons: [
      {
        id: 'l4',
        title: 'Making Problems Visible',
        subtitle: 'Point the flashlight at invisible pain',
        order: 1,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q9',
            type: 'text',
            question: "The script says 'Toxins are building up in your gut.' You can't see toxins. What do you show?",
            options: [
              { text: "Person holding their stomach looking uncomfortable", correct: false },
              { text: "Text overlay saying 'TOXIC BUILDUP'", correct: false },
              { text: "3D animation of gross particles accumulating inside intestines", correct: true },
              { text: "Stock footage of unhealthy fast food", correct: false }
            ],
            directorNote: "Your job is 'pointing the flashlight' at invisible problems. 3D medical animations make the unseen feel REAL and urgent."
          },
          {
            id: 'q10',
            type: 'text',
            question: "The script says 'Our formula penetrates deep into the skin.' How do you visualize this?",
            options: [
              { text: "Close-up of someone applying the cream", correct: false },
              { text: "Text saying 'DEEP PENETRATION TECHNOLOGY'", correct: false },
              { text: "3D cross-section animation showing molecules going into skin layers", correct: true },
              { text: "Customer testimonial saying 'I could really feel it working'", correct: false }
            ],
            directorNote: "Claims need visual PROOF. 3D explainers feel scientific because documentaries use them."
          }
        ]
      },
      {
        id: 'l5',
        title: 'Social Proof',
        subtitle: 'Faces beat numbers every time',
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q11',
            type: 'text',
            question: "The script says 'Thousands of customers love it.' How do you visualize this?",
            options: [
              { text: "Text saying '10,000+ 5-Star Reviews'", correct: false },
              { text: "Screenshot of Amazon rating", correct: false },
              { text: "Grid of 6-9 different customers holding the product at once", correct: true },
              { text: "One emotional customer telling their story for 20 seconds", correct: false }
            ],
            directorNote: "Faces on screen = social proof. Seeing 6-9 real people at once triggers 'everyone has this, I'm missing out.'"
          },
          {
            id: 'q12',
            type: 'text',
            question: "The script mentions 'Recommended by Dr. Sarah Chen, Harvard Medical.' What visual do you add?",
            options: [
              { text: "Just show her name as text with 'MD' after it", correct: false },
              { text: "AI-generated headshot of a doctor", correct: false },
              { text: "Real photo/video of Dr. Chen in a white coat with Harvard logo visible", correct: true },
              { text: "Generic stock photo of a laboratory", correct: false }
            ],
            directorNote: "Authority needs VISUAL proof. Real face + real credentials + real institution visible on screen."
          }
        ]
      },
      {
        id: 'l6',
        title: 'CTA Engineering',
        subtitle: 'Make them click NOW',
        order: 3,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q13',
            type: 'text',
            question: "You're building the last 5 seconds. You have the logo and URL. The client says 'Make them click.' What do you add?",
            options: [
              { text: "Animated logo spin with brand jingle", correct: false },
              { text: "Arrow pointing at button + countdown timer + discount badge", correct: true },
              { text: "One more customer testimonial", correct: false },
              { text: "Fade to black with URL centered", correct: false }
            ],
            directorNote: "CTAs need Direction (arrow), Urgency (timer/deadline), and Value (discount/offer). Missing any = 30-50% fewer clicks."
          },
          {
            id: 'q14',
            type: 'text',
            question: "The client gives you a screenshot of their checkout page. Where do you put it in the ad?",
            options: [
              { text: "Don't use it—screenshots look unprofessional", correct: false },
              { text: "In the middle of the ad to break up the testimonials", correct: false },
              { text: "In the final CTA, so viewers know exactly what happens after they click", correct: true },
              { text: "At the very beginning as a hook", correct: false }
            ],
            directorNote: "Show them what's coming. When people see the landing page, they know what to expect."
          }
        ]
      }
    ]
  },
  {
    id: 'w3',
    name: 'Timeline Tundra',
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
        id: 'l7',
        title: 'The 2-Second Rule',
        subtitle: 'Never let a shot breathe too long',
        order: 1,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q15',
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
            id: 'q16',
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
            id: 'q17',
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
        id: 'l8',
        title: 'Sound Design',
        subtitle: 'If it moves, it needs a sound',
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q18',
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
            id: 'q19',
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
            id: 'q20',
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
    name: 'Clip Selection Caverns',
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
        id: 'l9',
        title: 'Pain Shots',
        subtitle: 'Show the problem they feel',
        order: 1,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q21',
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
            id: 'q22',
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
            id: 'q23',
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
            id: 'q24',
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
        id: 'l10',
        title: 'Proof Shots',
        subtitle: "Show, don't tell",
        order: 2,
        videoUrl: null,
        videoType: null,
        questions: [
          {
            id: 'q25',
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
            id: 'q26',
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
            id: 'q27',
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
            id: 'q28',
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
