-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "address" TEXT,
ADD COLUMN     "placeDetails" JSONB,
ADD COLUMN     "placeName" TEXT;
