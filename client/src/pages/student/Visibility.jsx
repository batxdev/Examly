import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useReportCheatingAttemptMutation } from "@/features/api/cheatingApi";
import { useSelector } from "react-redux";

const Visibility = ({ testId }) => {
  const [warnings, setWarnings] = useState(3);
  const navigate = useNavigate();
  const [reportCheatingAttempt] = useReportCheatingAttemptMutation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prevWarnings) => {
          const newWarnings = prevWarnings - 1;
          if (newWarnings <= 0) {
            handleCheatingAttempt();
            return 0;
          }
          toast.error(
            `Warning! ${newWarnings} warnings left. Please stay on the test page.`
          );
          return newWarnings;
        });
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
      setWarnings((prevWarnings) => {
        const newWarnings = prevWarnings - 1;
        if (newWarnings <= 0) {
          handleCheatingAttempt();
          return 0;
        }
        toast.error(
          `Warning! ${newWarnings} warnings left. Copying is not allowed.`
        );
        return newWarnings;
      });
    };

    const handleCheatingAttempt = async () => {
      try {
        toast.error("You have exceeded the maximum number of warnings!", {
          duration: 3000,
        });

        toast.error(
          "Your test session is being terminated and this incident will be reported.",
          { duration: 3000 }
        );

        if (user && user.email) {
          const result = await reportCheatingAttempt({
            studentEmail: user.email,
            testId: testId,
          }).unwrap();

          console.log("Cheating report response:", result);

          setTimeout(() => {
            toast.error("Redirecting to home page...");
            navigate("/");
          }, 2000);
        } else {
          console.error("User email not available");
          toast.error(
            "Error: Unable to identify user. Redirecting to home page..."
          );
          navigate("/");
        }
      } catch (error) {
        console.error("Error logging cheating attempt:", error);
        toast.error("An error occurred. Redirecting to home page...");
        navigate("/");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
    };
  }, [testId, navigate, reportCheatingAttempt, user]);

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
      Warnings left: {warnings}
    </div>
  );
};

export default Visibility;
