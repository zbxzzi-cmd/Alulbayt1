import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { BookOpen, Users, Scale, Clock, Type, Palette, Sliders } from "lucide-react";
import DesignSystemDemo from "./components/DesignSystemDemo";
import ThemeToggle from "./components/ThemeToggle";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = () => {
  const [content, setContent] = useState({
    landing_hero_title: "Welcome to Ahlulbayt Studies",
    landing_hero_subtitle: "Comprehensive Islamic Education Platform",
    enroll_button: "Enroll Now",
    overview_button: "Program Overview"
  });

  const [showBgEditor, setShowBgEditor] = useState(false);
  const [showBorderEditor, setShowBorderEditor] = useState(false);
  const [currentBgColor, setCurrentBgColor] = useState("#c3ffff");
  const [borderThickness, setBorderThickness] = useState(18);
  const [borderLength, setBorderLength] = useState(60); // NEW: Border length state

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Helper function to convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Helper function to convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Helper function to calculate border color using HSLA method - PRECISE FIX
  const calculateBorderColor = (bgColor) => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return "#4dd6d6";
    
    // Convert RGB to HSL
    const [h, s, l] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Reduce lightness by 10% as specified
    const newLightness = Math.max(0, l - 10);
    
    // Convert back to RGB
    const [r, g, b] = hslToRgb(h, s, newLightness);
    
    // Convert to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Expanded font options with new fonts
  const fontOptions = [
    { name: "Inter", class: "font-inter", style: "Modern & Clean" },
    { name: "Playfair Display", class: "font-playfair", style: "Elegant & Serif" },
    { name: "Roboto", class: "font-roboto", style: "Professional" },
    { name: "Open Sans", class: "font-opensans", style: "Friendly & Readable" },
    { name: "Lato", class: "font-lato", style: "Humanist" },
    { name: "Montserrat", class: "font-montserrat", style: "Contemporary" },
    { name: "Calibri", class: "font-calibri", style: "Clean & Modern" },
    { name: "Oswald", class: "font-oswald", style: "Bold & Strong" },
    { name: "Trebuchet MS", class: "font-trebuchet", style: "Friendly & Rounded" },
    { name: "Nunito", class: "font-nunito", style: "Soft & Rounded" }
  ];

  // Text color options
  const colorOptions = [
    { name: "Default Dark", class: "text-default", hex: "#2C3E50" },
    { name: "Charcoal", class: "text-dark", hex: "#1a202c" },
    { name: "Gray", class: "text-gray", hex: "#4a5568" },
    { name: "Blue", class: "text-blue", hex: "#2563eb" },
    { name: "Green", class: "text-green", hex: "#059669" },
    { name: "Purple", class: "text-purple", hex: "#7c3aed" },
    { name: "Red", class: "text-red", hex: "#dc2626" },
    { name: "Orange", class: "text-orange", hex: "#ea580c" },
    { name: "Teal", class: "text-teal", hex: "#0891b2" },
    { name: "Pink", class: "text-pink", hex: "#db2777" },
    { name: "Indigo", class: "text-indigo", hex: "#4338ca" },
    { name: "White", class: "text-white", hex: "#ffffff" }
  ];

  // Background color presets
  const bgColorPresets = [
    { name: "Light Cyan", color: "#c3ffff" },
    { name: "Soft Blue", color: "#b3e5fc" },
    { name: "Mint Green", color: "#b3f0b3" },
    { name: "Lavender", color: "#e1bee7" },
    { name: "Peach", color: "#ffccbc" },
    { name: "Light Pink", color: "#f8bbd9" },
    { name: "Soft Yellow", color: "#fff9c4" },
    { name: "Light Gray", color: "#f5f5f5" }
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

  // EDITABLE STATS DATA - 3 CARDS
  const statsData = [
    { number: "4", label: "Programs Available", type: "a" }, // EDITABLE
    { number: "50+", label: "Students Enrolled", type: "b" }, // EDITABLE
    { number: "95%", label: "Completion Rate", type: "c" } // EDITABLE
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

  // Update CSS custom properties when background color changes - FIXED WITH AUTO BORDER COLOR
  useEffect(() => {
    const root = document.documentElement;
    const borderColor = calculateBorderColor(currentBgColor);
    
    root.style.setProperty('--custom-bg-color', currentBgColor);
    root.style.setProperty('--border-color', borderColor);
  }, [currentBgColor]);

  // Update border thickness when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--border-thickness', `${borderThickness}px`);
  }, [borderThickness]);

  // Update border length when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--border-length', `${borderLength}%`);
  }, [borderLength]);

  const handleEnrollClick = (programName) => {
    // In next step, this will redirect to login/signup
    alert(`Enrollment for ${programName} - Login/Signup will be implemented in next step`);
  };

  const handleEditClick = (elementType, elementId) => {
    let editOptions = "";
    
    if (elementType.includes("text") || elementType === "Hero Title" || elementType === "Section Title") {
      const fontList = fontOptions.map(font => `• ${font.name} (${font.style})`).join('\n');
      const colorList = colorOptions.map(color => `• ${color.name} (${color.hex})`).join('\n');
      
      editOptions = `\n\nFont Options Available:\n${fontList}\n\nColor Options Available:\n${colorList}`;
    }

    alert(`Edit ${elementType}: ${elementId}\n\nIn a real CMS, this would open an editor for:\n- Text content\n- Images\n- Colors\n- Layout options${editOptions}`);
  };

  const handleFontColorEditClick = (elementType, elementId, currentFont = "Inter", currentColor = "Default Dark") => {
    const fontList = fontOptions.map(font => `• ${font.name} (${font.style})`).join('\n');
    const colorList = colorOptions.map(color => `• ${color.name} (${color.hex})`).join('\n');
    
    alert(`Font & Color Editor for ${elementType}: ${elementId}
    
Current Font: ${currentFont}
Current Color: ${currentColor}

Available Fonts:
${fontList}

Available Colors:
${colorList}

Click OK to open font & color selector...`);
  };

  const handleBgColorChange = (color) => {
    setCurrentBgColor(color);
    // CRITICAL FIX: Theme-aware background color
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') || 'light';
    if (theme === 'dark') {
      root.style.setProperty('--custom-bg-color-dark', color);
      root.style.setProperty('--main-bg-color', color);
    } else {
      root.style.setProperty('--custom-bg-color-light', color);
      root.style.setProperty('--main-bg-color', color);
    }
  };

  const handleBorderThicknessChange = (thickness) => {
    setBorderThickness(thickness);
    // CRITICAL FIX: Update left border width
    const root = document.documentElement;
    root.style.setProperty('--left-border-width', `${thickness}px`);
  };

  const handleBorderLengthChange = (length) => {
    setBorderLength(length);
  };

  // Handle border line click for length adjustment
  const handleBorderLineClick = () => {
    setShowBorderEditor(true);
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
      {/* Background Color Editor */}
      {showBgEditor && (
        <div className="bg-color-editor">
          <h3>🎨 Background Color</h3>
          <input
            type="color"
            value={currentBgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="color-input"
            title="Choose custom background color"
          />
          <div className="color-presets">
            {bgColorPresets.map((preset, index) => (
              <div
                key={index}
                className={`color-preset ${currentBgColor === preset.color ? 'active' : ''}`}
                style={{ backgroundColor: preset.color }}
                onClick={() => handleBgColorChange(preset.color)}
                title={preset.name}
              />
            ))}
          </div>
          <button
            onClick={() => setShowBgEditor(false)}
            className="btn-secondary"
            style={{ width: '100%', padding: '8px' }}
          >
            Close
          </button>
        </div>
      )}

      {/* Border Thickness & Length Editor - ENHANCED */}
      {showBorderEditor && (
        <div className="border-thickness-editor">
          <h3>📏 Border Controls</h3>
          
          <div className="control-group">
            <label className="control-label">Border Thickness</label>
            <input
              type="range"
              min="5"
              max="30"
              value={borderThickness}
              onChange={(e) => handleBorderThicknessChange(parseInt(e.target.value))}
              className="thickness-slider"
            />
            <div className="control-value">{borderThickness}px</div>
          </div>

          <div className="control-group">
            <label className="control-label">Border Length</label>
            <input
              type="range"
              min="20"
              max="100"
              value={borderLength}
              onChange={(e) => handleBorderLengthChange(parseInt(e.target.value))}
              className="length-slider"
            />
            <div className="control-value">{borderLength}% width</div>
          </div>

          <button
            onClick={() => setShowBorderEditor(false)}
            className="btn-secondary"
            style={{ width: '100%', padding: '8px' }}
          >
            Close
          </button>
        </div>
      )}

      {/* Header - EXTENDED BORDER WITH CLICK FUNCTIONALITY */}
      <header className="navigation-bar" onClick={handleBorderLineClick}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="logo-text-container">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-100 flex items-center justify-center editable-logo mr-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick('Logo', 'main-logo');
                }}
                title="Click to edit logo"
              >
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <h1 
                className="text-2xl font-bold header-text-light editable-text font-inter text-default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFontColorEditClick('Site Title', 'site-title', 'Inter', 'Default Dark');
                }}
                title="Click to edit site title, font & color"
              >
                Ahlulbayt Studies
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBorderEditor(!showBorderEditor);
                }}
                className="flex items-center space-x-2 text-teal-700 text-sm hover:text-teal-800 transition-colors"
                title="Adjust border thickness & length"
              >
                <Sliders className="h-4 w-4" />
                <span>Borders</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBgEditor(!showBgEditor);
                }}
                className="flex items-center space-x-2 text-teal-700 text-sm hover:text-teal-800 transition-colors"
                title="Change background color"
              >
                <Palette className="h-4 w-4" />
                <span>Background</span>
              </button>
              <div className="text-teal-700 text-sm flex items-center">
                <Type className="h-4 w-4 inline mr-1" />
                Hover over content to edit text, fonts & colors
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Direct on Background */}
      <section className="hero-section">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-5xl font-bold header-text-light mb-6 editable-text font-inter text-default"
            onClick={() => handleFontColorEditClick('Hero Title', 'hero-title', 'Inter', 'Default Dark')}
            title="Click to edit hero title, font & color"
          >
            {content.landing_hero_title}
          </h1>
          <p 
            className="text-xl body-text-light mb-8 max-w-2xl mx-auto editable-text font-inter text-gray"
            onClick={() => handleFontColorEditClick('Hero Subtitle', 'hero-subtitle', 'Inter', 'Gray')}
            title="Click to edit hero subtitle, font & color"
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
              className="text-3xl font-bold header-text mb-4 editable-text editable-text-dark font-inter text-default"
              onClick={() => handleFontColorEditClick('Section Title', 'programs-title', 'Inter', 'Default Dark')}
              title="Click to edit section title, font & color"
            >
              Our Programs
            </h2>
            <p 
              className="body-text editable-text editable-text-dark font-inter text-gray"
              onClick={() => handleFontColorEditClick('Section Description', 'programs-desc', 'Inter', 'Gray')}
              title="Click to edit section description, font & color"
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
                      className="text-2xl font-bold header-text editable-text editable-text-dark font-inter text-default"
                      onClick={() => handleFontColorEditClick('Program Name', `program-name-${program.id}`, 'Inter', 'Default Dark')}
                      title="Click to edit program name, font & color"
                    >
                      {program.name}
                    </CardTitle>
                    <CardDescription 
                      className="body-text text-base editable-text editable-text-dark font-inter text-gray"
                      onClick={() => handleFontColorEditClick('Program Tagline', `program-tagline-${program.id}`, 'Inter', 'Gray')}
                      title="Click to edit program tagline, font & color"
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
                            className="btn-secondary ds-btn-overview flex-1 editable-text font-inter"
                            title="Click to edit button text, font & color"
                          >
                            {content.overview_button}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="modal-content max-w-2xl">
                          <DialogHeader>
                            <DialogTitle 
                              className="text-2xl header-text editable-text editable-text-dark font-inter text-default"
                              onClick={() => handleFontColorEditClick('Modal Title', `modal-title-${program.id}`, 'Inter', 'Default Dark')}
                              title="Click to edit modal title, font & color"
                            >
                              {program.name}
                            </DialogTitle>
                            <DialogDescription 
                              className="body-text text-base pt-2 editable-text editable-text-dark font-inter text-gray"
                              onClick={() => handleFontColorEditClick('Program Description', `program-desc-${program.id}`, 'Inter', 'Gray')}
                              title="Click to edit program description, font & color"
                            >
                              {program.description}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        onClick={() => handleEnrollClick(program.name)}
                        className="btn-primary flex-1 editable-text font-inter"
                        title="Click to edit button text, font & color"
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
              className="text-3xl font-bold header-text mb-4 editable-text editable-text-dark font-inter text-default"
              onClick={() => handleFontColorEditClick('Section Title', 'impact-title', 'Inter', 'Default Dark')}
              title="Click to edit section title, font & color"
            >
              Our Impact
            </h2>
            <p 
              className="body-text editable-text editable-text-dark font-inter text-gray"
              onClick={() => handleFontColorEditClick('Section Description', 'impact-desc', 'Inter', 'Gray')}
              title="Click to edit section description, font & color"
            >
              Building a strong community of Islamic scholars and learners
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className={getStatsClassName(stat.type)}>
                <div 
                  className="text-3xl font-bold header-text mb-2 editable-text editable-text-dark font-inter text-default"
                  onClick={() => handleFontColorEditClick('Stat Number', `stat-number-${index}`, 'Inter', 'Default Dark')}
                  title="Click to edit stat number, font & color"
                >
                  {stat.number}
                </div>
                <div 
                  className="body-text editable-text editable-text-dark font-inter text-gray"
                  onClick={() => handleFontColorEditClick('Stat Label', `stat-label-${index}`, 'Inter', 'Gray')}
                  title="Click to edit stat label, font & color"
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
                className="text-lg font-semibold header-text editable-text editable-text-dark font-inter text-default"
                onClick={() => handleFontColorEditClick('Footer Title', 'footer-title', 'Inter', 'Default Dark')}
                title="Click to edit footer title, font & color"
              >
                Ahlulbayt Studies
              </h3>
            </div>
            <p 
              className="body-text editable-text editable-text-dark font-inter text-gray"
              onClick={() => handleFontColorEditClick('Footer Copyright', 'footer-copyright', 'Inter', 'Gray')}
              title="Click to edit footer copyright, font & color"
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
          <Route path="/design-system" element={<DesignSystemDemo />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;