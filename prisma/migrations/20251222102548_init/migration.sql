-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "filamentCostPerGram" REAL NOT NULL DEFAULT 0.09,
    "elecCostPerHour" REAL NOT NULL DEFAULT 0.2,
    "employeeHourlyRate" REAL NOT NULL DEFAULT 6.0,
    "amortizationRate" REAL NOT NULL DEFAULT 0.05,
    "vatRate" REAL NOT NULL DEFAULT 0.19,
    "marginRate" REAL NOT NULL DEFAULT 0.60
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "filamentWeight" REAL NOT NULL,
    "printHours" REAL NOT NULL,
    "employeeHours" REAL NOT NULL,
    "sponsoringCost" REAL NOT NULL DEFAULT 0,
    "packagingCost" REAL NOT NULL DEFAULT 0,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "otherCosts" REAL NOT NULL DEFAULT 0,
    "supportCost" REAL NOT NULL DEFAULT 0,
    "retouchCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL,
    "finalPrice" REAL NOT NULL,
    "sellingPrice" REAL NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ProductionQueue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    CONSTRAINT "ProductionQueue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionQueue_productId_key" ON "ProductionQueue"("productId");
