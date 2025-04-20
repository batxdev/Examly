import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, GraduationCap, Award, Users } from "lucide-react";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

        {/* Floating Blobs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative pt-20 pb-24 px-4 sm:pt-32 sm:pb-40">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Discover & Master <span className="text-yellow-300">Learning</span>{" "}
            with Examly
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Your gateway to interactive learning, comprehensive tests, and
            skills that matter in today's world
          </p>

          {/* Search form */}
          <form
            onSubmit={searchHandler}
            className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl overflow-hidden max-w-xl mx-auto mb-12 focus-within:ring-2 focus-within:ring-yellow-300 transition-all duration-300"
          >
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for tests..."
              className="flex-grow border-none bg-transparent text-white placeholder-white/60 focus-visible:ring-0 px-6 py-3 text-lg"
            />
            <Button
              type="submit"
              className="bg-white text-indigo-700 hover:text-indigo-800 hover:bg-yellow-100 px-6 py-6 rounded-r-full transition-colors"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </form>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 text-white">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Interactive Tests</h3>
              <p className="text-white/80">
                Learn with interactive content designed for maximum engagement
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Instructors</h3>
              <p className="text-white/80">
                Learn from industry professionals with real-world expertise
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Certification</h3>
              <p className="text-white/80">
                Earn recognized certificates to boost your professional profile
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate(`/course/search?query`)}
            className="mt-10 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 text-lg font-medium rounded-full px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            size="lg"
          >
            <Users className="mr-2 h-5 w-5" />
            Explore All Tests
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
