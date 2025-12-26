import Calculator from "./components/Calculator";
import ProductionManager from "./components/ProductionManager";
import { supabase } from "./lib/supabaseClient";
import { getSettingsAndPresets } from "./actions"; 
import Link from "next/link";
import { Settings } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch Schedule (Items in queue)
  let { data: queueData } = await supabase
    .from('ProductionQueue')
    .select('*, product:Product(*)')
    .order('startTime', { ascending: true });

  const schedule = (queueData || []).map(item => ({
    ...item,
    startTime: new Date(item.startTime),
    endTime: new Date(item.endTime),
  }));

  // 2. Fetch Drafts (Items NOT in queue)
  let { data: drafts } = await supabase
    .from('Product')
    .select('*')
    .eq('isValidated', false)
    .order('createdAt', { ascending: false });

  // 3. Fetch Settings & Presets
  const { settings, presets } = await getSettingsAndPresets();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 md:p-24 bg-gray-100 gap-8">
      
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">iLab Production</h1>
        <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      <Calculator settings={settings} presets={presets} />
      <ProductionManager drafts={drafts || []} schedule={schedule} />
    </main>
  );
}
