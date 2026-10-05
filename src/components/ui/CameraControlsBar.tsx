import React from 'react';
import { 
  Globe, 
  Car, 
  Server, 
  Cpu, 
  Box, 
  CreditCard, 
  Inbox, 
  FileCheck, 
  Database 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CameraViewPreset } from '../../types/simulation';

interface CameraControlsBarProps {
  currentPreset: CameraViewPreset;
  onSelectPreset: (preset: CameraViewPreset) => void;
}

interface ViewItem {
  id: CameraViewPreset;
  label: string;
  icon: LucideIcon;
}

const VIEW_ITEMS: ViewItem[] = [
  { id: 'OVERVIEW', label: 'Overview', icon: Globe },
  { id: 'TRAFFIC_ARRIVAL', label: 'Traffic Zone', icon: Car },
  { id: 'API_GATEWAY', label: 'Gateway', icon: Server },
  { id: 'FLASH_ENGINE', label: 'Flash Engine', icon: Cpu },
  { id: 'INVENTORY_VAULT', label: 'Inventory', icon: Box },
  { id: 'PAYMENT_SERVICE', label: 'Payment', icon: CreditCard },
  { id: 'MESSAGE_QUEUE', label: 'Kafka Queue', icon: Inbox },
  { id: 'ORDER_SERVICE', label: 'Order Hub', icon: FileCheck },
  { id: 'CACHE_DB', label: 'Cache & DB', icon: Database },
];

export const CameraControlsBar: React.FC<CameraControlsBarProps> = ({
  currentPreset,
  onSelectPreset,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl shadow-black/80">
      {VIEW_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPreset === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectPreset(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
