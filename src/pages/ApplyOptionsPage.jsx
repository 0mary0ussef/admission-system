import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ApplyOptionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-[#ef3131] hover:underline mb-6 md:mb-8 font-medium"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>

          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
              Choose Your Application Method
            </h1>
            <div className="w-24 h-1 bg-[#ef3131] mx-auto mb-4 md:mb-6"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Select the application method that works best for you. All options
              will guide you through our admission process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* In-Person Application */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white h-full flex flex-col">
              <CardHeader className="text-center pb-4 md:pb-6 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg
                    className="h-8 w-8 md:h-10 md:w-10 text-[#ef3131]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  Visit Our School
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6 flex-grow flex flex-col">
                <p className="text-gray-600 leading-relaxed font-light text-sm md:text-base flex-grow">
                  Come to our campus for a complete enrollment experience. Our
                  admission team will guide you through the entire process and
                  answer all your questions in person.
                </p>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Meet with our admission counselors
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Complete all paperwork on-site
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Tour our facilities and labs
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-xs md:text-sm text-gray-600">
                  <p className="font-medium mb-2">Office Hours:</p>
                  <p>Sunday - Thursday: 8:00 AM - 4:00 PM</p>
                  <p>Friday - Saturday: Closed</p>
                </div>

                <div className="mt-6">
                  <Link to="/contact">
                    <Button className="w-full bg-[#ef3131] hover:bg-red-600 text-sm md:text-lg py-2 md:py-3 rounded-full font-semibold">
                      Get Directions & Contact Info
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Online Application */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white h-full flex flex-col">
              <CardHeader className="text-center pb-4 md:pb-6 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg
                    className="h-8 w-8 md:h-10 md:w-10 text-[#ef3131]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  Apply Online
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6 flex-grow flex flex-col">
                <p className="text-gray-600 leading-relaxed font-light text-sm md:text-base flex-grow">
                  Start your application process online if you're already
                  registered with us. Verify your information and proceed
                  directly to the entrance examination.
                </p>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Verify with your National ID
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Take the entrance exam online
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Schedule your interview
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-xs md:text-sm text-blue-800">
                  <p className="font-medium mb-1">Note:</p>
                  <p>
                    This option is only available for students who have already
                    enrolled their basic information at our school.
                  </p>
                </div>

                <div className="mt-6">
                  <Link to="/verify-student">
                    <Button className="w-full bg-[#ef3131] hover:bg-red-600 text-sm md:text-lg py-2 md:py-3 rounded-full font-semibold">
                      Verify & Start Application
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Application */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white h-full flex flex-col">
              <CardHeader className="text-center pb-4 md:pb-6 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ef3131]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg
                    className="h-8 w-8 md:h-10 md:w-10 text-[#ef3131]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  I am a Teacher
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6 flex-grow flex flex-col">
                <p className="text-gray-600 leading-relaxed font-light text-sm md:text-base flex-grow">
                  Access the teacher portal to register student information and
                  manage the admission process for your students.
                </p>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Register student information
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Manage admission documents
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <svg
                      className="h-4 w-4 md:h-5 md:w-5 text-[#ef3131] mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      Track student progress
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 text-xs md:text-sm text-green-800">
                  <p className="font-medium mb-1">Teacher Access:</p>
                  <p>
                    Login with your teacher credentials to access the student
                    registration system.
                  </p>
                </div>

                <div className="mt-6">
                  <Link to="/teacher/login">
                    <Button className="w-full bg-[#ef3131] hover:bg-red-600 text-sm md:text-lg py-2 md:py-3 rounded-full font-semibold">
                      Teacher Login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 md:mt-12 text-center">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  Need Help Choosing?
                </h3>
                <p className="text-gray-600 mb-4 md:mb-6 font-light text-sm md:text-base">
                  If you're unsure which option is right for you, or if you have
                  any questions about the admission process, our team is here to
                  help.
                </p>
                <Link to="/contact">
                  <Button
                    variant="outline"
                    className="border-[#ef3131] text-[#ef3131] hover:bg-[#ef3131] hover:text-white bg-transparent"
                  >
                    Contact Admission Team
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ApplyOptionsPage;
