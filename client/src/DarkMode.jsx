import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Button } from "./components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./components/ThemeProvider";

const DarkMode = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full w-9 h-9 p-0 transition-all duration-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <div className="relative w-full h-full">
        <Sun
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 text-yellow-500 ${
            theme === "dark"
              ? "opacity-0 scale-0 rotate-45"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />
        <Moon
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300 text-indigo-400 ${
            theme === "light"
              ? "opacity-0 scale-0 rotate-45"
              : "opacity-100 scale-100 rotate-0"
          }`}
        />
      </div>
    </Button>
  );
};

export default DarkMode;
