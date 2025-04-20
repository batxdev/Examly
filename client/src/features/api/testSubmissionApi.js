import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const testSubmissionApi = createApi({
  reducerPath: "testSubmissionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    credentials: "include",
  }),
  tagTypes: ["TestSubmissions"],
  endpoints: (builder) => ({
    getStudentTestSubmissions: builder.query({
      query: () => ({
        url: "/api/v1/test/my-submissions",
        method: "GET",
      }),
      providesTags: ["TestSubmissions"],
    }),
  }),
});

export const { useGetStudentTestSubmissionsQuery } = testSubmissionApi;
