import Calculator from "./components/Calculator";
import ProductionManager from "./components/ProductionManager";
import prisma from "@/lib/prisma";
import { getSettingsAndPresets } from "./actions"; 
import Link from "next/link";
import { Settings } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Fetch Schedule (Items in queue)
  let schedule: any[] = [];
  try {
    schedule = await prisma.productionQueue.findMany({
      include: { product: true },
      orderBy: { startTime: 'asc' }
    });
  } catch (e) {
    console.log("Database not ready yet.");
  }

  // 2. Fetch Drafts (Items NOT in queue)
  let drafts: any[] = [];
  try {
    drafts = await prisma.product.findMany({
      where: {
        isValidated: false
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (e) {
    console.log("Database not ready yet.");
  }

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
      <ProductionManager drafts={drafts} schedule={schedule} />
    </main>
  );
}