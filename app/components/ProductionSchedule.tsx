import { format } from "date-fns"; 

type ScheduleItem = {
  id: number;
  product: {
    name: string;
    customerName?: string | null;
    customerPhone?: string | null;
    customerAddress?: string | null;
    filamentWeight: number;
    printHours: number;
  };
  startTime: Date;
  endTime: Date;
};

export default function ProductionSchedule({ schedule }: { schedule: ScheduleItem[] }) {
  if (schedule.length === 0) {
    return (
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 mt-8">
        No jobs in queue. Validate a product to start production.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Production Schedule</h3>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4">Project / Client</th>
              <th className="p-4">Schedule</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedule.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 font-medium text-gray-900">
                  <div className="font-bold text-blue-900 text-base">{item.product.name}</div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {item.product.customerName && (
                        <span className="text-xs text-gray-700 font-semibold uppercase">{item.product.customerName}</span>
                    )}
                    {item.product.customerPhone && (
                        <span className="text-xs text-gray-500 italic">{item.product.customerPhone}</span>
                    )}
                    {item.product.customerAddress && (
                        <span className="text-[10px] text-gray-400 truncate max-w-[250px]">{item.product.customerAddress}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  <div className="text-xs font-bold text-blue-600">START: {item.startTime.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 font-medium">END: {item.endTime.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
                    {item.product.printHours}h print • {item.product.filamentWeight}g filament
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">
                    In Queue
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
