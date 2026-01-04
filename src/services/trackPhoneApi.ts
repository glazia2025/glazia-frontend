import { apiClient, ApiResponse } from './api';

export interface TrackPhoneResponse {
  success: boolean;
  message?: string;
}

export const trackPhone = async (
  phone: string,
  reason: string
): Promise<ApiResponse<TrackPhoneResponse>> => {
  return apiClient.post('/api/user/track-phone', {
    body: {
      phone,
      reason,
    },
  });
};
