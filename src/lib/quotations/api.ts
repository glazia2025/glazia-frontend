import axios from "axios";
import {
  DescriptionsResponse,
  OptionsResponse,
  SeriesResponse,
  SystemsResponse,
} from "./types";

const apiBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: false,
});

export async function fetchSystems() {
  const { data } = await apiClient.get<SystemsResponse>(
    "/api/quotations/systems"
  );
  return data;
}

export async function fetchSeries(systemType: string) {
  const { data } = await apiClient.get<SeriesResponse>(
    `/api/quotations/systems/${encodeURIComponent(systemType)}/series`
  );
  return data;
}

export async function fetchDescriptions(systemType: string, series: string) {
  const { data } = await apiClient.get<DescriptionsResponse>(
    `/api/quotations/systems/${encodeURIComponent(
      systemType
    )}/series/${encodeURIComponent(series)}/descriptions`
  );
  return data;
}

export async function fetchOptions(systemType: string) {
  const { data } = await apiClient.get<OptionsResponse>(
    `/api/quotations/options`,
    { params: { systemType } }
  );
  return data;
}
