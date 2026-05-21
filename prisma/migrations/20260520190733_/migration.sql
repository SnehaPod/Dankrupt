-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('REACTION', 'CORPORATE', 'ANIME', 'GAMING', 'BOLLYWOOD', 'INDIAN', 'SPORTS', 'ABSURDIST', 'WHOLESOME', 'POLITICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "TrendLabel" AS ENUM ('RISING', 'HOT', 'DEAD', 'CLASSIC');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "trendLabel" "TrendLabel" NOT NULL DEFAULT 'CLASSIC',
    "trendScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "textRegions" JSONB NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meme" (
    "id" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "authorId" TEXT,
    "templateId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "canvasState" JSONB NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "remixCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remix" (
    "id" TEXT NOT NULL,
    "sourceMemeId" TEXT NOT NULL,
    "newMemeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Remix_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE INDEX "Template_trendScore_idx" ON "Template"("trendScore" DESC);

-- CreateIndex
CREATE INDEX "Template_trendLabel_idx" ON "Template"("trendLabel");

-- CreateIndex
CREATE INDEX "Template_usageCount_idx" ON "Template"("usageCount" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Meme_shortId_key" ON "Meme"("shortId");

-- CreateIndex
CREATE INDEX "Meme_authorId_idx" ON "Meme"("authorId");

-- CreateIndex
CREATE INDEX "Meme_shortId_idx" ON "Meme"("shortId");

-- CreateIndex
CREATE INDEX "Meme_createdAt_idx" ON "Meme"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Meme_likeCount_idx" ON "Meme"("likeCount" DESC);

-- CreateIndex
CREATE INDEX "Meme_isPublic_createdAt_idx" ON "Meme"("isPublic", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Remix_newMemeId_key" ON "Remix"("newMemeId");

-- CreateIndex
CREATE INDEX "Remix_sourceMemeId_idx" ON "Remix"("sourceMemeId");

-- CreateIndex
CREATE INDEX "Remix_authorId_idx" ON "Remix"("authorId");

-- AddForeignKey
ALTER TABLE "Meme" ADD CONSTRAINT "Meme_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meme" ADD CONSTRAINT "Meme_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remix" ADD CONSTRAINT "Remix_sourceMemeId_fkey" FOREIGN KEY ("sourceMemeId") REFERENCES "Meme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remix" ADD CONSTRAINT "Remix_newMemeId_fkey" FOREIGN KEY ("newMemeId") REFERENCES "Meme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remix" ADD CONSTRAINT "Remix_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
