"use client";

import { useState, useTransition } from "react";
import { publishProduct, unpublishProduct, deleteProduct } from "../actions";
import { CalendarClock, Archive, Trash2, ArrowUpCircle, ArrowDownCircle, CheckCircle, Clock, User, Phone, MapPin, StickyNote, Calendar } from "lucide-react";

type ProductData = {
  id: number;
  name: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerNotes?: string | null;
  filamentWeight: number;
  printHours: number;
  isValidated: boolean;
};

type ScheduleItem = {
  id: number;
  startTime: Date;
  endTime: Date;
  product: ProductData;
};

// HELPER: Format Date nicely (e.g., "Mon, Jan 22")
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
};

// HELPER: Format Time (e.g., "09:30 AM")
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
};

export default function ProductionManager({ 
  drafts, 
  schedule 
}: { 
  drafts: ProductData[], 
  schedule: ScheduleItem[] 
}) {
  const [activeTab, setActiveTab] = useState<"queue" | "drafts">("queue");

  return (
    <div className="w-full max-w-4xl mt-12 space-y-6">
      
      {/* TABS HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1">
        <div className="flex gap-1">
            <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold text-sm transition-all ${
                activeTab === "queue" 
                ? "bg-white border border-gray-200 border-b-white text-blue-700 shadow-sm translate-y-[1px]" 
                : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            >
            <CalendarClock size={18} className={activeTab === "queue" ? "text-blue-600" : ""} /> 
            Production Queue 
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "queue" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {schedule.length}
            </span>
            </button>
            <button
            onClick={() => setActiveTab("drafts")}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold text-sm transition-all ${
                activeTab === "drafts" 
                ? "bg-white border border-gray-200 border-b-white text-orange-700 shadow-sm translate-y-[1px]" 
                : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            >
            <Archive size={18} className={activeTab === "drafts" ? "text-orange-600" : ""} /> 
            Drafts
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === "drafts" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                {drafts.length}
            </span>
            </button>
        </div>
      </div>

      {/* QUEUE VIEW */}
      {activeTab === "queue" && (
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 min-h-[300px]">
          {schedule.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-200">
                    <CalendarClock size={32} />
                </div>
                <p>Production line is clear.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
                {schedule.map((item) => (
                  <QueueCard key={item.id} item={item} />
                ))}
            </div>
          )}
        </div>
      )}

      {/* DRAFTS VIEW */}
      {activeTab === "drafts" && (
        <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 min-h-[300px]">
          {drafts.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <Archive size={32} />
                </div>
                <p>No drafts saved.</p>
             </div>
          ) : (
            <div className="divide-y divide-gray-100">
                {drafts.map((product) => (
                  <DraftCard key={product.id} product={product} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- COMPONENT: QUEUE ROW CARD ---
function QueueCard({ item }: { item: ScheduleItem }) {
  const [isPending, startTransition] = useTransition();
  const startDate = item.startTime;
  
  return (
    <div className="p-6 hover:bg-blue-50/20 transition-colors group flex flex-col md:flex-row gap-6 items-start">
      
      {/* 1. DATE / TIME BADGE */}
      <div className="flex-shrink-0 w-full md:w-48 bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 text-blue-800 font-bold uppercase text-xs mb-1">
            <Calendar size={12} /> {formatDate(startDate)}
        </div>
        <div className="text-xl font-black text-blue-900">
            {formatTime(startDate)}
        </div>
        <div className="text-xs text-blue-400 font-medium my-1">to</div>
        <div className="text-lg font-bold text-gray-500">
            {formatTime(item.endTime)}
        </div>
        <div className="mt-3 px-2 py-0.5 bg-white rounded text-[10px] font-bold text-blue-600 border border-blue-100 uppercase tracking-wide">
            {item.product.printHours} Hours
        </div>
      </div>

      {/* 2. PROJECT INFO */}
      <div className="flex-grow space-y-3">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200 flex items-center gap-1">
                    <CheckCircle size={10} /> Scheduled
                </span>
                <span className="text-xs text-gray-400 font-medium">{item.product.filamentWeight}g Filament</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.product.name}</h3>
        </div>

        {/* CUSTOMER CARD */}
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            {item.product.customerName && (
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium col-span-2">
                    <User size={14} className="text-gray-400" /> 
                    {item.product.customerName}
                </div>
            )}
            {item.product.customerPhone && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={14} className="text-gray-400" /> 
                    {item.product.customerPhone}
                </div>
            )}
            {item.product.customerAddress && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={14} className="text-gray-400" /> 
                    <span className="truncate">{item.product.customerAddress}</span>
                </div>
            )}
            {item.product.customerNotes && (
                <div className="flex items-start gap-2 text-xs text-gray-500 col-span-2 mt-1 pt-2 border-t border-gray-200">
                    <StickyNote size={14} className="text-amber-400 mt-0.5" /> 
                    <span className="italic text-gray-600 bg-amber-50 px-2 py-1 rounded w-full">{item.product.customerNotes}</span>
                </div>
            )}
        </div>
      </div>

      {/* 3. ACTIONS */}
      <div className="flex-shrink-0 self-start md:self-center">
        <button 
          disabled={isPending}
          onClick={() => startTransition(() => unpublishProduct(item.product.id))}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
        >
          {isPending ? "..." : <><ArrowDownCircle size={16} /> Unpublish</>}
        </button>
      </div>

    </div>
  );
}


// --- COMPONENT: DRAFT ROW CARD ---
function DraftCard({ product }: { product: ProductData }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if(confirm("Are you sure you want to permanently delete this draft?")) {
        startTransition(() => deleteProduct(product.id));
    }
  }

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors group flex flex-col md:flex-row gap-6 items-start">
        
      {/* 1. SPECS BADGE */}
      <div className="flex-shrink-0 w-full md:w-32 flex flex-col items-start gap-1">
        <div className="text-3xl font-black text-gray-200 select-none">DRAFT</div>
        <div className="text-xs font-bold text-gray-500 mt-1">{product.printHours}h Print</div>
        <div className="text-xs text-gray-400">{product.filamentWeight}g Filament</div>
      </div>

      {/* 2. INFO */}
      <div className="flex-grow space-y-3">
        <h3 className="text-lg font-bold text-gray-700 leading-tight">{product.name}</h3>
        
        {/* CUSTOMER INFO MINI */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
            {product.customerName && (
                <div className="flex items-center gap-1.5"><User size={12} /> {product.customerName}</div>
            )}
            {product.customerPhone && (
                <div className="flex items-center gap-1.5"><Phone size={12} /> {product.customerPhone}</div>
            )}
            {product.customerNotes && (
                <div className="flex items-center gap-1.5 text-amber-600"><StickyNote size={12} /> Note attached</div>
            )}
        </div>
      </div>

      {/* 3. ACTIONS */}
      <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center">
        <button 
          disabled={isPending}
          onClick={handleDelete}
          className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Draft"
        >
          <Trash2 size={18} />
        </button>
        <button 
          disabled={isPending}
          onClick={() => startTransition(() => publishProduct(product.id, product.printHours))}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          {isPending ? "..." : <><ArrowUpCircle size={16} /> Publish</>}
        </button>
      </div>

    </div>
  );
}
