import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useLoadUserQuery } from "@/features/api/authApi";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

export const Attendance = () => {
  const { data, isLoading } = useLoadUserQuery();
  const [date, setDate] = useState(new Date());
  
  // This would be the actual attendance API call
  // const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceQuery(date);

  // Sample attendance data - this would come from your API
  const attendanceData = {
    present: 15,
    absent: 3,
    total: 18,
    daysPresent: ["2025-04-01", "2025-04-02", "2025-04-03", "2025-04-05", "2025-04-08", "2025-04-09"],
    daysAbsent: ["2025-04-04", "2025-04-07", "2025-04-10"],
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (!data || !data.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 my-24 text-center">
        <h1 className="text-xl text-red-500">Error loading profile data</h1>
        <p>Please refresh the page or try logging in again</p>
      </div>
    );
  }

  const { user } = data;

  // Function to check if date is present, absent, or neither
  const getDayStatus = (date) => {
    const dateString = date.toISOString().split('T')[0];
    if (attendanceData.daysPresent.includes(dateString)) return "present";
    if (attendanceData.daysAbsent.includes(dateString)) return "absent";
    return "none";
  };

  // Function to format the date as a readable string
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 md:px-6">
      <h1 className="font-bold text-2xl mb-6">ATTENDANCE RECORD</h1>
      
      {/* User Profile Section */}
      <Card className="mb-6 shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.role.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
      </Card>
      
      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-md bg-green-50 dark:bg-green-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.present}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-red-50 dark:bg-red-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceData.absent}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md bg-blue-50 dark:bg-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((attendanceData.present / attendanceData.total) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Calendar and Date Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Attendance Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                present: (date) => getDayStatus(date) === "present",
                absent: (date) => getDayStatus(date) === "absent",
              }}
              modifiersClassNames={{
                present: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Selected Date Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{formatDate(date)}</p>
            
            {getDayStatus(date) === "present" ? (
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-md">
                <h3 className="font-medium text-green-800 dark:text-green-200">Present</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  You were present on this day.
                </p>
              </div>
            ) : getDayStatus(date) === "absent" ? (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-md">
                <h3 className="font-medium text-red-800 dark:text-red-200">Absent</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  You were absent on this day.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium">No Record</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No attendance data available for this date.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

