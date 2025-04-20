import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useSubmitTestMutation,
} from "@/features/api/courseProgressApi";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Timer,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Visibility from "./Visibility";

const TestProgress = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = params.courseId;
  const { user } = useSelector((store) => store.auth);

  // Extract testId from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const testIdFromUrl = queryParams.get("testId");
  const isReviewing = queryParams.get("review") === "true";

  const { data, isLoading, isError } = useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse] = useCompleteCourseMutation();
  const [submitTest, { isLoading: isSubmitting, isSuccess: isSubmitSuccess }] =
    useSubmitTestMutation();

  const [currentTest, setCurrentTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  // Effect to handle timer countdown
  useEffect(() => {
    if (!testStarted || timeLeft <= 0 || isReviewing) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    if (timeLeft === 0) {
      handleSubmitTest();
    }

    return () => clearInterval(timer);
  }, [testStarted, timeLeft, isReviewing]);

  // Effect to handle finding and setting the current test
  useEffect(() => {
    if (isLoading || isError || !data) return;

    // Find the test with the matching ID from URL
    if (testIdFromUrl && data?.data?.courseDetails?.lectures) {
      console.log("Looking for test with ID:", testIdFromUrl);
      const testFromUrl = data.data.courseDetails.lectures.find(
        (test) => test._id === testIdFromUrl && test.isTest
      );

      if (testFromUrl) {
        console.log("Found test:", testFromUrl.lectureTitle);
        setCurrentTest(testFromUrl);

        // If reviewing, set the test as started but don't start the timer
        if (isReviewing) {
          setTestStarted(true);

          // Initialize answers object with empty values for each question
          const initialAnswers = {};
          testFromUrl.questions.forEach((question, index) => {
            initialAnswers[`question_${index}`] =
              question.answerType === "multipleChoice" ? [] : "";
          });
          setAnswers(initialAnswers);
        }
      } else {
        console.log("Test not found in lectures array");
      }
    }
  }, [testIdFromUrl, data, isLoading, isError, isReviewing]);

  const handleBack = () => {
    navigate(`/test-selection/${courseId}`);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load test details</p>;

  const { courseDetails, progress } = data.data;
  const { courseTitle } = courseDetails;

  // Filter only tests (lectures with isTest=true)
  const tests = courseDetails.lectures.filter((lecture) => lecture.isTest);

  const isTestCompleted = (testId) => {
    return progress.some((prog) => prog.lectureId === testId && prog.viewed);
  };

  const handleStartTest = (test) => {
    console.log("Starting test:", test.lectureTitle);
    setCurrentTest(test);
    setTimeLeft(test.testDuration * 60); // Convert minutes to seconds
    setTestStarted(true);

    // Initialize answers object with empty values for each question
    const initialAnswers = {};
    test.questions.forEach((question, index) => {
      initialAnswers[`question_${index}`] =
        question.answerType === "multipleChoice" ? [] : "";
    });
    setAnswers(initialAnswers);

    // Mark test as started
    updateLectureProgress({ courseId, lectureId: test._id });
  };

  const handleAnswerChange = (questionIndex, value, isMultiChoice = false) => {
    // Don't allow answer changes in review mode
    if (isReviewing) return;

    if (isMultiChoice) {
      // Handle multi-choice checkboxes
      const currentAnswers = answers[`question_${questionIndex}`] || [];
      const updatedAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((option) => option !== value)
        : [...currentAnswers, value];

      setAnswers({
        ...answers,
        [`question_${questionIndex}`]: updatedAnswers,
      });
    } else {
      // Handle text or single choice
      setAnswers({
        ...answers,
        [`question_${questionIndex}`]: value,
      });
    }
  };

  const handleSubmitTest = async () => {
    if (!currentTest) return;

    // Validate if all questions are answered
    const unansweredQuestions = currentTest.questions.filter((_, index) => {
      const answer = answers[`question_${index}`];
      return !answer || (Array.isArray(answer) && answer.length === 0);
    });

    if (unansweredQuestions.length > 0) {
      toast.warning(
        `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`,
        {
          action: {
            label: "Submit Anyway",
            onClick: () => submitTestData(),
          },
        }
      );
      return;
    }

    submitTestData();
  };

  const submitTestData = async () => {
    // Format answers for submission
    const formattedAnswers = currentTest.questions.map((question, index) => ({
      questionId: question._id,
      questionText: question.questionText,
      answer: answers[`question_${index}`],
    }));

    try {
      await submitTest({
        testId: currentTest._id,
        courseId,
        studentId: user._id,
        answers: formattedAnswers,
      });

      toast.success("Test submitted successfully!");
      completeCourse(courseId);

      // Reset test state
      setTestStarted(false);
      setTimeLeft(0);

      // Navigate back to test selection
      navigate(`/test-selection/${courseId}`);
    } catch (error) {
      toast.error("Failed to submit test. Please try again.");
    }
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with course name and back button */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
      </div>

      {/* Test content section - full width and centered */}
      <div className="w-full rounded-lg shadow-lg p-5 md:p-8 bg-white dark:bg-gray-800">
        {currentTest ? (
          testStarted || isReviewing ? (
            <div className="space-y-6">
              {/* Test header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {currentTest.lectureTitle}
                </h2>
                {!isReviewing && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Timer className="h-5 w-5" />
                    <span className="font-medium">
                      {formatTime(timeLeft)} remaining
                    </span>
                  </div>
                )}
                {isReviewing && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>

              {/* Add visibility monitoring when test is active and not in review mode */}
              {!isReviewing && <Visibility testId={currentTest._id} />}

              {/* Test instructions */}
              {currentTest.testInstructions && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Instructions:</h3>
                  <p>{currentTest.testInstructions}</p>
                </div>
              )}

              {/* Student info */}
              <div className="border-t border-b py-3 flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <Label className="text-sm text-gray-500">Student Name</Label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {currentTest.questions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-md ${
                      isReviewing ? "border-gray-300" : ""
                    }`}
                  >
                    <h3 className="font-bold mb-3">Question {index + 1}:</h3>
                    <p className="mb-4">{question.questionText}</p>

                    {question.answerType === "text" && (
                      <div>
                        <Label htmlFor={`question-${index}`}>
                          Your Answer:
                        </Label>
                        <Textarea
                          id={`question-${index}`}
                          value={answers[`question_${index}`] || ""}
                          onChange={(e) =>
                            handleAnswerChange(index, e.target.value)
                          }
                          placeholder={
                            isReviewing
                              ? "No answer provided"
                              : "Type your answer here..."
                          }
                          rows={4}
                          disabled={isReviewing}
                          className={isReviewing ? "bg-gray-50" : ""}
                        />
                      </div>
                    )}

                    {question.answerType === "singleChoice" && (
                      <RadioGroup
                        value={answers[`question_${index}`] || ""}
                        onValueChange={(value) =>
                          handleAnswerChange(index, value)
                        }
                        disabled={isReviewing}
                      >
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option}
                                id={`q${index}-option${optionIndex}`}
                                disabled={isReviewing}
                              />
                              <Label
                                htmlFor={`q${index}-option${optionIndex}`}
                                className={
                                  isReviewing &&
                                  answers[`question_${index}`] === option
                                    ? "font-medium text-green-700"
                                    : ""
                                }
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}

                    {question.answerType === "multipleChoice" && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`q${index}-option${optionIndex}`}
                              checked={(
                                answers[`question_${index}`] || []
                              ).includes(option)}
                              onCheckedChange={() =>
                                handleAnswerChange(index, option, true)
                              }
                              disabled={isReviewing}
                            />
                            <Label
                              htmlFor={`q${index}-option${optionIndex}`}
                              className={
                                isReviewing &&
                                (answers[`question_${index}`] || []).includes(
                                  option
                                )
                                  ? "font-medium text-green-700"
                                  : ""
                              }
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit button (only shown when not reviewing) */}
              {!isReviewing && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className="mt-4 px-8"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <ClipboardCheck className="h-5 w-5 mr-2" />
                        Submit Test
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Show test overview before starting the test */
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {currentTest.lectureTitle}
              </h2>
              {currentTest.testDuration && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Duration: {currentTest.testDuration} minutes
                </p>
              )}
              {currentTest.testInstructions && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md mb-6 max-w-lg">
                  <h3 className="font-medium mb-2">Instructions:</h3>
                  <p className="text-sm">{currentTest.testInstructions}</p>
                </div>
              )}
              <p className="text-center mb-6 max-w-md">
                This test contains {currentTest.questions?.length || 0}{" "}
                questions. Make sure you are ready before starting the test.
              </p>
              <Button
                onClick={() => handleStartTest(currentTest)}
                size="lg"
                className="px-8"
              >
                Start Test
              </Button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-20 w-20 text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold mb-4">Test not found</h2>
            <p className="text-gray-500 text-center mb-8 max-w-md mx-auto">
              Either no test was selected, or there was an error loading the
              test content. Please go back to the test selection page and try
              again.
            </p>
            <Button onClick={handleBack} size="lg">
              Go to Test Selection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestProgress;
