/**
 * English resource bundle — the single source of all user-facing copy
 * (BUILD-SPEC §11). No display strings should be hardcoded in components.
 *
 * Copy is taken VERBATIM from BUILD-SPEC §7. Option-list values double as the
 * canonical strings persisted to the DB and sent to Claude (English-only this
 * scope). Spanish / Mandarin are out of scope — adding them must be a
 * content-only task (drop in a sibling resource file), no component refactor.
 */

export const en = {
  app: {
    title: "DJDS Community Vision",
    description:
      "Imagine the future of your community. Share what matters and we'll turn your vision into a unique image.",
  },

  nav: {
    wordmark: "DJDS community vision",
    languageLabel: "Language",
  },

  // ---- 7.0 Welcome ----
  welcome: {
    overline: "Welcome",
    h1Before: "Your imagination is ",
    h1Accent: "infrastructure",
    h1After: ".",
    body: "This tool is an invitation to dream. You'll share what matters to you — the values, feelings, and features you want to see in your community — and we'll turn your vision into a unique image that's yours to keep and share.",
    callout: {
      overline: "How this shapes our work together",
      before:
        "Your long-term vision matters beyond this moment. We use 150-year thinking as a compass — from it, we work backwards to set ",
      bold: "5-year goals",
      after:
        " that are grounded in where your community truly wants to go. What you imagine today becomes the trajectory for what we build together.",
    },
    pills: [
      { icon: "❤", step: "Step 1", label: "Share what matters to you" },
      { icon: "🖌", step: "Step 2", label: "We generate your vision" },
      { icon: "👥", step: "Step 3", label: "Your vision joins the community" },
    ],
    checkIn: {
      overline: "Before we begin",
      breath: "Take a breath. Close your eyes for a moment if you'd like.",
      prompt: "Imagine it is 150 years from now.",
      finishLabel: "Finish this sentence:",
      sentenceAccent: "My people are …",
      placeholder: "…free, rooted, and building something that lasts.",
      hint: "There is no right answer. Write what comes naturally.",
    },
    cta: "Begin my vision →",
    ctaSub: "Takes about 5 minutes · No account needed",
  },

  // ---- shared progress ----
  progress: {
    labels: {
      scale: "Scale",
      values: "Values",
      feelings: "Feelings",
      features: "Features",
      vision: "Your vision",
    },
    stepOf: "Step {{label}} of 5",
  },

  nav2: {
    back: "← Back",
    next: "Next →",
  },

  // ---- 7.1 Scale ----
  scale: {
    h2: "What are you dreaming about?",
    sub: "Choose the scale of the space you want to reimagine. You can only pick one.",
    sizeLabels: { smallest: "Smallest", largest: "Largest" },
    noun: {
      room: "room",
      building: "building",
      block: "block",
      city: "city",
      planet: "planet",
    },
    options: {
      room: {
        name: "A room",
        description:
          "A single space — a classroom, a living room, a community hall",
      },
      building: {
        name: "A building",
        description:
          "A home, school, community center, or other single structure",
      },
      block: {
        name: "A block",
        description: "A street, corner, or neighborhood block in your community",
      },
      city: {
        name: "A city",
        description: "A whole district, town, or the city you live in",
      },
      planet: {
        name: "The planet",
        description:
          "A vision for the whole Earth — ecosystems, climate, and all living things",
      },
    },
  },

  // ---- 7.2 Step 2a — Sensory & Embodied Experience ----
  sensory: {
    h2: "How do you want your body and senses to feel in this space?",
    sub: "Select everything that feels true. There's no limit.",
    tags: [
      "Calm",
      "Grounded",
      "Peaceful",
      "Regulated",
      "Bright & light-filled",
      "Colorful",
      "Quiet",
      "Soft sounds",
      "Fresh air",
      "Warm",
      "Soft textures",
      "Comfortable to touch",
      "Nourishing",
      "Engaging sights to rest on",
      "Balanced",
      "Connected to my body",
      "Clear & oriented",
      "Living elements (plants, water, life)",
    ],
  },

  // ---- 7.3 Step 2b — Community & Belonging ----
  belonging: {
    h2: "Who and what belongs in this space? What communities should thrive here?",
    sub: "Select everything that matters. There's no limit.",
    selected: "{{count}} selected",
    tags: [
      "Accessible to all bodies",
      "Wheelchair accessible",
      "Sensory-accessible",
      "Neurodivergent-affirming",
      "Culturally diverse",
      "Culturally reflective of my community",
      "Multilingual-welcoming",
      "Indigenous-centered",
      "Black-centered & Black-led",
      "African diaspora-centered",
      "Latinx / Latino / Hispanic-centered",
      "Asian & Asian-American-centered",
      "Southeast Asian-centered",
      "South Asian-centered",
      "Middle Eastern & North African-centered",
      "Pacific Islander-centered",
      "Immigrant-welcoming",
      "Refugee-welcoming",
      "Undocumented-welcoming",
      "LGBTQ+ affirming",
      "Queer-centered & Queer-led",
      "Trans-affirming & Trans-centered",
      "Non-binary-affirming",
      "Two-Spirit-affirming",
      "Intergenerational (all ages)",
      "Youth-led & Youth-centered",
      "Elder-centered & Elder-respected",
      "Women & femme-centered",
      "Black women-centered",
      "Mothers & caregivers-welcomed",
      "Single parents-supported",
      "Unhoused & housing-insecure-friendly",
      "Harm reduction-centered",
      "Mental health-affirming",
      "Survivor-centered (trauma survivors)",
      "Healing-centered",
      "Working families-supported",
      "Low-income-centered",
      "Economic justice-centered",
      "Pet-friendly",
      "Childcare-integrated",
      "Food-justice-centered",
      "Sex worker-affirming",
      "Incarcerated & formerly incarcerated-welcoming",
      "Disability justice-centered",
      "Religious & spiritual-welcoming",
    ],
  },

  // ---- 7.4 Step 2c — Sensory Imagination ----
  imagination: {
    h2: "Imagine you're there. What do you sense?",
    sub: "Close your eyes if you'd like. What do you see? What do you smell? What do you hear? What do you taste? Paint a sensory picture.",
    placeholder:
      "I see warm light coming through big windows, the smell of fresh plants and earth, the sound of people talking gently, the taste of fresh food shared together…",
  },

  // ---- 7.5 Step 3 — Feelings ----
  feelings: {
    h2: "How should this space feel?",
    sub: "Choose up to 5 words that capture the emotional and spiritual quality you're imagining.",
    tags: [
      "Hopeful",
      "Connected",
      "Peaceful",
      "Energetic",
      "Safe",
      "Proud",
      "Joyful",
      "Rooted",
      "Free",
      "Inspired",
      "Heard",
      "Belonging",
      "Vibrant",
      "Calm",
      "Bold",
      "Settled",
      "Empowered",
      "Grounded",
      "Seen",
      "Loved",
      "Held",
      "Brave",
      "Creative",
      "Alive",
      "Balanced",
      "Whole",
      "Abundant",
      "Resilient",
      "Gentle",
      "Trusted",
    ],
  },

  // ---- 7.6 Step 4 — Features (scale-specific) ----
  features: {
    h2: "What specific features belong here?",
    sub: "Select up to 8 concrete elements or improvements you want to see on your {{scale}}.",
    tags: {
      room: [
        "Natural light",
        "Plants & greenery",
        "Comfortable seating",
        "Artwork / mural",
        "Soft textures",
        "Color",
        "Sound control",
        "Window or view",
        "Temperature control",
        "Storage / organization",
      ],
      building: [
        "Community gathering space",
        "Green / garden space",
        "Natural light & windows",
        "Accessible entrances & ramps",
        "Art & murals",
        "Rooftop garden / outdoor space",
        "Childcare space",
        "Café / nourishment space",
        "Library / quiet reading area",
        "Flexible spaces",
      ],
      block: [
        "Street trees & greenery",
        "Community garden",
        "Benches & seating",
        "Mural / public art",
        "Bike lanes",
        "Better lighting",
        "Safe crosswalk improvements",
        "Food vendors & market",
        "Outdoor play space",
        "Stormwater garden & green infrastructure",
      ],
      city: [
        "Parks & green space",
        "Community gardens",
        "Public plazas",
        "Bus rapid transit / public transit",
        "Bike network",
        "Affordable housing",
        "Local markets",
        "Schools & libraries",
        "Health clinics",
        "Clean water & air infrastructure",
      ],
      planet: [
        "Clean water",
        "Clean air & reduced emissions",
        "Thriving forests & ecosystems",
        "Wildlife protection",
        "Renewable energy",
        "Climate stability / climate action",
        "Food security & regenerative agriculture",
        "Ocean health",
        "Indigenous sovereignty & land return",
        "Reduced consumption & waste",
      ],
    },
  },

  // ---- 7.7 Step 5 — Final Vision ----
  finalVision: {
    h2: "Paint the picture.",
    sub: "Tell us the story of your vision.",
    promptBold: "How do you want to feel when you arrive?",
    promptRest: " What's the first thing you notice?",
    placeholder:
      "I walk in and feel a sense of peace and belonging. The first thing I notice is warm light, green plants everywhere, and the smell of fresh earth. I hear gentle conversations and laughter.",
    nudge:
      "A few words here makes your image richer — but you can generate without it.",
    nameLabel: "Your name",
    optional: "optional",
    namePlaceholder: "What should we call you? (or leave blank to stay anonymous)",
    generate: "Generate my vision ✨",
  },

  // ---- shared field helpers ----
  field: {
    charsRemaining: "{{count}} characters left",
  },

  // ---- 8.5 generation states ----
  loading: {
    message: "Building your vision…",
  },
  errors: {
    generate: "We couldn't create your vision just now — our image studio may be busy. Please try again in a moment.",
    retry: "Try again",
    notFound: "We couldn't find that vision.",
    generic: "Something went wrong. Please try again.",
  },

  // ---- Vision page ----
  vision: {
    title: "Your vision",
    aiNote: "This image was generated by AI from your own words.",
    copyLink: "Copy share link",
    copied: "Link copied",
    downloadPng: "Download image",
    edit: "Edit my vision",
    startOver: "Create another vision",
    savedToSession: "Saved to this session.",
    scaleLabel: "Scale",
    byline: "by {{name}}",
    anonymous: "Anonymous",
  },

  // ---- Facilitator ----
  facilitator: {
    new: {
      title: "Create a session",
      sub: "Set up a visioning session for your community. You'll get a link to share and a PIN to view contributions.",
      fieldTitle: "Session title",
      fieldTitlePlaceholder: "e.g. West Oakland block visioning",
      fieldDescription: "Description",
      fieldDescriptionPlaceholder: "Optional — a sentence about this session",
      fieldScaleMode: "What can participants imagine?",
      scaleModeOpen: "Let participants choose the scale",
      scaleModeFixed: "Fix the scale to:",
      fieldVisibility: "Default visibility",
      visibilityPrivate: "Private — only you see contributions",
      visibilityPublic: "Public — participants see everyone's visions",
      submit: "Create session",
      creating: "Creating…",
    },
    created: {
      title: "Your session is ready",
      pinLabel: "Facilitator PIN",
      pinWarning:
        "Save this PIN now. It is shown only once and is not emailed. You'll need it to open the dashboard.",
      copyPin: "Copy PIN",
      copied: "Copied",
      shareLabel: "Share this link with your community",
      copyLink: "Copy link",
      openDashboard: "Open dashboard →",
    },
    gate: {
      title: "Facilitator dashboard",
      sub: "Enter the PIN for this session.",
      pinPlaceholder: "PIN",
      submit: "Open dashboard",
      checking: "Checking…",
      wrong: "That PIN didn't match. Try again.",
      locked: "Too many attempts. Please wait a moment and try again.",
    },
    dashboard: {
      contributions: "Contributions",
      byScale: "By scale",
      topSensory: "Most common sensory & embodied",
      topBelonging: "Most common community & belonging",
      topFeelings: "Most common feelings",
      topFeatures: "Most common features",
      allVisions: "Every vision",
      empty: "No contributions yet. Share the session link to begin.",
      visibility: "Visibility",
      status: "Status",
      makePublic: "Make public",
      makePrivate: "Make private",
      closeSession: "Close session",
      reopenSession: "Reopen session",
      statusOpen: "Open",
      statusClosed: "Closed",
      visibilityPublic: "Public",
      visibilityPrivate: "Private",
      shareLink: "Share link",
      copyLink: "Copy link",
      copied: "Copied",
    },
  },

  // ---- Session join / mosaic ----
  session: {
    closedTitle: "This session is closed",
    closedBody: "Thank you — this visioning session is no longer accepting new visions.",
    privateTitle: "Visions are being collected privately",
    privateBody:
      "Your vision has been shared with the facilitator. Thank you for dreaming with us.",
    begin: "Begin my vision →",
  },
  mosaic: {
    title: "Our collective vision",
    sub: "Every vision shared in this session.",
    empty: "No visions yet — be the first to add yours.",
    addYours: "Add your vision →",
    anonymous: "Anonymous",
  },
} as const;

export type Resources = typeof en;
