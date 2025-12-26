"use server";

import { supabase } from "./lib/supabaseClient";
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
  let { data: settings, error: settingsError } = await supabase
    .from('GlobalSettings')
    .select('*')
    .limit(1)
    .single();

  if (!settings) {
    const { data: newSettings } = await supabase
      .from('GlobalSettings')
      .insert(DEFAULT_SETTINGS)
      .select()
      .single();
    settings = newSettings;
  }

  let { data: presets } = await supabase
    .from('CostPreset')
    .select('*');

  if (!presets || presets.length === 0) {
    const { data: newPresets } = await supabase
      .from('CostPreset')
      .insert(DEFAULT_COST_PRESETS)
      .select();
    presets = newPresets;
  }

  return { settings: settings || DEFAULT_SETTINGS, presets: presets || [] };
}

export async function updateSettings(formData: FormData): Promise<void> {
  const data = {
    filamentCostPerGram: parseFloat(formData.get("filamentCostPerGram") as string),
    elecCostPerHour: parseFloat(formData.get("elecCostPerHour") as string),
    employeeHourlyRate: parseFloat(formData.get("employeeHourlyRate") as string),
    amortizationRate: parseFloat(formData.get("amortizationRate") as string),
    vatRate: parseFloat(formData.get("vatRate") as string),
    marginRate: parseFloat(formData.get("marginRate") as string),
  };

  const { data: currentSettings } = await supabase.from('GlobalSettings').select('id').limit(1).single();

  if (currentSettings) {
    await supabase.from('GlobalSettings').update(data).eq('id', currentSettings.id);
  } else {
    await supabase.from('GlobalSettings').insert(data);
  }

  revalidatePath("/");
  revalidatePath("/settings");
}

export async function addCostPreset(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const defaultAmount = parseFloat(formData.get("defaultAmount") as string);
  await supabase.from('CostPreset').insert({ name, defaultAmount });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function deleteCostPreset(id: number): Promise<void> {
  await supabase.from('CostPreset').delete().eq('id', id);
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

export async function saveDraft(formData: FormData): Promise<void> {
  const { inputs, additionalCosts, baseCost, finalProductCost, totalPriceTND } = await calculateProductData(formData);

  await supabase.from('Product').insert({
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
    isValidated: false,
  });

  revalidatePath("/");
}

export async function validateAndScheduleProduct(formData: FormData): Promise<void> {
  const { inputs, additionalCosts, baseCost, finalProductCost, totalPriceTND } = await calculateProductData(formData);

  const { data: lastJobs } = await supabase
    .from('ProductionQueue')
    .select('endTime')
    .order('endTime', { ascending: false })
    .limit(1);

  const lastJob = lastJobs?.[0];
  const now = new Date();
  let startTime = now;
  
  if (lastJob && new Date(lastJob.endTime) > now) {
    startTime = new Date(new Date(lastJob.endTime).getTime() + 15 * 60000);
  }
  
  const printDurationMs = inputs.printHours * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + printDurationMs);

  const { data: product, error: pError } = await supabase.from('Product').insert({
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
    isValidated: true,
  }).select().single();

  if (product) {
    await supabase.from('ProductionQueue').insert({
      productId: product.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
  }

  revalidatePath("/");
}

export async function publishProduct(productId: number, printHours: number): Promise<void> {
  const { data: lastJobs } = await supabase
    .from('ProductionQueue')
    .select('endTime')
    .order('endTime', { ascending: false })
    .limit(1);

  const lastJob = lastJobs?.[0];
  const now = new Date();
  let startTime = now;
  
  if (lastJob && new Date(lastJob.endTime) > now) {
    startTime = new Date(new Date(lastJob.endTime).getTime() + 15 * 60000);
  }
  
  const printDurationMs = printHours * 60 * 60 * 1000;
  const endTime = new Date(startTime.getTime() + printDurationMs);

  await supabase.from('Product').update({ isValidated: true }).eq('id', productId);
  await supabase.from('ProductionQueue').insert({
    productId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  });

  revalidatePath("/");
}

export async function unpublishProduct(productId: number): Promise<void> {
  await supabase.from('ProductionQueue').delete().eq('productId', productId);
  await supabase.from('Product').update({ isValidated: false }).eq('id', productId);

  revalidatePath("/");
}

export async function deleteProduct(productId: number): Promise<void> {
  await supabase.from('ProductionQueue').delete().eq('productId', productId);
  await supabase.from('Product').delete().eq('id', productId);

  revalidatePath("/");
}
