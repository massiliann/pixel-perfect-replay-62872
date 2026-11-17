import { useSyncExternalStore } from "react";
import { dataService } from "@/lib/dataService";
export const useData = () => useSyncExternalStore(dataService.subscribe, dataService.getSnapshot, dataService.getServerSnapshot);

export const useDataStatus = () => useSyncExternalStore(dataService.subscribe, dataService.getStatusSnapshot, dataService.getServerStatusSnapshot);
