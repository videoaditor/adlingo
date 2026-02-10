import React, { useState, useEffect } from 'react';
import { 
  Zap, Heart, Trophy, BookOpen, CheckCircle, XCircle, 
  Flame, Loader, AlertCircle, User, Play, Copy, RotateCcw, Lock, GraduationCap, Dumbbell
} from 'lucide-react';

// Assets
import robotStatic from './assets/adlingo robot static.png';
import robotThinking from './assets/adlingo robot thinking.png';
import robotDisappointed from './assets/adlingo robot dissapointed.png';

// --- MODE DETECTION ---
const getMode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'test' ? 'test' : 'train';
};

// --- 🛠️ COURSE DATA WITH LEVELS 🛠️ ---
const COURSE_DATA = [
  {
    id: 1,
    title: "Level 1: Core Philosophy",
    description: "How to think like a performance editor.",
    color: "bg-green-500",
    levels: [
      {
        id: "l1",
        title: "Mindset Shift",
        icon: "🧠",
        xOffset: 0,
        questions: [
          {
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
            question: "You're cutting between clips of different people talking. In clip 1, the person's face is center-left. Where should clip 2's subject be?",
            options: [
              { text: "Center-right for visual balance", correct: false },
              { text: "Full screen close-up for variety", correct: false },
              { text: "Center-left, same spot as clip 1", correct: true },
              { text: "Wherever they naturally are in the footage", correct: false }
            ],
            directorNote: "The viewer's eyes should stay in ONE spot. If the focal point jumps around, it's tiring and they scroll. Keep faces/action in the same position across cuts."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Level 2: The Hook",
    description: "The first 3 seconds decide everything.",
    color: "bg-purple-500",
    levels: [
      {
        id: "l2",
        title: "Disqualification Hooks",
        icon: "🚫",
        xOffset: 0,
        questions: [
          {
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
        id: "l3",
        title: "POV & Mirroring",
        icon: "🪞",
        xOffset: 40,
        questions: [
          {
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
            question: "You're selling yoga mats to beginners in their 40s. You have footage of a flexible 22-year-old doing advanced poses. What do you use instead?",
            options: [
              { text: "The 22-year-old but slow it down to look easier", correct: false },
              { text: "A 40-something doing simple stretches, looking a bit stiff", correct: true },
              { text: "Just the yoga mat with text about features", correct: false },
              { text: "The 22-year-old with 'You could be this flexible' text", correct: false }
            ],
            directorNote: "Viewers need to see THEMSELVES in the first 2 seconds. A stiff 40-year-old sells to stiff 40-year-olds. They'll scroll past anyone who doesn't look like them."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Level 3: The Body",
    description: "Building trust and showing the problem.",
    color: "bg-blue-500",
    levels: [
      {
        id: "l4",
        title: "Making Problems Visible",
        icon: "🔦",
        xOffset: 0,
        questions: [
          {
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
            question: "The script says 'Our formula penetrates deep into the skin.' How do you visualize this?",
            options: [
              { text: "Close-up of someone applying the cream", correct: false },
              { text: "Text saying 'DEEP PENETRATION TECHNOLOGY'", correct: false },
              { text: "3D cross-section animation showing molecules going into skin layers", correct: true },
              { text: "Customer testimonial saying 'I could really feel it working'", correct: false }
            ],
            directorNote: "Claims need visual PROOF. 3D explainers feel scientific because documentaries use them. Viewers assume real research happened."
          }
        ]
      },
      {
        id: "l5",
        title: "Social Proof",
        icon: "👥",
        xOffset: -40,
        questions: [
          {
            question: "The script says 'Thousands of customers love it.' How do you visualize this?",
            options: [
              { text: "Text saying '10,000+ 5-Star Reviews'", correct: false },
              { text: "Screenshot of Amazon rating", correct: false },
              { text: "Grid of 6-9 different customers holding the product at once", correct: true },
              { text: "One emotional customer telling their story for 20 seconds", correct: false }
            ],
            directorNote: "Faces on screen = social proof. Seeing 6-9 real people at once triggers 'everyone has this, I'm missing out.' Numbers don't do that."
          },
          {
            question: "The script mentions 'Recommended by Dr. Sarah Chen, Harvard Medical.' What visual do you add?",
            options: [
              { text: "Just show her name as text with 'MD' after it", correct: false },
              { text: "AI-generated headshot of a doctor", correct: false },
              { text: "Real photo/video of Dr. Chen in a white coat with Harvard logo visible", correct: true },
              { text: "Generic stock photo of a laboratory", correct: false }
            ],
            directorNote: "Authority needs VISUAL proof. Real face + real credentials + real institution visible on screen. Anything less feels fake."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Level 4: Timeline Rules",
    description: "The technical rules of editing.",
    color: "bg-cyan-500",
    levels: [
      {
        id: "l6",
        title: "The 2-Second Rule",
        icon: "⏱️",
        xOffset: 0,
        questions: [
          {
            question: "Your timeline shows the same shot for 4 seconds straight. What do you do?",
            options: [
              { text: "Add a voiceover to keep it interesting", correct: false },
              { text: "Add a zoom, cut, or overlay at the 2-second mark", correct: true },
              { text: "Speed up the clip to 2x", correct: false },
              { text: "Leave it—some shots need breathing room", correct: false }
            ],
            directorNote: "Every 2-3 seconds needs a VISUAL change. Zoom, cut, text pop, overlay—anything you can SEE. Audio changes alone don't reset attention."
          },
          {
            question: "You drag quickly through your timeline (scrub test) and notice the person's face jumps from left to center to right across cuts. What's wrong?",
            options: [
              { text: "The cuts are too fast", correct: false },
              { text: "The colors aren't matched between clips", correct: false },
              { text: "The focal point is jumping around—eyes can't rest in one spot", correct: true },
              { text: "Nothing—variety is good for engagement", correct: false }
            ],
            directorNote: "If the main thing jumps around the frame, viewers' eyes get tired and they swipe. Keep faces/action in the same screen position."
          },
          {
            question: "Your talking-head video needs captions. Where do you place them?",
            options: [
              { text: "Top of the screen so they don't block the face", correct: false },
              { text: "Just below the chin, centered", correct: true },
              { text: "Left side where English readers start", correct: false },
              { text: "Bottom of the screen like movie subtitles", correct: false }
            ],
            directorNote: "Eyes focus on the face (center). Put captions just below the chin so eyes don't travel. Everything stays in one zone."
          }
        ]
      },
      {
        id: "l7",
        title: "Sound Design",
        icon: "🔊",
        xOffset: 40,
        questions: [
          {
            question: "A text box slides onto the screen. Do you add a sound effect?",
            options: [
              { text: "No—sounds distract from the message", correct: false },
              { text: "Only if it's an important message", correct: false },
              { text: "Yes—add a 'whoosh' or 'pop' sound", correct: true },
              { text: "Only if there's no music playing", correct: false }
            ],
            directorNote: "Movement Rule: anything that MOVES needs a sound. Slide = whoosh. Pop-up = click. Movement without sound feels incomplete."
          },
          {
            question: "The script structure is: Problem → Agitation → Solution. You're picking music. What do you do?",
            options: [
              { text: "Use one consistent track throughout", correct: false },
              { text: "Start upbeat, then go quiet for the testimonials", correct: false },
              { text: "Start dark/tense, then switch to upbeat right when the product appears", correct: true },
              { text: "No music—let the voiceover carry it", correct: false }
            ],
            directorNote: "Music mirrors the emotional journey. Dark = 'life is hard.' The second the product shows, switch to bright/upbeat = 'problem solved.'"
          },
          {
            question: "The script says 'My joints were killing me.' The visual shows someone rubbing their knee. What sound do you add UNDER the visual?",
            options: [
              { text: "Sad piano music", correct: false },
              { text: "A creaking/cracking bone sound effect", correct: true },
              { text: "The person's voice saying 'ouch'", correct: false },
              { text: "No sound—the visual speaks for itself", correct: false }
            ],
            directorNote: "Body sounds make pain REAL. Joints = creak. Back = crack. Stomach = rumble. Viewers feel it in their own body."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Level 5: Clip Selection",
    description: "What would you search for?",
    color: "bg-pink-500",
    levels: [
      {
        id: "l8",
        title: "Pain Shots",
        icon: "🎬",
        xOffset: 0,
        questions: [
          {
            question: "You're editing for a dandruff shampoo. The script says 'Embarrassing flakes ruining your look?' What do you search for?",
            options: [
              { text: "Woman flipping shiny healthy hair in slow-mo", correct: false },
              { text: "Top-down close-up of scalp with visible white flakes", correct: true },
              { text: "Person happily washing hair in shower", correct: false },
              { text: "Split screen before/after transformation", correct: false }
            ],
            directorNote: "Show the PROBLEM. A gross close-up of flaky scalp makes people with dandruff think 'that's me.' They feel the urgency."
          },
          {
            question: "You're editing for a teeth whitening kit. The script says 'Yellow teeth holding you back?' What shot opens the ad?",
            options: [
              { text: "Celebrity with perfect white smile", correct: false },
              { text: "Product box with '10 shades whiter' text", correct: false },
              { text: "Close-up of yellowed teeth next to a coffee cup", correct: true },
              { text: "Time-lapse of whitening process", correct: false }
            ],
            directorNote: "Show the embarrassing reality first. Coffee cup adds context (why they're stained). Pain before solution."
          },
          {
            question: "You're editing for a posture corrector. The script says 'Slouching all day?' What do you show?",
            options: [
              { text: "Person standing tall with perfect posture", correct: false },
              { text: "3D animation of healthy spine", correct: false },
              { text: "Someone hunched over laptop, rubbing their neck", correct: true },
              { text: "Athlete doing stretches", correct: false }
            ],
            directorNote: "Show the relatable moment they experience every day. Hunched at desk, in pain. They see themselves and feel understood."
          },
          {
            question: "You're editing for a foot cream. The script says 'Cracked heels you're embarrassed to show?' What's your pain shot?",
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
        id: "l9",
        title: "Proof Shots",
        icon: "✨",
        xOffset: 40,
        questions: [
          {
            question: "You're editing for a blender. The script says 'Crushes ice in seconds.' How do you PROVE it?",
            options: [
              { text: "Show the blender on a kitchen counter", correct: false },
              { text: "Overhead shot of ice cubes being pulverized in real-time", correct: true },
              { text: "Happy family drinking smoothies", correct: false },
              { text: "Text listing motor specs and wattage", correct: false }
            ],
            directorNote: "Don't tell—SHOW. The satisfying destruction of ice cubes proves the claim better than any spec sheet."
          },
          {
            question: "You're editing for waterproof shoes. The script says 'Completely waterproof.' How do you prove it?",
            options: [
              { text: "Model walking on a rainy street", correct: false },
              { text: "Customer saying 'These are so waterproof!'", correct: false },
              { text: "Close-up of water being poured directly on shoe and beading off", correct: true },
              { text: "5-star review screenshots", correct: false }
            ],
            directorNote: "Pour water on it. Show the water bounce off. Visual proof beats any testimonial or review for product claims."
          },
          {
            question: "You're editing for a vacuum. The script says 'Picks up everything in one pass.' How do you prove it?",
            options: [
              { text: "Person smiling while vacuuming a clean floor", correct: false },
              { text: "Close-up of dirt and crumbs disappearing in one swipe", correct: true },
              { text: "The vacuum sitting in a tidy room", correct: false },
              { text: "Comparison chart vs competitors", correct: false }
            ],
            directorNote: "Show the problem (crumbs) disappearing in real-time. The satisfying 'suck' proves it works."
          },
          {
            question: "You're editing for a stain remover. The script says 'Removes stains instantly.' What's your money shot?",
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
  },
  {
    id: 6,
    title: "Level 6: The CTA",
    description: "Making them click.",
    color: "bg-orange-500",
    levels: [
      {
        id: "l10",
        title: "CTA Engineering",
        icon: "🎯",
        xOffset: 0,
        questions: [
          {
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
            question: "The client gives you a screenshot of their checkout page. Where do you put it in the ad?",
            options: [
              { text: "Don't use it—screenshots look unprofessional", correct: false },
              { text: "In the middle of the ad to break up the testimonials", correct: false },
              { text: "In the final CTA, so viewers know exactly what happens after they click", correct: true },
              { text: "At the very beginning as a hook", correct: false }
            ],
            directorNote: "Show them what's coming. When people see the landing page, they know what to expect. No surprises = more confidence = more clicks."
          }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Level 7: B-roll Density",
    description: "The #1 mistake that kills retention.",
    color: "bg-red-500",
    levels: [
      {
        id: "l11",
        title: "The 2-3 Second Rule",
        icon: "⏱️",
        xOffset: 0,
        questions: [
          {
            question: "Your timeline shows a talking head for 8 seconds straight. What do you do?",
            options: [
              { text: "Add a zoom at the 4-second mark", correct: false },
              { text: "Cut to b-roll at 2-second mark, back to face, b-roll again at 5 seconds", correct: true },
              { text: "Speed up the talking head to 1.2x", correct: false },
              { text: "It's fine—let the message breathe", correct: false }
            ],
            directorNote: "B-roll every 2-3 seconds. NOT every 10 seconds. The eye needs constant visual change or it scrolls. A zoom doesn't count as a scene change."
          },
          {
            question: "The script says 'I tried everything—diets, exercise, supplements, nothing worked.' How many b-roll clips do you need for this line?",
            options: [
              { text: "1 long montage clip", correct: false },
              { text: "4-5 quick cuts (sad eating, treadmill, pills, frustrated face, scale)", correct: true },
              { text: "Just text overlay listing 'Diets, Exercise, Supplements'", correct: false },
              { text: "Keep on talking head with sad music underneath", correct: false }
            ],
            directorNote: "Each item in the list = its own visual. 'Diets' = sad salad eating. 'Exercise' = struggling on treadmill. 'Supplements' = pill bottles. SHOW each one."
          },
          {
            question: "You scrub through your timeline quickly. You notice it looks 'static' even though there's b-roll. What's wrong?",
            options: [
              { text: "The b-roll clips are too similar to each other", correct: false },
              { text: "The b-roll clips are too long—they're 5-10 seconds each instead of 1-2 seconds", correct: true },
              { text: "The b-roll needs color grading to stand out", correct: false },
              { text: "There's no music underneath", correct: false }
            ],
            directorNote: "The scrub test reveals pacing. If you scrub and it looks like a slideshow, your clips are too long. B-roll should be 1-2 second bursts, not 5+ second holds."
          },
          {
            question: "The voiceover says 'Within just 2 weeks, I saw results.' How do you visualize this?",
            options: [
              { text: "Calendar animation showing 14 days passing", correct: false },
              { text: "Before/after comparison appearing side by side", correct: false },
              { text: "Text saying '2 WEEKS' then quick cut to smiling result shot", correct: true },
              { text: "Timer counting up from 0 to 14", correct: false }
            ],
            directorNote: "Speed > accuracy for b-roll. A quick text flash + result shot takes 1.5 seconds. A calendar animation takes 3-4 seconds. Faster = higher retention."
          }
        ]
      },
      {
        id: "l12",
        title: "Visual Matching",
        icon: "🎯",
        xOffset: 40,
        questions: [
          {
            question: "The script mentions 'bloating after every meal.' You have 3 clips: someone holding stomach, someone looking in mirror, someone pushing away food. What do you use?",
            options: [
              { text: "Just the stomach-holding clip—it's the most direct", correct: false },
              { text: "All 3 in rapid succession (0.8s each) to show the full experience", correct: true },
              { text: "The mirror clip because it shows self-consciousness", correct: false },
              { text: "The food-pushing clip because it implies the consequence", correct: false }
            ],
            directorNote: "One problem = multiple angles. Stomach holding, then mirror check, then food frustration—all in 2.5 seconds. The viewer FEELS the full experience."
          },
          {
            question: "The script says 'My joints were killing me.' What do you search for in your b-roll library?",
            options: [
              { text: "Person sitting sadly on couch", correct: false },
              { text: "3D medical animation of inflamed joints", correct: false },
              { text: "Close-up of hands rubbing knee + person wincing + standing up slowly", correct: true },
              { text: "Doctor pointing at X-ray", correct: false }
            ],
            directorNote: "Pain needs SPECIFIC visuals. Not 'sad person'—knee rubbing, wincing, struggling to stand. The viewer should almost feel it in THEIR joints."
          },
          {
            question: "The script says 'Waking up tired, dragging through the day.' How many scene changes should this line have?",
            options: [
              { text: "2 scenes (waking up + dragging through day)", correct: false },
              { text: "4-5 scenes (alarm, rubbing eyes, coffee, yawning at desk, checking time)", correct: true },
              { text: "1 long shot of someone looking exhausted", correct: false },
              { text: "Just show a clock going from 6am to 6pm", correct: false }
            ],
            directorNote: "This line is ~3 seconds when spoken. That's 4-5 b-roll cuts at 0.6-0.8 seconds each. Alarm BEEP, rub eyes, reach for coffee, yawn, clock check. Rapid fire."
          }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Level 8: UGC Realism",
    description: "Making AI and stock look authentic.",
    color: "bg-teal-500",
    levels: [
      {
        id: "l13",
        title: "Logistical Realism",
        icon: "📱",
        xOffset: 0,
        questions: [
          {
            question: "You're creating a 'bathroom mirror selfie check' moment. What lighting setup do you look for?",
            options: [
              { text: "Soft ring light with beauty filter", correct: false },
              { text: "Harsh overhead vanity lights, unflattering angles, maybe slightly yellow", correct: true },
              { text: "Natural window light from the side", correct: false },
              { text: "Professional 3-point lighting setup", correct: false }
            ],
            directorNote: "UGC should look like real people actually film. Bathroom lights are harsh and unflattering. That's what makes it REAL."
          },
          {
            question: "The brief says 'someone applying the serum in their bathroom.' What camera angle screams 'this is real UGC'?",
            options: [
              { text: "Tripod at eye level, perfectly framed", correct: false },
              { text: "Phone propped against something, slightly tilted, maybe cut off at edges", correct: true },
              { text: "Over-the-shoulder professional shot", correct: false },
              { text: "Mirror reflection with ring light visible", correct: false }
            ],
            directorNote: "Ask: 'How would a normal person actually film this?' Phone propped against a shampoo bottle. Slightly crooked. Maybe finger covering corner briefly. That's UGC."
          },
          {
            question: "You're generating AI footage of someone taking a supplement. The image looks too perfect. What imperfection do you add?",
            options: [
              { text: "Heavy Instagram filter", correct: false },
              { text: "Slight motion blur, compression artifacts, maybe a strand of hair out of place", correct: true },
              { text: "Dramatic shadows", correct: false },
              { text: "Vintage film grain overlay", correct: false }
            ],
            directorNote: "Real phone videos have motion blur, focus hunting, compression. AI images look too crisp. Add imperfection to sell authenticity."
          },
          {
            question: "The script needs a 'frustrated person at their desk' shot. What background details make it feel real?",
            options: [
              { text: "Clean minimalist desk with one plant", correct: false },
              { text: "Cluttered desk—water bottle, random papers, maybe a snack wrapper, cables", correct: true },
              { text: "Blurred background so desk details don't distract", correct: false },
              { text: "Aesthetic home office with matching accessories", correct: false }
            ],
            directorNote: "Real people have messy desks. Random water bottles. Tangled cables. Post-it notes. The clutter = authenticity."
          }
        ]
      },
      {
        id: "l14",
        title: "Demo > Pitch",
        icon: "🎬",
        xOffset: -40,
        questions: [
          {
            question: "You have two hooks: (A) Person talking about how great the product is, (B) Close-up of the product DOING the thing. Which is your A-test?",
            options: [
              { text: "A—testimonials build trust first", correct: false },
              { text: "B—demo hooks outperform pitch hooks 2-3x", correct: true },
              { text: "Start with A, then quickly show B", correct: false },
              { text: "Use both simultaneously in split screen", correct: false }
            ],
            directorNote: "Our data shows demo ads beat pitch ads consistently. SHOW the product working. Don't tell me it works."
          },
          {
            question: "The product is a blender. What's a demo hook vs a pitch hook?",
            options: [
              { text: "Demo: someone smiling while drinking smoothie. Pitch: ice being pulverized.", correct: false },
              { text: "Demo: ice being pulverized in real-time. Pitch: person talking about motor power.", correct: true },
              { text: "Demo: before/after comparison. Pitch: customer review.", correct: false },
              { text: "They're the same thing with different words.", correct: false }
            ],
            directorNote: "Demo = the product DOING. Pitch = someone TALKING about the product. Ice getting destroyed = demo. 'This blender is so powerful' = pitch."
          },
          {
            question: "The script says 'Watch how easy this is.' Why is this line powerful?",
            options: [
              { text: "The word 'easy' appeals to lazy buyers", correct: false },
              { text: "'Watch' is a direct call to action", correct: false },
              { text: "It promises a DEMONSTRATION is coming—creates anticipation", correct: true },
              { text: "It's not powerful, it's generic", correct: false }
            ],
            directorNote: "'Watch how...' creates anticipation for proof. The viewer expects to SEE something. Now you MUST deliver a visual demo or you break the promise."
          }
        ]
      }
    ]
  }
];

// Flatten all questions for test mode
const ALL_QUESTIONS = COURSE_DATA.flatMap(unit => 
  unit.levels.flatMap(level => 
    level.questions.map(q => ({ ...q, levelTitle: level.title, unitTitle: unit.title }))
  )
);

const TOTAL_QUESTIONS = ALL_QUESTIONS.length;

// Get all level IDs in order
const ALL_LEVEL_IDS = COURSE_DATA.flatMap(unit => unit.levels.map(l => l.id));

// --- TIER CONFIGURATION ---
const getTierData = (score) => {
  if (score >= 94) {
    return {
      tier: "The Unicorn",
      emoji: "🦄",
      color: "from-purple-600 to-pink-500",
      bgColor: "bg-purple-900",
      borderColor: "border-purple-500",
      textColor: "text-purple-300",
      headline: "You Get It.",
      body: "You know editing is about psychology, not fancy effects. Media buyers want to work with you. You make ads that print money."
    };
  } else if (score >= 80) {
    return {
      tier: "Scaling Specialist",
      emoji: "🚀",
      color: "from-green-500 to-emerald-400",
      bgColor: "bg-green-900",
      borderColor: "border-green-500",
      textColor: "text-green-300",
      headline: "Almost There.",
      body: "You know the basics well. A few more details about attention and psychology and you'll be unstoppable."
    };
  } else if (score >= 60) {
    return {
      tier: "Breakeven Editor",
      emoji: "📉",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-900",
      borderColor: "border-orange-500",
      textColor: "text-orange-300",
      headline: "Not Bad, But...",
      body: "Your ads look nice but don't make money. You're focused on pretty visuals instead of what makes people buy. Review the training!"
    };
  } else {
    return {
      tier: "Budget Burner",
      emoji: "🔥",
      color: "from-red-600 to-red-500",
      bgColor: "bg-red-900",
      borderColor: "border-red-500",
      textColor: "text-red-300",
      headline: "Time to Learn!",
      body: "You're editing like a filmmaker, not a salesperson. That burns ad budget. Go through the training mode to learn the rules."
    };
  }
};

// --- MAIN APP ---
const App = () => {
  const [mode] = useState(getMode()); // 'test' or 'train'
  const [view, setView] = useState('home'); // home, lesson, results, test
  const [activeLevel, setActiveLevel] = useState(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [levelScores, setLevelScores] = useState({});
  const [copied, setCopied] = useState(false);
  
  // Test mode state
  const [testAnswers, setTestAnswers] = useState({});
  const [currentTestQ, setCurrentTestQ] = useState(0);
  const [selectedTestOpt, setSelectedTestOpt] = useState(null);

  // Check if all levels are completed
  const allComplete = ALL_LEVEL_IDS.every(id => completedLevels.includes(id));

  // Calculate total score (works for both modes)
  const totalCorrect = mode === 'test' 
    ? Object.values(testAnswers).filter(Boolean).length
    : Object.values(levelScores).reduce((acc, s) => acc + s.correct, 0);
  const score = Math.round((totalCorrect / TOTAL_QUESTIONS) * 100);
  const tierData = getTierData(score);

  const startLevel = (level, isLocked) => {
    if (isLocked) return;
    setActiveLevel(level);
    setView('lesson');
  };

  const completeLevel = (levelId, correct, total) => {
    setCompletedLevels(prev => [...new Set([...prev, levelId])]);
    setLevelScores(prev => ({ ...prev, [levelId]: { correct, total } }));
    
    const newCompleted = [...new Set([...completedLevels, levelId])];
    if (ALL_LEVEL_IDS.every(id => newCompleted.includes(id))) {
      setView('results');
    } else {
      setView('home');
    }
  };

  const resetQuiz = () => {
    setCompletedLevels([]);
    setLevelScores({});
    setTestAnswers({});
    setCurrentTestQ(0);
    setSelectedTestOpt(null);
    setView('home');
  };

  const startTest = () => {
    setTestAnswers({});
    setCurrentTestQ(0);
    setSelectedTestOpt(null);
    setView('test');
  };

  const submitTestAnswer = () => {
    if (selectedTestOpt === null) return;
    const q = ALL_QUESTIONS[currentTestQ];
    const isCorrect = q.options[selectedTestOpt].correct;
    setTestAnswers(prev => ({ ...prev, [currentTestQ]: isCorrect }));
    
    if (currentTestQ + 1 < TOTAL_QUESTIONS) {
      setCurrentTestQ(i => i + 1);
      setSelectedTestOpt(null);
    } else {
      setView('results');
    }
  };

  const copyResult = () => {
    const modeLabel = mode === 'test' ? 'Certification Test' : 'Training';
    const text = `I just scored ${score}/100 (${tierData.tier} ${tierData.emoji}) on the Adlingo ${modeLabel}. Can you beat my ROAS? https://adlingo.onrender.com${mode === 'test' ? '?mode=test' : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================
  // TEST MODE - HOME SCREEN
  // ============================================
  if (mode === 'test' && view === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <img src={robotStatic} alt="Adlingo Bot" className="w-32 h-32 mx-auto mb-6" />
          <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 mb-2">
            ADLINGO
          </h1>
          <p className="text-gray-400 mb-8">Performance Editor Certification Test</p>

          <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700 text-left">
            <div className="flex items-center mb-4">
              <GraduationCap className="text-orange-400 mr-3" size={24} />
              <span className="font-bold text-lg">Exam Rules</span>
            </div>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• {TOTAL_QUESTIONS} questions total</li>
              <li>• No feedback until the end</li>
              <li>• Your final score will be revealed after submission</li>
              <li>• Results are screenshot-ready for sharing</li>
            </ul>
          </div>

          <button 
            onClick={startTest}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-orange-700 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            Begin Certification
          </button>

          <a 
            href="/"
            className="block mt-6 text-gray-500 hover:text-gray-300 text-sm transition"
          >
            ← Switch to Training Mode
          </a>
        </div>
      </div>
    );
  }

  // ============================================
  // TEST MODE - QUIZ FLOW (No Feedback)
  // ============================================
  if (mode === 'test' && view === 'test') {
    const q = ALL_QUESTIONS[currentTestQ];
    const progress = ((currentTestQ) / TOTAL_QUESTIONS) * 100;

    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
        {/* Top Bar */}
        <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-800">
          <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-gray-400 font-bold text-sm">{currentTestQ + 1}/{TOTAL_QUESTIONS}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700">
                {q.unitTitle}
              </span>
            </div>

            <h2 className="text-xl font-black text-center mb-8 leading-tight">{q.question}</h2>

            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTestOpt(idx)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left font-medium transition-all
                    ${selectedTestOpt === idx 
                      ? 'border-orange-500 bg-orange-500/10 text-orange-300' 
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}
                  `}
                >
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-3 text-sm font-black shrink-0
                      ${selectedTestOpt === idx ? 'border-orange-500 text-orange-500' : 'border-gray-600 text-gray-600'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="pt-1">{opt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 w-full bg-gray-900/98 border-t border-gray-800 backdrop-blur-lg">
          <div className="max-w-2xl mx-auto p-4">
            <button 
              onClick={submitTestAnswer}
              disabled={selectedTestOpt === null}
              className="w-full py-4 rounded-xl font-black text-base uppercase tracking-wider transition-all bg-orange-500 hover:bg-orange-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTestQ + 1 < TOTAL_QUESTIONS ? 'Next Question' : 'Submit & See Results'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // TRAINING MODE - HOME (The Map)
  // ============================================
  if (mode === 'train' && view === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={robotStatic} alt="Adlingo Bot" className="w-10 h-10 object-contain" />
            <div className="font-black text-xl tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              ADLINGO
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm font-bold">
            <a 
              href="?mode=test" 
              className="text-gray-500 hover:text-orange-400 flex items-center bg-gray-800 px-3 py-1 rounded-full border border-gray-700 transition"
            >
              <GraduationCap size={14} className="mr-1" /> Test
            </a>
            <div className="text-orange-400 flex items-center bg-orange-500/10 px-3 py-1 rounded-full">
              <Trophy size={16} className="mr-1" /> {completedLevels.length}/{ALL_LEVEL_IDS.length}
            </div>
          </div>
        </header>

        {/* Progress Banner */}
        <div className="p-4">
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-400 flex items-center">
                <Dumbbell size={14} className="mr-2" /> Training Progress
              </span>
              <span className="text-sm font-bold text-orange-400">{Math.round((completedLevels.length / ALL_LEVEL_IDS.length) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${(completedLevels.length / ALL_LEVEL_IDS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Map */}
        <div className="p-4 pb-24 space-y-8">
          {COURSE_DATA.map((unit) => (
            <div key={unit.id} className="max-w-2xl mx-auto">
              <div className={`p-5 rounded-2xl mb-8 ${unit.color} text-white shadow-lg border-b-4 border-black/20 relative overflow-hidden`}>
                <div className="relative z-10">
                  <h2 className="font-black text-lg uppercase tracking-wider">{unit.title}</h2>
                  <p className="opacity-90 text-sm mt-1">{unit.description}</p>
                </div>
                <Zap size={70} className="absolute -right-2 -bottom-2 opacity-20 rotate-12 text-black" />
              </div>

              <div className="flex flex-col items-center space-y-6">
                {unit.levels.map((level) => {
                  const isCompleted = completedLevels.includes(level.id);
                  const globalLevelIndex = ALL_LEVEL_IDS.indexOf(level.id);
                  const prevLevelId = globalLevelIndex > 0 ? ALL_LEVEL_IDS[globalLevelIndex - 1] : null;
                  const isLocked = !isCompleted && prevLevelId && !completedLevels.includes(prevLevelId);
                  const levelScore = levelScores[level.id];

                  return (
                    <div 
                      key={level.id}
                      style={{ transform: `translateX(${level.xOffset}px)` }}
                      className="flex flex-col items-center"
                    >
                      <button
                        onClick={() => startLevel(level, isLocked)}
                        disabled={isLocked}
                        className={`
                          w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-2xl
                          transition-all duration-150 active:translate-y-1 active:shadow-none
                          ${isCompleted 
                            ? 'bg-yellow-400 border-b-6 border-yellow-600 shadow-[0_6px_0_0_rgba(202,138,4,1)]' 
                            : isLocked
                              ? 'bg-gray-700 border-b-6 border-gray-800 shadow-[0_6px_0_0_rgba(31,41,55,1)] opacity-60 cursor-not-allowed'
                              : 'bg-green-500 border-b-6 border-green-700 shadow-[0_6px_0_0_rgba(21,128,61,1)] hover:bg-green-400 cursor-pointer'}
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="text-yellow-900" size={28} strokeWidth={3} />
                        ) : isLocked ? (
                          <Lock className="text-gray-500" size={24} />
                        ) : (
                          <span>{level.icon}</span>
                        )}
                      </button>
                      
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-bold uppercase tracking-wide ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                          {level.title}
                        </div>
                        {levelScore && (
                          <div className="text-xs text-green-400 font-bold mt-1">
                            {levelScore.correct}/{levelScore.total} correct
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {allComplete && (
            <div className="max-w-2xl mx-auto pt-8">
              <button
                onClick={() => setView('results')}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg rounded-2xl shadow-lg border-b-4 border-purple-700 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
              >
                🎓 View Your Certification
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // TRAINING MODE - LESSON
  // ============================================
  if (view === 'lesson' && activeLevel) {
    return (
      <LessonEngine
        level={activeLevel}
        onComplete={(correct, total) => completeLevel(activeLevel.id, correct, total)}
        onExit={() => setView('home')}
      />
    );
  }

  // ============================================
  // RESULTS VIEW (Both Modes)
  // ============================================
  if (view === 'results') {
  return (
      <div className={`min-h-screen ${tierData.bgColor} text-white font-sans flex flex-col`}>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-sm w-full">
            
            <div className={`bg-gray-900 rounded-3xl p-6 border-2 ${tierData.borderColor} shadow-2xl relative overflow-hidden`}>
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-black text-xs">AD</div>
                  <span className="font-bold text-gray-400 text-sm">
                    {mode === 'test' ? 'Certification Exam' : 'Training Complete'}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${tierData.textColor} bg-black/30`}>
                  {mode === 'test' ? 'CERTIFIED' : 'TRAINED'}
                </div>
              </div>

              <div className="text-center mb-6">
                <div className={`text-7xl font-black bg-gradient-to-r ${tierData.color} bg-clip-text text-transparent`}>
                  {score}
                </div>
                <div className="text-gray-500 font-bold text-sm uppercase tracking-widest">/ 100 ROAS Score</div>
              </div>

              <div className={`bg-gradient-to-r ${tierData.color} rounded-2xl p-4 text-center mb-6`}>
                <div className="text-4xl mb-1">{tierData.emoji}</div>
                <div className="font-black text-xl uppercase tracking-wider">{tierData.tier}</div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-black mb-2">{tierData.headline}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{tierData.body}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-black/30 rounded-xl p-3">
                <div>
                  <div className="text-green-400 font-black text-lg">{totalCorrect}</div>
                  <div className="text-gray-500 text-xs uppercase">Correct</div>
                </div>
                <div>
                  <div className="text-red-400 font-black text-lg">{TOTAL_QUESTIONS - totalCorrect}</div>
                  <div className="text-gray-500 text-xs uppercase">Wrong</div>
                </div>
      <div>
                  <div className="text-blue-400 font-black text-lg">{TOTAL_QUESTIONS}</div>
                  <div className="text-gray-500 text-xs uppercase">Total</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-gray-600 text-xs font-bold">adlingo.onrender.com</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button 
                onClick={copyResult}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center transition-all ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <><CheckCircle size={20} className="mr-2" /> Copied!</>
                ) : (
                  <><Copy size={20} className="mr-2" /> Copy Result</>
                )}
              </button>
              
              <button 
                onClick={resetQuiz}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-wider bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all flex items-center justify-center border border-gray-700"
              >
                <RotateCcw size={20} className="mr-2" /> {mode === 'test' ? 'Retake Exam' : 'Reset Training'}
              </button>

              {mode === 'test' && (
                <a 
                  href="/"
                  className="block text-center text-gray-500 hover:text-orange-400 text-sm transition mt-4"
                >
                  → Try Training Mode (with corrections)
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- LESSON ENGINE COMPONENT (Training Mode Only) ---
const LessonEngine = ({ level, onComplete, onExit }) => {
  const [qIndex, setQIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  const q = level.questions[qIndex];
  const progress = ((qIndex) / level.questions.length) * 100;

  const handleCheck = () => {
    if (selectedOpt === null) return;
    const isCorrect = q.options[selectedOpt].correct;
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (qIndex + 1 < level.questions.length) {
      setQIndex(i => i + 1);
      setStatus('idle');
      setSelectedOpt(null);
    } else {
      onComplete(correctCount + (status === 'correct' ? 0 : 0), level.questions.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-800">
        <button onClick={onExit} className="p-2 hover:bg-gray-800 rounded-full transition">
          <XCircle className="text-gray-400 hover:text-white" size={24} />
        </button>
        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-gray-400 font-bold text-sm">{qIndex + 1}/{level.questions.length}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-48">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700">
              {level.title}
            </span>
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 relative">
              <img 
                src={robotThinking} 
                className={`w-full h-full object-contain transition-all duration-300 ${status !== 'idle' ? 'opacity-0 scale-90 absolute' : 'opacity-100 scale-100'}`}
              />
              <img 
                src={robotStatic} 
                className={`w-full h-full object-contain transition-all duration-300 ${status === 'correct' ? 'opacity-100 scale-110' : 'opacity-0 scale-90 absolute'}`}
              />
              <img 
                src={robotDisappointed} 
                className={`w-full h-full object-contain transition-all duration-300 ${status === 'wrong' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 absolute'}`}
              />
            </div>
          </div>

          <h2 className="text-xl font-black text-center mb-8 leading-tight">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={status !== 'idle'}
                onClick={() => setSelectedOpt(idx)}
                className={`
                  w-full p-4 rounded-xl border-2 text-left font-medium transition-all
                  ${selectedOpt === idx 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300' 
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'}
                  ${status === 'correct' && opt.correct ? '!border-green-500 !bg-green-500/20 !text-green-400' : ''}
                  ${status === 'wrong' && selectedOpt === idx ? '!border-red-500 !bg-red-500/20 !text-red-400' : ''}
                  ${status === 'wrong' && opt.correct ? '!border-green-500/50 !bg-green-500/10 !text-green-400/70' : ''}
                `}
              >
                <div className="flex items-start">
                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-3 text-sm font-black shrink-0
                    ${selectedOpt === idx ? 'border-blue-500 text-blue-500' : 'border-gray-600 text-gray-600'}
                    ${status === 'correct' && opt.correct ? '!border-green-500 !text-green-500' : ''}
                    ${status === 'wrong' && selectedOpt === idx ? '!border-red-500 !text-red-500' : ''}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="pt-1">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`fixed bottom-0 w-full border-t transition-colors duration-300 ${
        status === 'correct' ? 'bg-green-900/95 border-green-700' : 
        status === 'wrong' ? 'bg-red-900/95 border-red-700' : 'bg-gray-900/98 border-gray-800'
      } backdrop-blur-lg`}>
        <div className="max-w-2xl mx-auto p-4">
          {status === 'wrong' && q.directorNote && (
            <div className="mb-4">
              <div className="font-bold text-red-300 flex items-center mb-2 text-sm">
                <AlertCircle size={16} className="mr-2"/> Director's Note:
              </div>
              <p className="text-sm text-red-200 bg-red-950/50 p-3 rounded-xl border border-red-800/50">
                {q.directorNote}
              </p>
            </div>
          )}
          {status === 'correct' && (
            <div className="mb-4 text-green-300 font-bold flex items-center">
              <CheckCircle className="mr-2" size={20} /> Correct!
            </div>
          )}
          <button 
            onClick={status === 'idle' ? handleCheck : handleNext}
            disabled={selectedOpt === null && status === 'idle'}
            className={`
              w-full py-4 rounded-xl font-black text-base uppercase tracking-wider transition-all
              ${status === 'idle' 
                ? 'bg-green-500 hover:bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                : 'bg-white text-gray-900'
              }
            `}
          >
            {status === 'idle' ? 'Check Answer' : qIndex + 1 < level.questions.length ? 'Next Question' : 'Complete Level'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
