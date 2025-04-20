import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CHEATING_API = "http://localhost:8080/api";

export const cheatingApi = createApi({
  reducerPath: "cheatingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CHEATING_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    reportCheatingAttempt: builder.mutation({
      query: (data) => ({
        url: "/cheating-attempt",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useReportCheatingAttemptMutation } = cheatingApi;
