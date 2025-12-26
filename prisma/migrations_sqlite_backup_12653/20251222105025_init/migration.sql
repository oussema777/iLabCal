/*
  Warnings:

  - You are about to drop the column `otherCosts` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `packagingCost` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `retouchCost` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shippingCost` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sponsoringCost` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `supportCost` on the `Product` table. All the data in the column will be lost.
  - Added the required column `additionalCosts` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CostPreset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "defaultAmount" REAL NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "filamentWeight" REAL NOT NULL,
    "printHours" REAL NOT NULL,
    "employeeHours" REAL NOT NULL,
    "additionalCosts" TEXT NOT NULL,
    "totalCost" REAL NOT NULL,
    "finalPrice" REAL NOT NULL,
    "sellingPrice" REAL NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Product" ("createdAt", "employeeHours", "filamentWeight", "finalPrice", "id", "isValidated", "name", "printHours", "sellingPrice", "totalCost") SELECT "createdAt", "employeeHours", "filamentWeight", "finalPrice", "id", "isValidated", "name", "printHours", "sellingPrice", "totalCost" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
