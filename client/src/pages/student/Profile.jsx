import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar } from "lucide-react";
import React, { useState } from "react";
import { Course } from "./Course";
import { useNavigate } from "react-router-dom";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import { useEffect } from "react";
import { toast } from "sonner";

export const Profile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const { data, isLoading, refetch } = useLoadUserQuery();
  const [
    updateUser,
    {
      data: updateUserData,
      isLoading: updateLoading,
      isError,
      error,
      isSuccess,
    },
  ] = useUpdateUserMutation();

  // Handle setting initial name value when data loads
  useEffect(() => {
    if (data?.user?.name) {
      setName(data.user.name);
    }
  }, [data]);

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }
    await updateUser(formData);
  };

  const handleAttendanceClick = () => {
    navigate("/student/attendance");
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success(updateUserData.message || "Profile updated successfully");
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  }, [updateUserData, error, isSuccess, isError]);

  // Handle error state
  if (error || !data || !data.user) {
    console.error("Error loading profile:", error);
    return (
      <div className="max-w-4xl mx-auto px-4 my-24 text-center">
        <h1 className="text-xl text-red-500">Error loading profile data</h1>
        <p>Please refresh the page or try logging in again</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) return <h1>Profile Loading...</h1>;

  // Now that we've safely checked for data, we can access user
  const { user } = data;
  const isInstructor = user.role === "Instructor";

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt="Profile"
            />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>

          {/* Attendance button for students and instructors */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 mt-2"
            onClick={handleAttendanceClick}
          >
            <Calendar className="h-4 w-4" />
            View Attendance
          </Button>
        </div>
        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Name:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {" "}
                {user.name}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Email:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {" "}
                {user.email}
              </span>
            </h1>
          </div>{" "}
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              Role:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {" "}
                {user.role.toUpperCase()}
              </span>
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className={"mt-2"}>
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make Changes to your Profile here. Click Save When you're done
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <input
                    onChange={onChangeHandler}
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={updateLoading} onClick={updateUserHandler}>
                  {updateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please Wait
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
