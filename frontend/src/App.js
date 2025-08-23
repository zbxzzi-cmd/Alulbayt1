import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { BookOpen, Users, Scale, Clock, Edit3 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [content, setContent] = useState({
    landing_hero_title: "Welcome to Ahlulbayt Studies",
    landing_hero_subtitle: "Comprehensive Islamic Education Platform",
    enroll_button: "Enroll Now",
    overview_button: "Program Overview"
  });

  // Sample programs data - ALL CONTENT IS EDITABLE
  const programs = [
    {
      id: 1,
      name: "Quran Studies", // EDITABLE
      tagline: "Deep dive into the Holy Quran with expert guidance", // EDITABLE
      description: "Comprehensive study of the Quran including recitation, interpretation (Tafseer), and memorization (Hifz). Our expert teachers guide students through proper pronunciation, understanding of verses, and practical application in daily life.", // EDITABLE
      image: "https://images.unsplash.com/photo-1694758375810-2d7c7bc3e84e", // EDITABLE/REPLACEABLE
      icon: BookOpen,
      type: "informational" // Type A - Informational/Cool Cards
    },
    {
      id: 2,
      name: "Hadith Studies", // EDITABLE
      tagline: "Learn the teachings and traditions of Prophet Muhammad (PBUH)", // EDITABLE
      description: "Study the authentic sayings, actions, and approvals of Prophet Muhammad (PBUH). Learn to identify authentic narrations, understand their contexts, and apply their teachings in contemporary Islamic life.", // EDITABLE
      image: "https://images.unsplash.com/photo-1714746643489-a893ada081f5", // EDITABLE/REPLACEABLE
      icon: Users,
      type: "interactive" // Type B - Interactive/Attention Cards
    },
    {
      id: 3,
      name: "Islamic Jurisprudence (Fiqh)", // EDITABLE
      tagline: "Master Islamic law and jurisprudence principles", // EDITABLE
      description: "Comprehensive study of Islamic legal theory and practice. Learn the principles of Islamic jurisprudence, comparative Fiqh, and how to derive rulings from primary sources according to Shia Ithna Ashari methodology.", // EDITABLE
      image: "https://images.unsplash.com/photo-1626553261684-68f25328988f", // EDITABLE/REPLACEABLE
      icon: Scale,
      type: "warning" // Type C - Warning/Highlight Cards
    },
    {
      id: 4,
      name: "Islamic History", // EDITABLE
      tagline: "Explore the rich history of Islam and its civilizations", // EDITABLE
      description: "Journey through Islamic history from the time of Prophet Muhammad (PBUH) to the present day. Study the lives of the Imams, Islamic golden age, and the development of Islamic societies and cultures.", // EDITABLE
      image: "https://images.unsplash.com/photo-1660674807706-49e85f121c59", // EDITABLE/REPLACEABLE
      icon: Clock,
      type: "success" // Type D - Success/Positive Cards
    }
  ];

  // EDITABLE STATS DATA
  const statsData = [
    { number: "4", label: "Programs Available", type: "a" }, // EDITABLE
    { number: "50+", label: "Students Enrolled", type: "b" }, // EDITABLE
    { number: "10+", label: "Expert Teachers", type: "c" }, // EDITABLE
    { number: "95%", label: "Completion Rate", type: "d" } // EDITABLE
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

  const handleEditClick = (elementType, elementId) => {
    alert(`Edit ${elementType}: ${elementId}\n\nIn a real CMS, this would open an editor for:\n- Text content\n- Images\n- Colors\n- Layout options`);
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

  const getStatsClassName = (type) => {
    return `stats-widget stats-type-${type}`;
  };

  return (
    <div className="app-background">
      {/* Header - Direct on Blue Background */}
      <header className="navigation-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-100 flex items-center justify-center editable-logo"
                onClick={() => handleEditClick('Logo', 'main-logo')}
                title="Click to edit logo"
              >
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h1 
                className="text-2xl font-bold header-text-light editable-text"
                onClick={() => handleEditClick('Site Title', 'site-title')}
                title="Click to edit site title"
              >
                Ahlulbayt Studies
              </h1>
            </div>
            <div className="text-white/70 text-sm">
              <Edit3 className="h-4 w-4 inline mr-1" />
              Hover over content to see editable areas
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Direct on Blue Background */}
      <section className="hero-section">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-5xl font-bold header-text-light mb-6 editable-text"
            onClick={() => handleEditClick('Hero Title', 'hero-title')}
            title="Click to edit hero title"
          >
            {content.landing_hero_title}
          </h1>
          <p 
            className="text-xl body-text-light mb-8 max-w-2xl mx-auto editable-text"
            onClick={() => handleEditClick('Hero Subtitle', 'hero-subtitle')}
            title="Click to edit hero subtitle"
          >
            {content.landing_hero_subtitle}
          </p>
        </div>
      </section>

      {/* Programs Section - Enhanced White Background with Increased Spacing */}
      <section className="main-content-area hero-to-content-spacing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-bold header-text mb-4 editable-text editable-text-dark"
              onClick={() => handleEditClick('Section Title', 'programs-title')}
              title="Click to edit section title"
            >
              Our Programs
            </h2>
            <p 
              className="body-text editable-text editable-text-dark"
              onClick={() => handleEditClick('Section Description', 'programs-desc')}
              title="Click to edit section description"
            >
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
                      className="w-full h-48 object-cover rounded-t-2xl editable-image"
                      onClick={() => handleEditClick('Program Image', `program-image-${program.id}`)}
                      title="Click to replace image"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3">
                      <IconComponent className="h-6 w-6 text-gray-700" />
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle 
                      className="text-2xl font-bold header-text editable-text editable-text-dark"
                      onClick={() => handleEditClick('Program Name', `program-name-${program.id}`)}
                      title="Click to edit program name"
                    >
                      {program.name}
                    </CardTitle>
                    <CardDescription 
                      className="body-text text-base editable-text editable-text-dark"
                      onClick={() => handleEditClick('Program Tagline', `program-tagline-${program.id}`)}
                      title="Click to edit program tagline"
                    >
                      {program.tagline}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="btn-secondary flex-1 editable-text editable-text-dark"
                            title="Click to edit button text"
                          >
                            {content.overview_button}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="modal-content max-w-2xl">
                          <DialogHeader>
                            <DialogTitle 
                              className="text-2xl header-text editable-text editable-text-dark"
                              onClick={() => handleEditClick('Modal Title', `modal-title-${program.id}`)}
                              title="Click to edit modal title"
                            >
                              {program.name}
                            </DialogTitle>
                            <DialogDescription 
                              className="body-text text-base pt-2 editable-text editable-text-dark"
                              onClick={() => handleEditClick('Program Description', `program-desc-${program.id}`)}
                              title="Click to edit program description"
                            >
                              {program.description}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        onClick={() => handleEnrollClick(program.name)}
                        className="btn-primary flex-1 editable-text"
                        title="Click to edit button text"
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

      {/* Stats Section - Enhanced White Background */}
      <section className="main-content-area">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 
              className="text-3xl font-bold header-text mb-4 editable-text editable-text-dark"
              onClick={() => handleEditClick('Section Title', 'impact-title')}
              title="Click to edit section title"
            >
              Our Impact
            </h2>
            <p 
              className="body-text editable-text editable-text-dark"
              onClick={() => handleEditClick('Section Description', 'impact-desc')}
              title="Click to edit section description"
            >
              Building a strong community of Islamic scholars and learners
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className={getStatsClassName(stat.type)}>
                <div 
                  className="text-3xl font-bold header-text mb-2 editable-text editable-text-dark"
                  onClick={() => handleEditClick('Stat Number', `stat-number-${index}`)}
                  title="Click to edit stat number"
                >
                  {stat.number}
                </div>
                <div 
                  className="body-text editable-text editable-text-dark"
                  onClick={() => handleEditClick('Stat Label', `stat-label-${index}`)}
                  title="Click to edit stat label"
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Enhanced White Background */}
      <footer className="footer-content mx-6 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center editable-logo"
                onClick={() => handleEditClick('Footer Logo', 'footer-logo')}
                title="Click to edit footer logo"
              >
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 
                className="text-lg font-semibold header-text editable-text editable-text-dark"
                onClick={() => handleEditClick('Footer Title', 'footer-title')}
                title="Click to edit footer title"
              >
                Ahlulbayt Studies
              </h3>
            </div>
            <p 
              className="body-text editable-text editable-text-dark"
              onClick={() => handleEditClick('Footer Copyright', 'footer-copyright')}
              title="Click to edit footer copyright"
            >
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