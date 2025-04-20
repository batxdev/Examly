import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, ClipboardList, Lock, PlayCircle } from "lucide-react";
import React from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h>Failed to load course details</h>;

  const { course, purchased } = data;
  console.log(purchased);

  // Check if this course contains tests (at least one lecture with isTest=true)
  const hasTests = course?.lectures?.some((lecture) => lecture.isTest);

  const handleContinueCourse = () => {
    if (hasTests) {
      // Navigate to test selection page instead of directly to test progress
      navigate(`/test-selection/${courseId}`);
    } else if (purchased) {
      // Only check purchase for regular video courses
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents.length}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
          <Card>
            <CardHeader>
              <CardTitle>
                {hasTests ? "Test Content" : "Course Content"}
              </CardTitle>
              <CardDescription>
                {course.lectures.length} {hasTests ? "Tests" : "Lectures"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {purchased || lecture.isTest ? (
                      lecture.isTest ? (
                        <ClipboardList size={14} />
                      ) : (
                        <PlayCircle size={14} />
                      )
                    ) : (
                      <Lock size={14} />
                    )}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              {!hasTests && course.lectures[0]?.videoUrl ? (
                <div className="w-full aspect-video mb-4">
                  <ReactPlayer
                    width="100%"
                    height={"100%"}
                    url={course.lectures[0].videoUrl}
                    controls={true}
                  />
                </div>
              ) : (
                <div className="w-full aspect-video mb-4 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ClipboardList className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <h1>{hasTests ? "Test Package" : "Course Package"}</h1>
              <Separator className="my-2" />
              {!hasTests && (
                <h1 className="text-lg md:text-xl font-semibold">
                  Course Price
                </h1>
              )}
              {hasTests && (
                <div className="text-green-600 font-semibold">Free Access</div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {hasTests ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Access Tests
                </Button>
              ) : purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
