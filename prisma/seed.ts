import { PrismaClient, TemplateCategory, TrendLabel } from "@prisma/client"

const db = new PrismaClient()

// placehold.co generates clean placeholder images with custom text
function placeholder(w: number, h: number, text: string) {
  const encoded = encodeURIComponent(text)
  return `https://placehold.co/${w}x${h}/1a1a1a/ffffff?text=${encoded}&font=impact`
}

function twoCaption(w: number, h: number) {
  return [
    { id: "top",    x: 0, y: 10,      w, h: Math.round(h * 0.2), defaultText: "TOP TEXT",    fontSize: 40, align: "center" },
    { id: "bottom", x: 0, y: Math.round(h * 0.75), w, h: Math.round(h * 0.2), defaultText: "BOTTOM TEXT", fontSize: 40, align: "center" },
  ]
}

function oneCaption(w: number, h: number) {
  return [
    { id: "caption", x: 20, y: Math.round(h * 0.6), w: w - 40, h: Math.round(h * 0.35), defaultText: "Caption here", fontSize: 32, align: "center" },
  ]
}

const templates = [
  {
    slug: "distracted-boyfriend",
    name: "Distracted Boyfriend",
    width: 800, height: 530,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 95,
    tags: ["classic", "reaction", "boyfriend", "cheating"],
    textRegions: [
      { id: "left",   x: 460, y: 20,  w: 320, h: 80, defaultText: "New thing",      fontSize: 28, align: "center" },
      { id: "right",  x: 20,  y: 20,  w: 180, h: 80, defaultText: "Girlfriend",      fontSize: 22, align: "center" },
      { id: "center", x: 200, y: 20,  w: 240, h: 80, defaultText: "Him",            fontSize: 26, align: "center" },
    ],
  },
  {
    slug: "drake-approve",
    name: "Drake Hotline Bling",
    width: 800, height: 800,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.HOT,
    trendScore: 98,
    tags: ["drake", "approve", "disapprove", "reaction", "classic"],
    textRegions: [
      { id: "no",  x: 420, y: 50,  w: 360, h: 300, defaultText: "Thing I don't like", fontSize: 32, align: "center" },
      { id: "yes", x: 420, y: 450, w: 360, h: 300, defaultText: "Thing I do like",    fontSize: 32, align: "center" },
    ],
  },
  {
    slug: "this-is-fine",
    name: "This Is Fine",
    width: 800, height: 600,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.RISING,
    trendScore: 91,
    tags: ["dog", "fire", "denial", "this is fine", "chaos"],
    textRegions: oneCaption(800, 600),
  },
  {
    slug: "galaxy-brain",
    name: "Galaxy Brain",
    width: 800, height: 960,
    category: TemplateCategory.ABSURDIST,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 84,
    tags: ["brain", "expanding", "big brain", "gigachad"],
    textRegions: [
      { id: "step1", x: 420, y: 30,  w: 360, h: 180, defaultText: "Normal thought",    fontSize: 28, align: "center" },
      { id: "step2", x: 420, y: 270, w: 360, h: 180, defaultText: "Slightly bigger",   fontSize: 28, align: "center" },
      { id: "step3", x: 420, y: 510, w: 360, h: 180, defaultText: "Galaxy brain take", fontSize: 28, align: "center" },
      { id: "step4", x: 420, y: 750, w: 360, h: 180, defaultText: "UNIVERSE BRAINED",  fontSize: 28, align: "center" },
    ],
  },
  {
    slug: "two-buttons",
    name: "Two Buttons",
    width: 800, height: 960,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 88,
    tags: ["sweating", "buttons", "choice", "dilemma"],
    textRegions: [
      { id: "btn1", x: 100, y: 200, w: 250, h: 100, defaultText: "Option A", fontSize: 26, align: "center" },
      { id: "btn2", x: 450, y: 200, w: 250, h: 100, defaultText: "Option B", fontSize: 26, align: "center" },
    ],
  },
  {
    slug: "woman-yelling-cat",
    name: "Woman Yelling at Cat",
    width: 800, height: 400,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.HOT,
    trendScore: 96,
    tags: ["cat", "woman", "argument", "smudge", "classic"],
    textRegions: [
      { id: "woman", x: 10,  y: 10, w: 380, h: 380, defaultText: "Angry person", fontSize: 28, align: "center" },
      { id: "cat",   x: 410, y: 10, w: 380, h: 380, defaultText: "Cat",          fontSize: 28, align: "center" },
    ],
  },
  {
    slug: "change-my-mind",
    name: "Change My Mind",
    width: 800, height: 530,
    category: TemplateCategory.CORPORATE,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 82,
    tags: ["crowder", "change my mind", "table", "debate"],
    textRegions: [
      { id: "text", x: 200, y: 280, w: 400, h: 120, defaultText: "Controversial opinion. Change my mind.", fontSize: 24, align: "center" },
    ],
  },
  {
    slug: "panik-kalm",
    name: "Panik Kalm Panik",
    width: 800, height: 900,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.RISING,
    trendScore: 89,
    tags: ["panik", "kalm", "panic", "calm", "monkey"],
    textRegions: [
      { id: "panik1", x: 420, y: 40,  w: 360, h: 200, defaultText: "Bad thing happens",    fontSize: 28, align: "center" },
      { id: "kalm",   x: 420, y: 340, w: 360, h: 200, defaultText: "It's actually fine",   fontSize: 28, align: "center" },
      { id: "panik2", x: 420, y: 640, w: 360, h: 200, defaultText: "Wait it's worse",      fontSize: 28, align: "center" },
    ],
  },
  {
    slug: "iger-thinking",
    name: "Think Mark Think",
    width: 800, height: 530,
    category: TemplateCategory.ABSURDIST,
    trendLabel: TrendLabel.RISING,
    trendScore: 77,
    tags: ["invincible", "think", "mark", "animated"],
    textRegions: twoCaption(800, 530),
  },
  {
    slug: "stonks",
    name: "Stonks",
    width: 800, height: 600,
    category: TemplateCategory.CORPORATE,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 86,
    tags: ["stonks", "stocks", "money", "profit", "meme man"],
    textRegions: oneCaption(800, 600),
  },
  {
    slug: "spongebob-mocking",
    name: "Mocking SpongeBob",
    width: 800, height: 450,
    category: TemplateCategory.REACTION,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 93,
    tags: ["spongebob", "mocking", "alternating caps", "reaction"],
    textRegions: twoCaption(800, 450),
  },
  {
    slug: "bollywood-confused",
    name: "Bollywood Confused Math",
    width: 800, height: 600,
    category: TemplateCategory.BOLLYWOOD,
    trendLabel: TrendLabel.RISING,
    trendScore: 80,
    tags: ["bollywood", "confused", "math", "indian"],
    textRegions: oneCaption(800, 600),
  },
  {
    slug: "indian-parents",
    name: "Indian Parents Expectations",
    width: 800, height: 600,
    category: TemplateCategory.INDIAN,
    trendLabel: TrendLabel.HOT,
    trendScore: 87,
    tags: ["indian", "parents", "expectations", "doctor", "engineer"],
    textRegions: twoCaption(800, 600),
  },
  {
    slug: "gaming-rage",
    name: "Gamer Rage",
    width: 800, height: 600,
    category: TemplateCategory.GAMING,
    trendLabel: TrendLabel.RISING,
    trendScore: 75,
    tags: ["gaming", "rage", "controller", "keyboard"],
    textRegions: twoCaption(800, 600),
  },
  {
    slug: "anime-surprised",
    name: "Anime Shock Face",
    width: 800, height: 600,
    category: TemplateCategory.ANIME,
    trendLabel: TrendLabel.RISING,
    trendScore: 72,
    tags: ["anime", "surprised", "shocked", "wide eyes"],
    textRegions: oneCaption(800, 600),
  },
  {
    slug: "sports-victory",
    name: "Sports Victory Lap",
    width: 800, height: 600,
    category: TemplateCategory.SPORTS,
    trendLabel: TrendLabel.CLASSIC,
    trendScore: 68,
    tags: ["sports", "victory", "celebration", "touchdown"],
    textRegions: twoCaption(800, 600),
  },
]

async function main() {
  console.log("🌱 Seeding templates...")

  for (const t of templates) {
    await db.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        ...t,
        imageUrl: placeholder(t.width, t.height, t.name),
        textRegions: t.textRegions,
      },
    })
    process.stdout.write(".")
  }

  console.log(`\n✅ Seeded ${templates.length} templates.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
