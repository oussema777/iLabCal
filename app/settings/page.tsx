import { getSettingsAndPresets, updateSettings, addCostPreset, deleteCostPreset } from "../actions";
import Link from "next/link";
import { Trash2, Plus } from "lucide-react";

export default async function SettingsPage() {
  const { settings, presets } = await getSettingsAndPresets();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-100 gap-8">
      
      {/* 1. GLOBAL RATES FORM */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gray-800 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Global Rates</h2>
            <p className="text-gray-300 text-sm">Update production rates and cost factors.</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
            ← Back to Calculator
          </Link>
        </div>

        <form action={updateSettings} className="p-8 grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filament Cost (per gram)</label>
              <input type="number" step="0.001" name="filamentCostPerGram" defaultValue={settings.filamentCostPerGram} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Electricity Cost (per hour)</label>
              <input type="number" step="0.01" name="elecCostPerHour" defaultValue={settings.elecCostPerHour} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Employee Rate (per hour)</label>
              <input type="number" step="0.1" name="employeeHourlyRate" defaultValue={settings.employeeHourlyRate} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Amortization Rate (0.05 = 5%)</label>
              <input type="number" step="0.01" name="amortizationRate" defaultValue={settings.amortizationRate} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">VAT Rate (0.19 = 19%)</label>
              <input type="number" step="0.01" name="vatRate" defaultValue={settings.vatRate} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Margin Rate (0.60 = 60%)</label>
              <input type="number" step="0.01" name="marginRate" defaultValue={settings.marginRate} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="pt-6 border-t border-gray-100">
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition-colors">
              Save Rates
            </button>
          </div>
        </form>
      </div>

      {/* 2. STANDARD COSTS MANAGER */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-blue-900 p-6 text-white">
          <h2 className="text-xl font-bold">Standard Costs Presets</h2>
          <p className="text-blue-200 text-sm">Manage the default extra costs available in the calculator.</p>
        </div>

        <div className="p-8 space-y-6">
          {/* List of Existing Presets */}
          <div className="space-y-2">
            {presets.map((preset) => (
              <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex gap-4">
                  <span className="font-semibold text-gray-800 w-40">{preset.name}</span>
                  <span className="text-gray-600">{preset.defaultAmount} TND</span>
                </div>
                <form action={deleteCostPreset.bind(null, preset.id)}>
                   <button type="submit" className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded">
                     <Trash2 size={18} />
                   </button>
                </form>
              </div>
            ))}
          </div>

          {/* Add New Preset Form */}
          <form action={addCostPreset} className="flex gap-4 pt-4 border-t border-gray-100">
            <input type="text" name="name" placeholder="New Cost Name (e.g. Special Glue)" required className="flex-1 p-2 border rounded text-sm" />
            <input type="number" step="0.1" name="defaultAmount" placeholder="Amount" required className="w-24 p-2 border rounded text-sm" />
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold">
              <Plus size={16} /> Add
            </button>
          </form>
        </div>
      </div>

    </main>
  );
}