-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('IN_PROGRESS', 'UNDER_REVIEW', 'REJECTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "community_challenges_participants" ADD COLUMN     "status" "ChallengeStatus" NOT NULL DEFAULT 'IN_PROGRESS';
