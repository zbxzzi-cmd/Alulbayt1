import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { BookOpen, Users, Scale, Clock, Edit3, Type } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [content, setContent] = useState({
    landing_hero_title: "Welcome to Ahlulbayt Studies",
    landing_hero_subtitle: "Comprehensive Islamic Education Platform",
    enroll_button: "Enroll Now",
    overview_button: "Program Overview"
  });

  // Available font options
  const fontOptions = [
    { name: "Inter", class: "font-inter", style: "Modern & Clean" },
    { name: "Playfair Display", class: "font-playfair", style: "Elegant & Serif" },
    { name: "Roboto", class: "font-roboto", style: "Professional" },
    { name: "Open Sans", class: "font-opensans", style: "Friendly & Readable" },
    { name: "Lato", class: "font-lato", style: "Humanist" },
    { name: "Montserrat", class: "font-montserrat", style: "Contemporary" }
  ];

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

  // EDITABLE STATS DATA - REDUCED TO 3 CARDS
  const statsData = [
    { number: "4", label: "Programs Available", type: "a" }, // EDITABLE
    { number: "50+", label: "Students Enrolled", type: "b" }, // EDITABLE
    { number: "95%", label: "Completion Rate", type: "c" } // EDITABLE - REMOVED "Expert Teachers"
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
    let editOptions = "";
    
    if (elementType.includes("text") || elementType === "Hero Title" || elementType === "Section Title") {
      editOptions = `\n\nFont Options Available:
      • Inter - Modern & Clean
      • Playfair Display - Elegant & Serif  
      • Roboto - Professional
      • Open Sans - Friendly & Readable
      • Lato - Humanist
      • Montserrat - Contemporary`;
    }

    alert(`Edit ${elementType}: ${elementId}\n\nIn a real CMS, this would open an editor for:\n- Text content\n- Images\n- Colors\n- Layout options${editOptions}`);
  };

  const handleFontEditClick = (elementType, elementId, currentFont = "Inter") => {
    const fontList = fontOptions.map(font => `• ${font.name} (${font.style})`).join('\n');
    alert(`Font Editor for ${elementType}: ${elementId}
    
Current Font: ${currentFont}

Available Fonts:
${fontList}

Click OK to open font selector...`);
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
      {/* Header - Direct on Cyan Background */}
      <header className="navigation-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-100 flex items-center justify-center editable-logo"
                onClick={() => handleEditClick('Logo', 'main-logo')}
                title="Click to edit logo"
              >
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <h1 
                className="text-2xl font-bold header-text-light editable-text font-inter"
                onClick={() => handleFontEditClick('Site Title', 'site-title', 'Inter')}
                title="Click to edit site title & font"
              >
                Ahlulbayt Studies
              </h1>
            </div>
            <div className="text-teal-700 text-sm flex items-center">
              <Type className="h-4 w-4 inline mr-1" />
              Hover over content to edit text & fonts
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Direct on Cyan Background */}
      <section className="hero-section">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-5xl font-bold header-text-light mb-6 editable-text font-inter"
            onClick={() => handleFontEditClick('Hero Title', 'hero-title', 'Inter')}
            title="Click to edit hero title & font"
          >
            {content.landing_hero_title}
          </h1>
          <p 
            className="text-xl body-text-light mb-8 max-w-2xl mx-auto editable-text font-inter"
            onClick={() => handleFontEditClick('Hero Subtitle', 'hero-subtitle', 'Inter')}
            title="Click to edit hero subtitle & font"
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
              className="text-3xl font-bold header-text mb-4 editable-text editable-text-dark font-inter"
              onClick={() => handleFontEditClick('Section Title', 'programs-title', 'Inter')}
              title="Click to edit section title & font"
            >
              Our Programs
            </h2>
            <p 
              className="body-text editable-text editable-text-dark font-inter"
              onClick={() => handleFontEditClick('Section Description', 'programs-desc', 'Inter')}
              title="Click to edit section description & font"
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
                      className="text-2xl font-bold header-text editable-text editable-text-dark font-inter"
                      onClick={() => handleFontEditClick('Program Name', `program-name-${program.id}`, 'Inter')}
                      title="Click to edit program name & font"
                    >
                      {program.name}
                    </CardTitle>
                    <CardDescription 
                      className="body-text text-base editable-text editable-text-dark font-inter"
                      onClick={() => handleFontEditClick('Program Tagline', `program-tagline-${program.id}`, 'Inter')}
                      title="Click to edit program tagline & font"
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
                            className="btn-secondary flex-1 editable-text font-inter"
                            title="Click to edit button text & font"
                          >
                            {content.overview_button}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="modal-content max-w-2xl">
                          <DialogHeader>
                            <DialogTitle 
                              className="text-2xl header-text editable-text editable-text-dark font-inter"
                              onClick={() => handleFontEditClick('Modal Title', `modal-title-${program.id}`, 'Inter')}
                              title="Click to edit modal title & font"
                            >
                              {program.name}
                            </DialogTitle>
                            <DialogDescription 
                              className="body-text text-base pt-2 editable-text editable-text-dark font-inter"
                              onClick={() => handleFontEditClick('Program Description', `program-desc-${program.id}`, 'Inter')}
                              title="Click to edit program description & font"
                            >
                              {program.description}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        onClick={() => handleEnrollClick(program.name)}
                        className="btn-primary flex-1 editable-text font-inter"
                        title="Click to edit button text & font"
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

      {/* Stats Section - Enhanced White Background with 3 Cards */}
      <section className="main-content-area">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 
              className="text-3xl font-bold header-text mb-4 editable-text editable-text-dark font-inter"
              onClick={() => handleFontEditClick('Section Title', 'impact-title', 'Inter')}
              title="Click to edit section title & font"
            >
              Our Impact
            </h2>
            <p 
              className="body-text editable-text editable-text-dark font-inter"
              onClick={() => handleFontEditClick('Section Description', 'impact-desc', 'Inter')}
              title="Click to edit section description & font"
            >
              Building a strong community of Islamic scholars and learners
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className={getStatsClassName(stat.type)}>
                <div 
                  className="text-3xl font-bold header-text mb-2 editable-text editable-text-dark font-inter"
                  onClick={() => handleFontEditClick('Stat Number', `stat-number-${index}`, 'Inter')}
                  title="Click to edit stat number & font"
                >
                  {stat.number}
                </div>
                <div 
                  className="body-text editable-text editable-text-dark font-inter"
                  onClick={() => handleFontEditClick('Stat Label', `stat-label-${index}`, 'Inter')}
                  title="Click to edit stat label & font"
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
                className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center editable-logo"
                onClick={() => handleEditClick('Footer Logo', 'footer-logo')}
                title="Click to edit footer logo"
              >
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 
                className="text-lg font-semibold header-text editable-text editable-text-dark font-inter"
                onClick={() => handleFontEditClick('Footer Title', 'footer-title', 'Inter')}
                title="Click to edit footer title & font"
              >
                Ahlulbayt Studies
              </h3>
            </div>
            <p 
              className="body-text editable-text editable-text-dark font-inter"
              onClick={() => handleFontEditClick('Footer Copyright', 'footer-copyright', 'Inter')}
              title="Click to edit footer copyright & font"
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