-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'Untitled Project',
    "customerName" TEXT,
    "filamentWeight" REAL NOT NULL,
    "printHours" REAL NOT NULL,
    "employeeHours" REAL NOT NULL,
    "additionalCosts" TEXT NOT NULL,
    "totalCost" REAL NOT NULL,
    "finalPrice" REAL NOT NULL,
    "sellingPrice" REAL NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Product" ("additionalCosts", "createdAt", "employeeHours", "filamentWeight", "finalPrice", "id", "isValidated", "name", "printHours", "sellingPrice", "totalCost") SELECT "additionalCosts", "createdAt", "employeeHours", "filamentWeight", "finalPrice", "id", "isValidated", "name", "printHours", "sellingPrice", "totalCost" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
