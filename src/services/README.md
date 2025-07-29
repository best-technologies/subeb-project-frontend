# API Services

This directory contains the API service layer for the application, including types, API client, and custom hooks.

## Structure

```
services/
├── api.ts                           # Main API client with all HTTP methods
├── types/
│   └── adminDashboardResponse.ts    # TypeScript types for API responses
├── hooks/
│   └── useAdminDashboard.ts         # Custom React hook for dashboard data
├── index.ts                         # Main export file
└── README.md                        # This documentation
```

## Usage

### Basic API Usage

```typescript
import { getAdminDashboard } from '@/services';

// Fetch admin dashboard data
const dashboardData = await getAdminDashboard();
```

### Using the Custom Hook

```typescript
import { useAdminDashboard } from '@/services';

function DashboardComponent() {
  const { data, loading, error, refetch } = useAdminDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Students: {data.totalStudents}</p>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}
```

### Direct API Client Usage

```typescript
import apiClient from '@/services';

// Use the client directly
const response = await apiClient.getAdminDashboard();
```

## Configuration

The API client is configured with:

- **Base URL**: `http://localhost:3000` (can be overridden with `NEXT_PUBLIC_API_BASE_URL` env variable)
- **API Version**: `v1`
- **Default Headers**: `Content-Type: application/json`, `Accept: application/json`

## Error Handling

The API client includes comprehensive error handling:

- HTTP status code errors
- Network errors
- JSON parsing errors
- Custom error messages from the server

## Authentication (Future)

When authentication is implemented, the service includes prepared methods:

```typescript
import { setAuthToken, clearAuthToken } from '@/services';

// Set auth token
setAuthToken('your-jwt-token');

// Clear auth token (logout)
clearAuthToken();
```

## Types

All API response types are defined in `types/adminDashboardResponse.ts`:

- `AdminDashboardResponse` - Main response wrapper
- `AdminDashboardData` - Dashboard data structure
- `School`, `LGA`, `Class`, `Subject`, etc. - Individual data types
- `ApiErrorResponse` - Error response structure

## Adding New Endpoints

To add a new API endpoint:

1. Add the method to `api.ts`:
```typescript
async getNewEndpoint(): Promise<NewResponseType> {
  return this.get<NewResponseType>('/new-endpoint');
}
```

2. Create types in `types/` directory
3. Create a custom hook if needed
4. Export from `index.ts`

## Environment Variables

Set these environment variables in your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
``` 