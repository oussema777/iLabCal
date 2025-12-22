"use client";

import { useState, useEffect, useTransition } from "react";
import { validateAndScheduleProduct, saveDraft } from "../actions";
import { Plus, X, User, Box, Phone, MapPin, Notebook, Archive, CheckCircle } from "lucide-react";

type Settings = {
  filamentCostPerGram: number;
  elecCostPerHour: number;
  employeeHourlyRate: number;
  amortizationRate: number;
  vatRate: number;
  marginRate: number;
};

type Preset = {
  id: number;
  name: string;
  defaultAmount: number;
};

type ActiveCost = {
  name: string;
  amount: number;
};

export default function Calculator({ settings, presets }: { settings: Settings, presets: Preset[] }) {
  const [isPending, startTransition] = useTransition();

  const [inputs, setInputs] = useState({
    name: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerNotes: "",
    filamentWeight: 64,
    printHours: 4,
    employeeHours: 1,
  });

  const [activeCosts, setActiveCosts] = useState<ActiveCost[]>([]);

  useEffect(() => {
    setActiveCosts(presets.map(p => ({ name: p.name, amount: p.defaultAmount })));
  }, [presets]);

  const [results, setResults] = useState({
    totalFilamentCost: 0,
    totalElecCost: 0,
    totalEmployeeCost: 0,
    totalAdditionalCost: 0,
    totalCost: 0,
    amortization: 0,
    finalProductCost: 0,
    sellingPriceHTVA: 0,
    tvaAmount: 0,
    totalPriceTND: 0,
  });

  useEffect(() => {
    const totalFilamentCost = inputs.filamentWeight * settings.filamentCostPerGram;
    const totalElecCost = inputs.printHours * settings.elecCostPerHour;
    const totalEmployeeCost = inputs.employeeHours * settings.employeeHourlyRate;
    const totalAdditionalCost = activeCosts.reduce((sum, item) => sum + (item.amount || 0), 0);
    const baseCost = totalFilamentCost + totalElecCost + totalEmployeeCost + totalAdditionalCost;
    const amortization = baseCost * settings.amortizationRate;
    const finalProductCost = baseCost + amortization;
    const sellingPriceHTVA = finalProductCost * (1 + settings.marginRate);
    const tvaAmount = sellingPriceHTVA * settings.vatRate;
    const totalPriceTND = sellingPriceHTVA + tvaAmount;

    setResults({
      totalFilamentCost,
      totalElecCost,
      totalEmployeeCost,
      totalAdditionalCost,
      totalCost: baseCost,
      amortization,
      finalProductCost,
      sellingPriceHTVA,
      tvaAmount,
      totalPriceTND,
    });
  }, [inputs.filamentWeight, inputs.printHours, inputs.employeeHours, activeCosts, settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const textFields = ["name", "customerName", "customerPhone", "customerAddress", "customerNotes"];
    setInputs((prev) => ({
      ...prev,
      [name]: textFields.includes(name) ? value : parseFloat(value) || 0,
    }));
  };

  const handleCostChange = (index: number, val: string) => {
    const newCosts = [...activeCosts];
    newCosts[index].amount = parseFloat(val) || 0;
    setActiveCosts(newCosts);
  };

  const removeCost = (index: number) => {
    setActiveCosts(activeCosts.filter((_, i) => i !== index));
  };

  const addCustomCost = () => {
    setActiveCosts([...activeCosts, { name: "New Fee", amount: 0 }]);
  };
  
  const updateCostName = (index: number, val: string) => {
    const newCosts = [...activeCosts];
    newCosts[index].name = val;
    setActiveCosts(newCosts);
  };

  const prepareFormData = () => {
    const formData = new FormData();
    Object.entries(inputs).forEach(([key, value]) => {
        formData.append(key, value.toString());
    });
    formData.append("additionalCosts", JSON.stringify(activeCosts));
    return formData;
  };

  const handleValidate = async () => {
    const formData = prepareFormData();
    startTransition(async () => {
        try {
            await validateAndScheduleProduct(formData);
            alert("Published to Schedule!");
            resetForm();
        } catch (e) {
            alert("Error scheduling product.");
        }
    });
  };

  const handleDraft = async () => {
    const formData = prepareFormData();
    startTransition(async () => {
        try {
            await saveDraft(formData);
            alert("Saved as Draft!");
            resetForm();
        } catch (e) {
            alert("Error saving draft.");
        }
    });
  };

  const resetForm = () => {
    setInputs(prev => ({ 
        ...prev, 
        name: "", customerName: "", customerPhone: "", 
        customerAddress: "", customerNotes: "" 
    }));
  };

  const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-blue-900 p-6 text-white">
        <h2 className="text-2xl font-bold">iLab TN - Price Calculator</h2>
        <p className="text-blue-200 text-sm">Fill in the fields to calculate production costs.</p>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl space-y-4 border border-blue-100 shadow-sm">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest border-b border-blue-200 pb-2">Client & Project Info</h3>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><Box size={12} className="text-blue-500" /> Project Name</label>
                <input type="text" name="name" value={inputs.name} onChange={handleInputChange} className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><User size={12} className="text-blue-500" /> Client Name</label>
                    <input type="text" name="customerName" value={inputs.customerName} onChange={handleInputChange} className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><Phone size={12} className="text-blue-500" /> Phone</label>
                    <input type="text" name="customerPhone" value={inputs.customerPhone} onChange={handleInputChange} className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><MapPin size={12} className="text-blue-500" /> Delivery Address</label>
                <input type="text" name="customerAddress" value={inputs.customerAddress} onChange={handleInputChange} className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><Notebook size={12} className="text-blue-500" /> Notes</label>
                <textarea name="customerNotes" value={inputs.customerNotes} onChange={handleInputChange} rows={2} className="w-full p-2 bg-white border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Production Inputs</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Filament (grams)</label>
            <div className="flex items-center gap-4">
              <input type="number" name="filamentWeight" value={inputs.filamentWeight} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-green-50 border-green-200" />
              <span className="text-xs text-gray-400 w-24">x {settings.filamentCostPerGram} = {fmt(results.totalFilamentCost)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Print Time (hours)</label>
            <div className="flex items-center gap-4">
              <input type="number" name="printHours" value={inputs.printHours} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-green-50 border-green-200" />
              <span className="text-xs text-gray-400 w-24">x {settings.elecCostPerHour} = {fmt(results.totalElecCost)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Employee Time (hours)</label>
            <div className="flex items-center gap-4">
              <input type="number" name="employeeHours" value={inputs.employeeHours} onChange={handleInputChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-green-50 border-green-200" />
              <span className="text-xs text-gray-400 w-24">x {fmt(settings.employeeHourlyRate)} = {fmt(results.totalEmployeeCost)}</span>
            </div>
          </div>

          <div className="pt-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Additional Costs</h3>
                <button onClick={addCustomCost} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"><Plus size={14} /> Add One-off</button>
             </div>
             <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                {activeCosts.map((cost, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <input type="text" value={cost.name} onChange={(e) => updateCostName(idx, e.target.value)} className="flex-1 bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0 px-0" />
                        <input type="number" value={cost.amount} onChange={(e) => handleCostChange(idx, e.target.value)} className="w-20 p-1 border rounded text-right text-sm bg-white" />
                        <button onClick={() => removeCost(idx)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                ))}
                <div className="text-right text-xs text-gray-500 font-medium pt-2 border-t border-gray-200 mt-2">Total Extras: {fmt(results.totalAdditionalCost)}</div>
             </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-700">Cost Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600"><span>Total Direct Cost</span><span>{fmt(results.totalCost)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Amortization ({settings.amortizationRate * 100}%)</span><span>{fmt(results.amortization)}</span></div>
            <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-300"><span>Final Product Cost</span><span>{fmt(results.finalProductCost)}</span></div>
          </div>
          <div className="space-y-3 pt-6">
             <div className="flex justify-between text-gray-600 text-sm"><span>Selling Price (HTVA)</span><span>{fmt(results.sellingPriceHTVA)}</span></div>
            <div className="flex justify-between text-gray-600 text-sm"><span>TVA ({settings.vatRate * 100}%)</span><span>{fmt(results.tvaAmount)}</span></div>
          </div>
          <div className="pt-6 border-t-2 border-blue-200">
            <label className="block text-sm text-blue-800 mb-1 font-bold">TOTAL PRICE (TND)</label>
            <div className="text-4xl font-black text-blue-600">{fmt(results.totalPriceTND)} <span className="text-lg text-blue-400">DT</span></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
                onClick={handleDraft} 
                disabled={isPending} 
                className={`py-3 flex items-center justify-center gap-2 text-gray-700 bg-white border border-gray-300 font-bold rounded-lg shadow-sm transition-colors ${isPending ? "cursor-not-allowed opacity-50" : "hover:bg-gray-50"}`}
            >
                <Archive size={18} /> Save Draft
            </button>
            <button 
                onClick={handleValidate} 
                disabled={isPending} 
                className={`py-3 flex items-center justify-center gap-2 text-white bg-blue-600 font-bold rounded-lg shadow-sm transition-colors ${isPending ? "cursor-not-allowed bg-blue-400" : "hover:bg-blue-700"}`}
            >
                <CheckCircle size={18} /> Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}