import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";
import { Clock, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Course = ({ course }) => {
  return (
    <Card className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative">
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 text-white px-2.5 py-1 text-xs font-medium">
          {course.courseLevel}
        </Badge>
      </div>

      <CardContent className="px-5 py-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2">
          {course.courseTitle}
        </h3>

        <div className="mt-2 mb-3 flex items-center gap-4">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{course.courseDuration || "Self-paced"}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Users className="h-4 w-4 mr-1" />
            <span>{course.numberOfStudents || 0} students</span>
          </div>
        </div>

        <div className="flex items-center mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
            <AvatarImage
              src={course.creator?.photoUrl || "https://github.com/shadcn.png"}
              alt={course.creator?.name || "Instructor"}
            />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              {course.creator?.name?.charAt(0) || "I"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2 flex-grow">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {course.creator?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Instructor
            </p>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {course.isFree ? (
              <span className="text-green-600">Free</span>
            ) : (
              <>₹{course.coursePrice}</>
            )}
          </div>
        </div>
      </CardContent>

      <Link to={`/course-detail/${course._id}`} className="block mx-5 mb-5">
        <Button
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0"
          variant="default"
          size="sm"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          View Test
        </Button>
      </Link>
    </Card>
  );
};
