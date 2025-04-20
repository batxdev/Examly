import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseProgressQuery,
  useMarkTestCompletionMutation,
} from "@/features/api/courseProgressApi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  CircleCheck,
  CircleX,
  ClipboardList,
  Clock,
  FileText,
  LucideListChecks,
  PanelRight,
  Search,
  Trophy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TestSelection = () => {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId;
  const { user } = useSelector((store) => store.auth);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);
  const [markTestCompletion, { isLoading: isMarkingCompletion }] =
    useMarkTestCompletionMutation();

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );

  if (isError)
    return (
      <div className="max-w-4xl mx-auto my-12 text-center">
        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load tests</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't load the test information. Please try again later.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  const { courseDetails, progress } = data.data;
  const { courseTitle } = courseDetails;

  // Filter only tests (lectures with isTest=true)
  const allTests = courseDetails.lectures.filter((lecture) => lecture.isTest);

  // Filter tests based on search query
  const filteredTests = allTests.filter((test) =>
    test.lectureTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isTestCompleted = (testId) => {
    return progress.some((prog) => prog.lectureId === testId && prog.viewed);
  };

  const handleStartTest = (testId) => {
    const isCompleted = isTestCompleted(testId);
    // Navigate to the test progress page with a review parameter if the test is already completed
    navigate(
      `/test-progress/${courseId}?testId=${testId}${
        isCompleted ? "&review=true" : ""
      }`
    );
  };

  const handleToggleCompletion = async (testId) => {
    const isCompleted = isTestCompleted(testId);
    try {
      await markTestCompletion({
        courseId,
        testId,
        completed: !isCompleted,
      });

      refetch();
      toast.success(
        `Test marked as ${!isCompleted ? "completed" : "incomplete"}`
      );
    } catch (error) {
      toast.error(
        `Failed to mark test as ${!isCompleted ? "completed" : "incomplete"}`
      );
    }
  };

  // Calculate completion stats
  const completedTests = allTests.filter((test) =>
    isTestCompleted(test._id)
  ).length;
  const completionPercentage =
    allTests.length > 0
      ? Math.round((completedTests / allTests.length) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{courseTitle}</h1>
        <p className="text-muted-foreground">
          Select a test to begin your assessment
        </p>
      </div>

      {/* Search and Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Search */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Search className="mr-2 h-4 w-4" />
              Search Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search for a test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Completion Stats */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tests Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTests}/{allTests.length}
            </div>
          </CardContent>
        </Card>

        {/* Completion Percentage */}
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => (
            <Card
              key={test._id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div
                className={`h-2 ${
                  isTestCompleted(test._id) ? "bg-green-500" : "bg-blue-500"
                }`}
              ></div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">
                    {test.lectureTitle}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isTestCompleted(test._id) && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompletion(test._id);
                          }}
                          className="cursor-pointer"
                          disabled={isMarkingCompletion}
                        >
                          {isTestCompleted(test._id) ? (
                            <CircleX className="h-4 w-4 mr-2 text-red-500" />
                          ) : (
                            <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                          )}
                          Mark as{" "}
                          {isTestCompleted(test._id)
                            ? "Incomplete"
                            : "Completed"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{test.testDuration} minutes</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <LucideListChecks className="h-4 w-4 mr-2" />
                    <span>{test.questions?.length || 0} questions</span>
                  </div>
                  {test.testInstructions && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {test.testInstructions}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleStartTest(test._id)}
                  className="w-full"
                  variant={isTestCompleted(test._id) ? "outline" : "default"}
                >
                  {isTestCompleted(test._id) ? (
                    <>
                      <PanelRight className="h-4 w-4 mr-2" />
                      Review Test
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Start Test
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            {searchQuery ? (
              <>
                <h2 className="text-xl font-bold mb-2">
                  No tests match your search
                </h2>
                <p className="text-muted-foreground mb-6">
                  Try a different search term or browse all available tests
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Show All Tests
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">No tests available</h2>
                <p className="text-muted-foreground mb-6">
                  This course doesn't have any tests yet
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {completedTests === allTests.length && allTests.length > 0 && (
        <Card className="bg-green-50 dark:bg-green-900/10 mb-8">
          <CardContent className="flex items-center justify-center p-6">
            <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-xl font-bold mb-1">Congratulations!</h3>
              <p className="text-muted-foreground">
                You've completed all available tests in this course.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestSelection;
