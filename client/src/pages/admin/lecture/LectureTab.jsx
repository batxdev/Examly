import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:8080/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const [isTest, setIsTest] = useState(false);
  const [testDuration, setTestDuration] = useState(60); // default 60 minutes
  const [testInstructions, setTestInstructions] = useState("");
  const [questions, setQuestions] = useState([]);
  const params = useParams();
  const { courseId, lectureId } = params;

  const { data: lectureData } = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo(lecture.videoInfo);
      setIsTest(lecture.isTest || false);
      setTestDuration(lecture.testDuration || 60);
      setTestInstructions(lecture.testInstructions || "");
      setQuestions(lecture.questions || []);
    }
  }, [lecture]);

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();
  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          console.log(res);
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    if (isTest && questions.length === 0) {
      toast.error("Please add at least one question to the test");
      return;
    }

    await edtiLecture({
      lectureTitle,
      videoInfo: !isTest ? uploadVideInfo : null,
      isPreviewFree: isFree,
      courseId,
      lectureId,
      isTest,
      testDuration: isTest ? testDuration : null,
      testInstructions: isTest ? testInstructions : null,
      questions: isTest ? questions : [],
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  };

  // Question management functions
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        answerType: "text",
        options: ["", ""],
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message);
    }
  }, [removeSuccess]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Test</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disbaled={removeLoading}
            variant="destructive"
            onClick={removeLectureHandler}
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Remove Test"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>

        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isTest} onCheckedChange={setIsTest} id="test-mode" />
          <Label htmlFor="test-mode">
            This is a test 
          </Label>
        </div>

        <Tabs
          defaultValue={isTest ? "test" : "video"}
          value={isTest ? "test" : "video"}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="test" disabled={!isTest}>
              Test Configuration
            </TabsTrigger>
          </TabsList>


          <TabsContent value="test">
            <div className="space-y-4">
              <div>
                <Label>Test Duration (minutes)</Label>
                <Input
                  type="number"
                  value={testDuration}
                  onChange={(e) => setTestDuration(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div>
                <Label>Test Instructions</Label>
                <Textarea
                  value={testInstructions}
                  onChange={(e) => setTestInstructions(e.target.value)}
                  placeholder="Enter instructions for students taking the test"
                  rows={3}
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Questions</Label>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    size="sm"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p>
                      No questions added. Click "Add Question" to create your
                      first question.
                    </p>
                  </div>
                ) : (
                  questions.map((question, qIndex) => (
                    <Card key={qIndex} className="p-4 border">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Question {qIndex + 1}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.questionText}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "questionText",
                                e.target.value
                              )
                            }
                            placeholder="Enter your question"
                          />
                        </div>

                        <div>
                          <Label>Answer Type</Label>
                          <Select
                            value={question.answerType}
                            onValueChange={(value) =>
                              updateQuestion(qIndex, "answerType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select answer type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text (Essay)</SelectItem>
                              <SelectItem value="singleChoice">
                                Single Choice
                              </SelectItem>
                              <SelectItem value="multipleChoice">
                                Multiple Choice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(question.answerType === "singleChoice" ||
                          question.answerType === "multipleChoice") && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(qIndex, oIndex, e.target.value)
                                  }
                                  placeholder={`Option ${oIndex + 1}`}
                                  className="flex-1"
                                />
                                {question.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                              className="mt-2"
                            >
                              Add Option
                            </Button>
                          </div>
                        )}

                        {question.answerType === "singleChoice" && (
                          <div>
                            <Label>Correct Answer (Optional)</Label>
                            <Select
                              value={question.correctAnswer}
                              onValueChange={(value) =>
                                updateQuestion(qIndex, "correctAnswer", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">
                                  No correct answer (ungraded)
                                </SelectItem>
                                {question.options.map((option, oIndex) => (
                                  <SelectItem key={oIndex} value={option}>
                                    {option || `Option ${oIndex + 1}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Button disabled={isLoading} onClick={editLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Update Test"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
