/*
  Warnings:

  - The primary key for the `community_challenges_participants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `community_challenges_participants` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `community_challenges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "community_challenges" ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "community_challenges_participants" DROP CONSTRAINT "community_challenges_participants_pkey",
DROP COLUMN "id",
ADD COLUMN     "metadata" JSONB,
ADD CONSTRAINT "community_challenges_participants_pkey" PRIMARY KEY ("userId", "communityChallengeId");
