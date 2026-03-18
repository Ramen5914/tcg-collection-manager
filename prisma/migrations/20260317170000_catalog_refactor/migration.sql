-- CreateTable
CREATE TABLE "CardSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogCard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageKey" TEXT,
    "setId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionEntry" (
    "id" TEXT NOT NULL,
    "catalogCardId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "acquiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardSet_name_key" ON "CardSet"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogCard_setId_name_key" ON "CatalogCard"("setId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionEntry_catalogCardId_key" ON "CollectionEntry"("catalogCardId");

-- AddForeignKey
ALTER TABLE "CatalogCard" ADD CONSTRAINT "CatalogCard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "CardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionEntry" ADD CONSTRAINT "CollectionEntry_catalogCardId_fkey" FOREIGN KEY ("catalogCardId") REFERENCES "CatalogCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing free-text cards into curated catalog + owned quantities.
INSERT INTO "CardSet" ("id", "name", "createdAt", "updatedAt")
SELECT
  md5("setName")::text,
  "setName",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Card"
GROUP BY "setName";

INSERT INTO "CatalogCard" ("id", "name", "imageKey", "setId", "createdAt", "updatedAt")
SELECT
  md5("setName" || '|' || "name")::text,
  "name",
  max("imageKey"),
  md5("setName")::text,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Card"
GROUP BY "setName", "name";

INSERT INTO "CollectionEntry" ("id", "catalogCardId", "quantity", "acquiredAt", "createdAt", "updatedAt")
SELECT
  md5("setName" || '|' || "name" || '|owned')::text,
  md5("setName" || '|' || "name")::text,
  count(*)::integer,
  min("acquiredAt"),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Card"
GROUP BY "setName", "name";

DROP TABLE "Card";