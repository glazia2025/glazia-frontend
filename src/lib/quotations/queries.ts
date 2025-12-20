import { useQuery } from "@tanstack/react-query";
import {
  fetchDescriptions,
  fetchOptions,
  fetchSeries,
  fetchSystems,
} from "./api";

export function useSystemsQuery() {
  return useQuery({
    queryKey: ["quotations", "systems"],
    queryFn: fetchSystems,
    retry: 1,
  });
}

export function useSeriesQuery(systemType: string) {
  return useQuery({
    queryKey: ["quotations", "systems", systemType, "series"],
    queryFn: () => fetchSeries(systemType),
    enabled: Boolean(systemType),
    retry: 1,
  });
}

export function useDescriptionsQuery(systemType: string, series: string) {
  return useQuery({
    queryKey: ["quotations", "systems", systemType, "series", series, "descriptions"],
    queryFn: () => fetchDescriptions(systemType, series),
    enabled: Boolean(systemType && series),
    retry: 1,
  });
}

export function useOptionsQuery(systemType: string) {
  return useQuery({
    queryKey: ["quotations", "options", systemType],
    queryFn: () => fetchOptions(systemType),
    enabled: Boolean(systemType),
    retry: 1,
  });
}
