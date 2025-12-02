import { apiSlice } from './apiSlice';

const DASHBOARD_URL = '/dashboard';

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardSummary: builder.query({
            query: () => ({
                url: DASHBOARD_URL,
            }),
            keepUnusedDataFor: 5,
        }),
    }),
});

export const { useGetDashboardSummaryQuery } = dashboardApiSlice;
