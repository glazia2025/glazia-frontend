# User Data Refresh System Documentation

## Overview

The User Data Refresh System automatically keeps the `glazia-user` localStorage data synchronized with the backend API. This ensures that user data is always up-to-date whenever the user navigates to different routes or refreshes the page.

## Components

### 1. UserDataRefresher Component (`src/components/UserDataRefresher.tsx`)

This is the main component that handles automatic user data refresh. It:

- **Runs on every page** (included in the root layout)
- **Listens for route changes** using Next.js `usePathname` hook
- **Refreshes user data on page load/refresh**
- **Handles cross-tab authentication** (when user logs in/out in another tab)
- **Provides comprehensive logging** for debugging

**Key Features:**
- ✅ Automatic refresh on route changes
- ✅ Automatic refresh on page load/refresh
- ✅ Cross-tab synchronization
- ✅ Token expiration handling
- ✅ Graceful error handling
- ✅ Comprehensive console logging

### 2. useUserDataRefresh Hook (`src/hooks/useUserDataRefresh.ts`)

A custom hook that provides manual user data refresh functionality:

```typescript
const { refreshUserData, hasUserData, getCurrentUserData } = useUserDataRefresh();

// Manual refresh
const result = await refreshUserData();
if (result.success) {
  console.log('User data refreshed!', result.data);
} else {
  console.log('Refresh failed:', result.error);
}
```

**Available Methods:**
- `refreshUserData()` - Manually refresh user data from API
- `hasUserData()` - Check if user data exists in localStorage
- `getCurrentUserData()` - Get current user data from localStorage

### 3. Test Page (`src/app/test-user-refresh/page.tsx`)

A comprehensive test page to demonstrate and verify the functionality:
- **URL:** `http://localhost:3001/test-user-refresh`
- **Features:** Simulate login/logout, manual refresh, route navigation testing

## How It Works

### 1. Automatic Triggers

The system automatically refreshes user data when:

1. **Page Load/Refresh** - When the user loads or refreshes any page
2. **Route Changes** - When the user navigates to different pages
3. **Cross-tab Login** - When the user logs in from another browser tab

### 2. API Integration

The system uses the existing `UserApiService` to fetch user data from:
- **Endpoint:** `/api/user/profile`
- **Method:** GET
- **Authentication:** Bearer token from localStorage

### 3. Data Transformation

The API response is transformed to match the expected user data format:

```typescript
const userData = {
  id: response.data._id || response.data.id,
  name: response.data.userName || response.data.name,
  email: response.data.email || '',
  phone: response.data.phoneNumber || response.data.phone,
  // ... other fields
  dynamicPricing: response.data.dynamicPricing || {}
};
```

### 4. Error Handling

The system handles various error scenarios:

- **401 Unauthorized** - Clears auth token and user data (token expired)
- **404 Not Found** - Keeps existing data (API endpoint not available)
- **Network Errors** - Keeps existing data (server down, network issues)

## Installation & Setup

The system is already integrated into the application. No additional setup required.

### Files Added/Modified:

1. **Added:** `src/components/UserDataRefresher.tsx`
2. **Added:** `src/hooks/useUserDataRefresh.ts`
3. **Added:** `src/app/test-user-refresh/page.tsx`
4. **Modified:** `src/app/layout.tsx` (added UserDataRefresher component)
5. **Modified:** `src/services/api.ts` (updated USER.PROFILE endpoint)

## Usage Examples

### For Components That Need Manual Refresh

```typescript
import { useUserDataRefresh } from '@/hooks/useUserDataRefresh';

function MyComponent() {
  const { refreshUserData } = useUserDataRefresh();
  
  const handleRefresh = async () => {
    const result = await refreshUserData();
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  return <button onClick={handleRefresh}>Refresh User Data</button>;
}
```

### For Checking User Data Availability

```typescript
import { useUserDataRefresh } from '@/hooks/useUserDataRefresh';

function MyComponent() {
  const { hasUserData, getCurrentUserData } = useUserDataRefresh();
  
  if (!hasUserData()) {
    return <div>No user data available</div>;
  }
  
  const userData = getCurrentUserData();
  return <div>Welcome, {userData.name}!</div>;
}
```

## Testing

### Manual Testing Steps:

1. **Visit Test Page:** `http://localhost:3001/test-user-refresh`
2. **Simulate Login:** Click "Simulate Login" button
3. **Test Route Changes:** Click navigation links to test automatic refresh
4. **Test Page Refresh:** Click "Refresh Page" button
5. **Check Console:** Open browser dev tools to see refresh logs
6. **Test Manual Refresh:** Click "Manual API Refresh" button

### Console Logs to Look For:

- `🔄 UserDataRefresher: Page loaded/refreshed`
- `🛣️ UserDataRefresher: Route changed to: /some-path`
- `✅ UserDataRefresher: Successfully refreshed user data via route change`
- `⚠️ UserDataRefresher: Failed to refresh user data via page load: API endpoint not available`

## Benefits

1. **Always Fresh Data** - User data is automatically kept up-to-date
2. **Seamless UX** - No manual refresh required by users
3. **Cross-tab Sync** - Changes in one tab reflect in others
4. **Robust Error Handling** - Gracefully handles API failures
5. **Easy Integration** - Works automatically without code changes
6. **Debugging Friendly** - Comprehensive logging for troubleshooting

## Future Enhancements

- **Configurable Refresh Intervals** - Add periodic refresh option
- **Selective Data Refresh** - Refresh only specific user data fields
- **Offline Support** - Handle offline scenarios gracefully
- **Real-time Updates** - WebSocket integration for real-time data sync
