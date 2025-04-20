import React, { useState } from "react";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetStudentTestSubmissionsQuery } from "@/features/api/testSubmissionApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const MyLearning = () => {
  const { data: userData, isLoading: userLoading } = useLoadUserQuery();
  const { data: testSubmissions, isLoading: submissionsLoading } =
    useGetStudentTestSubmissionsQuery();

  const [activeTab, setActiveTab] = useState("courses");
  const [completedCourses, setCompletedCourses] = useState({});

  const myLearning = userData?.user.enrolledCourses || [];
  const mySubmissions = testSubmissions?.data || [];

  const isLoading = userLoading || submissionsLoading;

  const handleToggleCompletion = (courseId) => {
    setCompletedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));

    toast.success(
      `Course marked as ${
        completedCourses[courseId] ? "incomplete" : "complete"
      }`
    );
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "started":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            In Progress
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Submitted
          </Badge>
        );
      case "graded":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Graded
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy • HH:mm");
  };

  // Function to calculate score percentage
  const calculateScore = (submission) => {
    if (submission.status !== "graded") return null;

    const maxScore = submission.answers.length;
    if (maxScore === 0) return 0;

    return Math.round((submission.totalScore / maxScore) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto my-10 px-4 md:px-8">
      <h1 className="font-bold text-2xl md:text-3xl mb-6">My Learning</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>My Tests</span>
            {myLearning.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {myLearning.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>My Submissions</span>
            {mySubmissions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {mySubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {isLoading ? (
            <MyLearningSkeleton />
          ) : myLearning.length === 0 ? (
            <EmptyState
              title="No test given yet"
              description="Explore our test catalog to find tests that interest you."
              icon={<BookOpen className="h-12 w-12 text-gray-400" />}
              buttonText="Browse Tests"
              buttonLink="/"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLearning.map((course, index) => (
                <SimpleCourseCard
                  key={index}
                  course={course}
                  isCompleted={completedCourses[course._id] || false}
                  onToggleCompletion={() => handleToggleCompletion(course._id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          {isLoading ? (
            <MyLearningSkeleton />
          ) : mySubmissions.length === 0 ? (
            <EmptyState
              title="No tests taken yet"
              description="You haven't taken any tests yet. Start exploring our test catalog."
              icon={<FileText className="h-12 w-12 text-gray-400" />}
              buttonText="Explore Tests"
              buttonLink="/"
            />
          ) : (
            <div className="space-y-6">
              {mySubmissions.map((submission, index) => (
                <Card
                  key={index}
                  className="overflow-hidden shadow-md hover:shadow-lg transition-all"
                >
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl font-bold">
                          {submission.testId?.lectureTitle || "Untitled Test"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {submission.courseId?.courseTitle || "Unknown Course"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                        {submission.status === "graded" && (
                          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                            Score: {submission.totalScore}/
                            {submission.answers.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Started: {formatDate(submission.startTime)}
                          </span>
                        </div>
                        {submission.submitTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>
                              Submitted: {formatDate(submission.submitTime)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>
                            Questions Answered: {submission.answers.length}
                          </span>
                        </div>
                      </div>

                      {submission.status === "graded" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Score</span>
                            <span className="text-sm font-bold">
                              {calculateScore(submission)}%
                            </span>
                          </div>
                          <Progress
                            value={calculateScore(submission)}
                            className="h-2 bg-gray-200 dark:bg-gray-700"
                          />
                          <div className="flex justify-center mt-4">
                            {calculateScore(submission) >= 70 ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <Award className="h-5 w-5" />
                                <span className="font-medium">Passed</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-600">
                                <Sparkles className="h-5 w-5" />
                                <span className="font-medium">
                                  Keep Learning
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-6">
                      <Link to={`/course-detail/${submission.courseId?._id}`}>
                        <Button variant="outline" size="sm">
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple Course Card component for My Learning page
const SimpleCourseCard = ({ course, isCompleted, onToggleCompletion }) => {
  return (
    <Card className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative">
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <CardContent className="px-5 py-5 flex flex-col space-y-4">
        <Link to={`/course-detail/${course._id}`} className="group">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {course.courseTitle}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm font-medium">
              {isCompleted ? "Completed" : "In Progress"}
            </span>
          </div>

          <Switch
            checked={isCompleted}
            onCheckedChange={onToggleCompletion}
            aria-label="Toggle course completion"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Empty state component
const EmptyState = ({ title, description, icon, buttonText, buttonLink }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-900">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
      {description}
    </p>
    <Link to={buttonLink}>
      <Button>{buttonText}</Button>
    </Link>
  </div>
);

// Skeleton component for loading state
const MyLearningSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <CardContent className="p-5 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default MyLearning;
