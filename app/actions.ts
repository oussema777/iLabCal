"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- SETTINGS & PRESETS ---

const DEFAULT_SETTINGS = {
  filamentCostPerGram: 0.09,
  elecCostPerHour: 0.2,
  employeeHourlyRate: 6.0,
  amortizationRate: 0.05,
  vatRate: 0.19,
  marginRate: 0.60
};

const DEFAULT_COST_PRESETS = [
  { name: "Sponsoring", defaultAmount: 3 },
  { name: "Packaging", defaultAmount: 3 },
  { name: "Other Costs", defaultAmount: 16 },
  { name: "Support", defaultAmount: 0 },
  { name: "Shipping", defaultAmount: 8 },
  { name: "Pomp Retouche", defaultAmount: 8 },
];

export async function getSettingsAndPresets() {
  let settings = await prisma.globalSettings.findFirst();
  if (!settings) {
    settings = await prisma.globalSettings.create({ data: DEFAULT_SETTINGS });
  }

  let presets = await prisma.costPreset.findMany();
  if (presets.length === 0) {
    await prisma.costPreset.createMany({ data: DEFAULT_COST_PRESETS });
    presets = await prisma.costPreset.findMany();
  }

  return { settings, presets };
}

export async function updateSettings(formData: FormData) {
  const data = {
    filamentCostPerGram: parseFloat(formData.get("filamentCostPerGram") as string),
    elecCostPerHour: parseFloat(formData.get("elecCostPerHour") as string),
    employeeHourlyRate: parseFloat(formData.get("employeeHourlyRate") as string),
    amortizationRate: parseFloat(formData.get("amortizationRate") as string),
    vatRate: parseFloat(formData.get("vatRate") as string),
    marginRate: parseFloat(formData.get("marginRate") as string),
  };

  const settings = await prisma.globalSettings.findFirst();
  if (settings) {
    await prisma.globalSettings.update({ where: { id: settings.id }, data });
  } else {
    await prisma.globalSettings.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/settings");
}

export async function addCostPreset(formData: FormData) {
  const name = formData.get("name") as string;
  const defaultAmount = parseFloat(formData.get("defaultAmount") as string);
  await prisma.costPreset.create({ data: { name, defaultAmount } });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteCostPreset(id: number) {
  await prisma.costPreset.delete({ where: { id } });
  revalidatePath("/settings");
  revalidatePath("/");
}

// --- CORE LOGIC: CALCULATION HELPER ---

async function calculateProductData(formData: FormData) {
  const { settings } = await getSettingsAndPresets();

  const inputs = {
    filamentWeight: parseFloat(formData.get("filamentWeight") as string),
    printHours: parseFloat(formData.get("printHours") as string),
    employeeHours: parseFloat(formData.get("employeeHours") as string),
    name: formData.get("name") as string || "Untitled Project",
    customerName: formData.get("customerName") as string || "",
    customerPhone: formData.get("customerPhone") as string || "",
    customerAddress: formData.get("customerAddress") as string || "",
    customerNotes: formData.get("customerNotes") as string || "",
  };

  const additionalCostsJson = formData.get("additionalCosts") as string;
  const additionalCosts: { name: string, amount: number }[] = additionalCostsJson ? JSON.parse(additionalCostsJson) : [];

  const totalFilamentCost = inputs.filamentWeight * settings.filamentCostPerGram;
  const totalElecCost = inputs.printHours * settings.elecCostPerHour;
  const totalEmployeeCost = inputs.employeeHours * settings.employeeHourlyRate;
  const totalAdditionalCosts = additionalCosts.reduce((sum, item) => sum + item.amount, 0);

  const baseCost = totalFilamentCost + totalElecCost + totalEmployeeCost + totalAdditionalCosts;
  const amortization = baseCost * settings.amortizationRate;
  const finalProductCost = baseCost + amortization;
  const sellingPriceHTVA = finalProductCost * (1 + settings.marginRate);
  const tvaAmount = sellingPriceHTVA * settings.vatRate;
  const totalPriceTND = sellingPriceHTVA + tvaAmount;

  return { inputs, additionalCosts, baseCost, finalProductCost, totalPriceTND };
}

// --- ACTIONS ---

export async function saveDraft(formData: FormData) {
  const { inputs, additionalCosts, baseCost, finalProductCost, totalPriceTND } = await calculateProductData(formData);

  await prisma.product.create({
    data: {
      name: inputs.name,
      customerName: inputs.customerName,
      customerPhone: inputs.customerPhone,
      customerAddress: inputs.customerAddress,
      customerNotes: inputs.customerNotes,
      filamentWeight: inputs.filamentWeight,
      printHours: inputs.printHours,
      employeeHours: inputs.employeeHours,
      additionalCosts: JSON.stringify(additionalCosts),
      
      totalCost: baseCost,
      finalPrice: finalProductCost,
      sellingPrice: totalPriceTND,
      isValidated: false, // DRAFT STATUS
    }
  });

  revalidatePath("/");
}

export async function validateAndScheduleProduct(formData: FormData) {
  const { inputs, additionalCosts, baseCost, finalProductCost, totalPriceTND } = await calculateProductData(formData);

  // Scheduling Logic
  const lastJob = await prisma.productionQueue.findFirst({ orderBy: { endTime: "desc" } });
  const now = new Date();
  let startTime = now;
  if (lastJob && lastJob.endTime > now) {
    startTime = new Date(lastJob.endTime.getTime() + 15 * 60000);
  }
  const printDurationMs = inputs.printHours * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + printDurationMs);

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: inputs.name,
        customerName: inputs.customerName,
        customerPhone: inputs.customerPhone,
        customerAddress: inputs.customerAddress,
        customerNotes: inputs.customerNotes,
        filamentWeight: inputs.filamentWeight,
        printHours: inputs.printHours,
        employeeHours: inputs.employeeHours,
        additionalCosts: JSON.stringify(additionalCosts),
        
        totalCost: baseCost,
        finalPrice: finalProductCost,
        sellingPrice: totalPriceTND,
        isValidated: true, // VALIDATED
      }
    });

    await tx.productionQueue.create({
      data: { productId: product.id, startTime, endTime }
    });
  });

  revalidatePath("/");
}

export async function publishProduct(productId: number, printHours: number) {
  // Scheduling Logic (Same as validate)
  const lastJob = await prisma.productionQueue.findFirst({ orderBy: { endTime: "desc" } });
  const now = new Date();
  let startTime = now;
  if (lastJob && lastJob.endTime > now) {
    startTime = new Date(lastJob.endTime.getTime() + 15 * 60000);
  }
  const printDurationMs = printHours * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + printDurationMs);

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: { isValidated: true }
    });

    await tx.productionQueue.create({
      data: { productId, startTime, endTime }
    });
  });

  revalidatePath("/");
}

export async function unpublishProduct(productId: number) {
  await prisma.$transaction(async (tx) => {
    // Remove from queue
    await tx.productionQueue.delete({
      where: { productId }
    });

    // Mark as draft
    await tx.product.update({
      where: { id: productId },
      data: { isValidated: false }
    });
  });

  revalidatePath("/");
}

export async function deleteProduct(productId: number) {
  const queueItem = await prisma.productionQueue.findUnique({ where: { productId } });
  
  await prisma.$transaction(async (tx) => {
    if (queueItem) {
      await tx.productionQueue.delete({ where: { productId } });
    }
    await tx.product.delete({ where: { id: productId } });
  });

  revalidatePath("/");
}
