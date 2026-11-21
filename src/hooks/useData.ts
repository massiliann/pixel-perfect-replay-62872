import { useSyncExternalStore } from "react";
import { dataService } from "@/lib/dataService";

/** Dane nawyków (nawyki + wpisy) */
export const useData = () =>
  useSyncExternalStore(
    dataService.subscribe,
    dataService.getSnapshot,
    dataService.getServerSnapshot,
  );

/** Stan ładowania i błędu (dla ekranu ładowania) */
export const useDataStatus = () =>
  useSyncExternalStore(
    dataService.subscribe,
    dataService.getStatusSnapshot,
    dataService.getServerStatusSnapshot,
  );
