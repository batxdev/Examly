import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PROGRESS_API = "http://localhost:8080/api/v1/progress";
const TEST_API = "http://localhost:8080/api/v1/tests";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method: "POST",
      }),
    }),

    completeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/complete`,
        method: "POST",
      }),
    }),
    inCompleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/incomplete`,
        method: "POST",
      }),
    }),

    // Manual test completion
    markTestCompletion: builder.mutation({
      query: ({ courseId, testId, completed }) => ({
        url: `/${courseId}/lecture/${testId}/${
          completed ? "complete" : "incomplete"
        }`,
        method: "POST",
      }),
    }),

    // New test-related endpoints
    startTest: builder.mutation({
      query: ({ courseId, testId }) => ({
        url: `${TEST_API}/start`,
        method: "POST",
        body: { courseId, testId },
      }),
    }),

    submitTest: builder.mutation({
      query: (testData) => ({
        url: `${TEST_API}/submit`,
        method: "POST",
        body: testData,
      }),
    }),

    getTestSubmissions: builder.query({
      query: (testId) => ({
        url: `${TEST_API}/${testId}/submissions`,
        method: "GET",
      }),
    }),

    getStudentTestSubmission: builder.query({
      query: ({ testId, studentId }) => ({
        url: `${TEST_API}/${testId}/student/${studentId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation,
  useMarkTestCompletionMutation,
  // Test endpoints
  useStartTestMutation,
  useSubmitTestMutation,
  useGetTestSubmissionsQuery,
  useGetStudentTestSubmissionQuery,
} = courseProgressApi;

export const studentTestSubmissionsApi = createApi({
  reducerPath: "studentTestSubmissionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/test",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getStudentTestSubmissions: builder.query({
      query: () => ({
        url: "/my-submissions",
        method: "GET",
      }),
      providesTags: ["TestSubmissions"],
    }),
  }),
});

export const { useGetStudentTestSubmissionsQuery } = studentTestSubmissionsApi;
