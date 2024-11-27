-- CreateEnum
CREATE TYPE "CommunityChallengeType" AS ENUM ('DONATION', 'PHOTO');

-- CreateEnum
CREATE TYPE "ChallengeRewardCollectMethod" AS ENUM ('EMAIL');

-- AlterTable
ALTER TABLE "collaborations" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledById" TEXT,
ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "community_challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "requirements" TEXT[],
    "rule" TEXT NOT NULL,
    "termsAndConditions" TEXT NOT NULL,
    "challengeType" "CommunityChallengeType" NOT NULL,
    "rewardCollectMethod" "ChallengeRewardCollectMethod" NOT NULL,
    "sponsorImageUrl" TEXT,
    "sponsorName" TEXT NOT NULL,
    "requiredNumOfDonation" INTEGER,
    "requiredDonationAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_challenges_participants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityChallengeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_challenges_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CampaignCategoryToCommunityChallenge" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignCategoryToCommunityChallenge_AB_unique" ON "_CampaignCategoryToCommunityChallenge"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignCategoryToCommunityChallenge_B_index" ON "_CampaignCategoryToCommunityChallenge"("B");

-- AddForeignKey
ALTER TABLE "collaborations" ADD CONSTRAINT "collaborations_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_challenges_participants" ADD CONSTRAINT "community_challenges_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_challenges_participants" ADD CONSTRAINT "community_challenges_participants_communityChallengeId_fkey" FOREIGN KEY ("communityChallengeId") REFERENCES "community_challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignCategoryToCommunityChallenge" ADD CONSTRAINT "_CampaignCategoryToCommunityChallenge_A_fkey" FOREIGN KEY ("A") REFERENCES "campaign_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignCategoryToCommunityChallenge" ADD CONSTRAINT "_CampaignCategoryToCommunityChallenge_B_fkey" FOREIGN KEY ("B") REFERENCES "community_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
