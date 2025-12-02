import { apiSlice } from './apiSlice';

const FINANCE_URL = '/finance';

export const financeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFinancialSummary: builder.query({
            query: (params) => ({
                url: `${FINANCE_URL}/summary`,
                params,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Order', 'Purchase', 'Expense'],
        }),
        getCashFlow: builder.query({
            query: () => ({
                url: `${FINANCE_URL}/cash-flow`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Order', 'Purchase', 'Expense'],
        }),
        getReceivables: builder.query({
            query: () => ({
                url: `${FINANCE_URL}/receivables`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Order'],
        }),
        getPayables: builder.query({
            query: () => ({
                url: `${FINANCE_URL}/payables`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Purchase'],
        }),
        getAgingReport: builder.query({
            query: () => ({
                url: `${FINANCE_URL}/aging-report`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Invoice'],
        }),
    }),
});

export const {
    useGetFinancialSummaryQuery,
    useGetCashFlowQuery,
    useGetReceivablesQuery,
    useGetPayablesQuery,
    useGetAgingReportQuery,
} = financeApiSlice;
