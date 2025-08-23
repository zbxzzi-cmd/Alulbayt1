import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { BookOpen, Users, Scale, Clock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [content, setContent] = useState({
    landing_hero_title: "Welcome to Ahlulbayt Studies",
    landing_hero_subtitle: "Comprehensive Islamic Education Platform",
    enroll_button: "Enroll Now",
    overview_button: "Program Overview"
  });

  // Sample programs data - in real app this would come from backend
  const programs = [
    {
      id: 1,
      name: "Quran Studies",
      tagline: "Deep dive into the Holy Quran with expert guidance",
      description: "Comprehensive study of the Quran including recitation, interpretation (Tafseer), and memorization (Hifz). Our expert teachers guide students through proper pronunciation, understanding of verses, and practical application in daily life.",
      image: "https://images.unsplash.com/photo-1694758375810-2d7c7bc3e84e",
      icon: BookOpen,
      type: "informational" // Type A - Informational/Cool Cards
    },
    {
      id: 2,
      name: "Hadith Studies", 
      tagline: "Learn the teachings and traditions of Prophet Muhammad (PBUH)",
      description: "Study the authentic sayings, actions, and approvals of Prophet Muhammad (PBUH). Learn to identify authentic narrations, understand their contexts, and apply their teachings in contemporary Islamic life.",
      image: "https://images.unsplash.com/photo-1714746643489-a893ada081f5",
      icon: Users,
      type: "interactive" // Type B - Interactive/Attention Cards
    },
    {
      id: 3,
      name: "Islamic Jurisprudence (Fiqh)",
      tagline: "Master Islamic law and jurisprudence principles",
      description: "Comprehensive study of Islamic legal theory and practice. Learn the principles of Islamic jurisprudence, comparative Fiqh, and how to derive rulings from primary sources according to Shia Ithna Ashari methodology.",
      image: "https://images.unsplash.com/photo-1626553261684-68f25328988f",
      icon: Scale,
      type: "warning" // Type C - Warning/Highlight Cards
    },
    {
      id: 4,
      name: "Islamic History",
      tagline: "Explore the rich history of Islam and its civilizations",
      description: "Journey through Islamic history from the time of Prophet Muhammad (PBUH) to the present day. Study the lives of the Imams, Islamic golden age, and the development of Islamic societies and cultures.",
      image: "https://images.unsplash.com/photo-1660674807706-49e85f121c59",
      icon: Clock,
      type: "success" // Type D - Success/Positive Cards
    }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const titleResponse = await axios.get(`${API}/content/landing_hero_title`);
        const subtitleResponse = await axios.get(`${API}/content/landing_hero_subtitle`);
        const enrollBtnResponse = await axios.get(`${API}/content/enroll_button`);
        const overviewBtnResponse = await axios.get(`${API}/content/overview_button`);
        
        setContent({
          landing_hero_title: titleResponse.data.content,
          landing_hero_subtitle: subtitleResponse.data.content,
          enroll_button: enrollBtnResponse.data.content,
          overview_button: overviewBtnResponse.data.content
        });
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchContent();
  }, []);

  const handleEnrollClick = (programName) => {
    // In next step, this will redirect to login/signup
    alert(`Enrollment for ${programName} - Login/Signup will be implemented in next step`);
  };

  const getCardClassName = (type) => {
    const baseClasses = "program-card base-card";
    switch (type) {
      case "informational":
        return `${baseClasses} card-type-a`;
      case "interactive": 
        return `${baseClasses} card-type-b`;
      case "warning":
        return `${baseClasses} card-type-c`;
      case "success":
        return `${baseClasses} card-type-d`;
      default:
        return `${baseClasses} card-type-a`;
    }
  };

  return (
    <div className="app-background">
      {/* Header */}
      <header className="navigation-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold header-text">Ahlulbayt Studies</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold header-text mb-6">
            {content.landing_hero_title}
          </h1>
          <p className="text-xl body-text mb-8 max-w-2xl mx-auto">
            {content.landing_hero_subtitle}
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="main-content-area mb-12 text-center">
            <h2 className="text-3xl font-bold header-text mb-4">
              Our Programs
            </h2>
            <p className="body-text">
              Choose from our comprehensive Islamic education programs designed for all levels of learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {programs.map((program) => {
              const IconComponent = program.icon;
              return (
                <Card 
                  key={program.id} 
                  className={getCardClassName(program.type)}
                >
                  <div className="relative">
                    <img 
                      src={program.image} 
                      alt={program.name}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3">
                      <IconComponent className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-bold header-text">
                      {program.name}
                    </CardTitle>
                    <CardDescription className="body-text text-base">
                      {program.tagline}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="btn-secondary flex-1"
                          >
                            {content.overview_button}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="modal-content max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl header-text">{program.name}</DialogTitle>
                            <DialogDescription className="body-text text-base pt-2">
                              {program.description}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        onClick={() => handleEnrollClick(program.name)}
                        className="btn-primary flex-1"
                      >
                        {content.enroll_button}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="stats-widget stats-type-a">
              <div className="text-3xl font-bold header-text mb-2">4</div>
              <div className="body-text">Programs Available</div>
            </div>
            <div className="stats-widget stats-type-b">
              <div className="text-3xl font-bold header-text mb-2">50+</div>
              <div className="body-text">Students Enrolled</div>
            </div>
            <div className="stats-widget stats-type-c">
              <div className="text-3xl font-bold header-text mb-2">10+</div>
              <div className="body-text">Expert Teachers</div>
            </div>
            <div className="stats-widget stats-type-d">
              <div className="text-3xl font-bold header-text mb-2">95%</div>
              <div className="body-text">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-content-area mx-4 sm:mx-6 lg:mx-8 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold header-text">Ahlulbayt Studies</h3>
            </div>
            <p className="body-text">
              © 2025 Ahlulbayt Studies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;