import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
  useSubmitTestMutation,
  useStartTestMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const { user } = useSelector((store) => store.auth);

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [startTest] = useStartTestMutation();
  const [submitTest] = useSubmitTestMutation();

  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  useEffect(() => {
    console.log(markCompleteData);

    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  const [currentTest, setCurrentTest] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && testStarted) {
      handleSubmitTest();
    }

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  console.log(data);

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // Filter to get only test lectures
  const tests = courseDetails.lectures.filter((lecture) => lecture.isTest);

  // Check if this is a test-only course (all lectures are tests)
  const isTestOnlyCourse =
    tests.length > 0 && tests.length === courseDetails.lectures.length;

  const isTestCompleted = (testId) => {
    return progress.some((prog) => prog.lectureId === testId && prog.viewed);
  };

  const handleTestProgress = async (testId) => {
    try {
      await updateLectureProgress({ courseId, testId });
      refetch();
    } catch (error) {
      console.error("Failed to update test progress:", error);
    }
  };

  const handleSelectTest = (test) => {
    setCurrentTest(test);
    handleTestProgress(test._id);
  };

  const handleStartTest = async (test) => {
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

    // Mark test as started via API
    try {
      await startTest({ courseId, testId: test._id });
      // No need to mark as viewed yet - we'll do that on submission
      toast.success("Test started successfully");
    } catch (error) {
      toast.error("Failed to start test");
    }
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  const handleAnswerChange = (questionIndex, value, isMultiChoice = false) => {
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

    if (unansweredQuestions.length > 0 && timeLeft > 0) {
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
        answers: formattedAnswers,
      });

      toast.success("Test submitted successfully!");

      // Reset test state
      setTestStarted(false);
      setTimeLeft(0);
      setCurrentTest(null);
      refetch(); // Refetch to update the UI with completed status
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
    <div className="max-w-7xl mx-auto p-4">
      {/* Display course name  */}
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{courseTitle}</h1>
          {isTestOnlyCourse && (
            <div className="mt-1 text-sm text-green-600 font-medium">
              Free Test Course - No Purchase Required
            </div>
          )}
        </div>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>{" "}
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Test section - replaces Video section */}
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          {testStarted ? (
            <div className="space-y-6">
              {/* Test header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {currentTest.lectureTitle}
                </h2>
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="font-medium">
                    Time remaining: {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Test instructions */}
              {currentTest.testInstructions && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Instructions:</h3>
                  <p>{currentTest.testInstructions}</p>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8">
                {currentTest.questions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-md">
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
                          placeholder="Type your answer here..."
                          rows={4}
                        />
                      </div>
                    )}

                    {question.answerType === "singleChoice" && (
                      <RadioGroup
                        value={answers[`question_${index}`] || ""}
                        onValueChange={(value) =>
                          handleAnswerChange(index, value)
                        }
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
                              />
                              <Label htmlFor={`q${index}-option${optionIndex}`}>
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
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAnswerChange(index, option, true);
                                } else {
                                  handleAnswerChange(index, option, true);
                                }
                              }}
                            />
                            <Label htmlFor={`q${index}-option${optionIndex}`}>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmitTest} className="w-full mt-6">
                Submit Test
              </Button>
            </div>
          ) : currentTest ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">
                {currentTest.lectureTitle}
              </h2>
              {currentTest.testDuration && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Duration: {currentTest.testDuration} minutes
                </p>
              )}
              <p className="text-center mb-6 max-w-md">
                This test contains {currentTest.questions?.length || 0}{" "}
                questions. Make sure you are ready before starting the test.
              </p>
              <Button onClick={() => handleStartTest(currentTest)}>
                Start Test
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-center text-gray-500">
                Select a test from the sidebar to begin.
              </p>
            </div>
          )}
        </div>

        {/* Tests Sidebar  */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Tests</h2>
          <div className="flex-1 overflow-y-auto">
            {tests.length > 0 ? (
              tests.map((test) => (
                <Card
                  key={test._id}
                  className={`mb-3 hover:cursor-pointer transition transform ${
                    test._id === currentTest?._id
                      ? "bg-gray-200 dark:dark:bg-gray-800"
                      : ""
                  } `}
                  onClick={() => handleSelectTest(test)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      {isTestCompleted(test._id) ? (
                        <CheckCircle2
                          size={24}
                          className="text-green-500 mr-2"
                        />
                      ) : (
                        <FileText size={24} className="text-gray-500 mr-2" />
                      )}
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {test.lectureTitle}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {test.questions?.length || 0} questions •{" "}
                          {test.testDuration || 0} mins
                        </p>
                      </div>
                    </div>
                    {isTestCompleted(test._id) && (
                      <Badge
                        variant={"outline"}
                        className="bg-green-200 text-green-600"
                      >
                        Completed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4">
                No tests available for this course.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
