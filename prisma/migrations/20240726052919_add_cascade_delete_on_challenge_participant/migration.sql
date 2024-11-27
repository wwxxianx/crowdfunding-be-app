-- DropForeignKey
ALTER TABLE "community_challenges_participants" DROP CONSTRAINT "community_challenges_participants_communityChallengeId_fkey";

-- DropForeignKey
ALTER TABLE "community_challenges_participants" DROP CONSTRAINT "community_challenges_participants_userId_fkey";

-- AddForeignKey
ALTER TABLE "community_challenges_participants" ADD CONSTRAINT "community_challenges_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_challenges_participants" ADD CONSTRAINT "community_challenges_participants_communityChallengeId_fkey" FOREIGN KEY ("communityChallengeId") REFERENCES "community_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
