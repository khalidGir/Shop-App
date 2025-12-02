import { apiSlice } from './apiSlice';

const INVENTORY_URL = '/inventory';

export const inventoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getLowStockAlerts: builder.query({
            query: () => ({
                url: `${INVENTORY_URL}/low-stock`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Product'],
        }),
        getReorderSuggestions: builder.query({
            query: () => ({
                url: `${INVENTORY_URL}/reorder-suggestions`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Product', 'Order'],
        }),
        getStockTurnover: builder.query({
            query: (days) => ({
                url: `${INVENTORY_URL}/turnover`,
                params: { days },
            }),
            keepUnusedDataFor: 5,
        }),
        getInventoryValue: builder.query({
            query: () => ({
                url: `${INVENTORY_URL}/value`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Product'],
        }),
        getStockLevels: builder.query({
            query: () => ({
                url: `${INVENTORY_URL}/stock-levels`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Product'],
        }),
    }),
});

export const {
    useGetLowStockAlertsQuery,
    useGetReorderSuggestionsQuery,
    useGetStockTurnoverQuery,
    useGetInventoryValueQuery,
    useGetStockLevelsQuery,
} = inventoryApiSlice;
