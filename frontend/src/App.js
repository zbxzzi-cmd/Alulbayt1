import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { BookOpen, Users, Scale, Clock, Type, Palette, Sliders, Trash2 } from "lucide-react";
import DesignSystemDemo from "./components/DesignSystemDemo";
import ThemeToggle from "./components/ThemeToggle";
import AdminControls from "./components/AdminControls";

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
  const [showBorderColorEditor, setShowBorderColorEditor] = useState(false);
  const [currentBgColor, setCurrentBgColor] = useState("#c3ffff");
  const [borderThickness, setBorderThickness] = useState(18);
  const [borderColors, setBorderColors] = useState({
    aqua: "#4A90A4",
    pink: "#B8739B", 
    orange: "#CC9966",
    green: "#7AAF7A"
  });
  const [borderLength, setBorderLength] = useState(28); // Updated default to 28%

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Add this function to automatically calculate darker hues
  function calculateDarkerHue(hexColor, darkenPercentage) {
    if (!hexColor || !hexColor.startsWith('#')) return '#000000';
    
    // Convert hex to RGB
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate darker values (50% darker)
    r = Math.floor(r * (1 - darkenPercentage));
    g = Math.floor(g * (1 - darkenPercentage));
    b = Math.floor(b * (1 - darkenPercentage));
    
    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Helper function to darken a color by 30% for 3D effect
  const darkenColor = (hex, percent = 30) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
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
  const [programs, setPrograms] = useState([
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
  ]);

  // Function to delete a stat tab
  const handleDeleteStat = async (statId, statLabel) => {
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete the stat "${statLabel}"?`);
    
    if (!confirmed) {
      return;
    }

    try {
      // Only delete backend stats (those with isBackendStat flag)
      const statToDelete = statsData.find(s => s.id === statId);
      
      if (!statToDelete?.isBackendStat) {
        alert('Cannot delete default stats');
        return;
      }

      // Make API call to delete the stat
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required to delete stats');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.delete(`${API}/admin/stat-tabs/${statId}`, { headers });

      // Remove from UI immediately (optimistic update)
      setStatsData(prevStats => prevStats.filter(s => s.id !== statId));
      
      console.log(`Successfully deleted stat: ${statLabel}`);
      
    } catch (error) {
      console.error('Error deleting stat:', error);
      
      let errorMessage = 'Failed to delete stat';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login as admin.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Stat not found.';
      }
      
      alert(`Error deleting stat: ${errorMessage}`);
      
      // Refresh the stat list to ensure UI is in sync
      fetchStatTabs();
    }
  };

  // Function to delete a program tab
  const handleDeleteProgram = async (programId, programName) => {
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete the program "${programName}"?`);
    
    if (!confirmed) {
      return;
    }

    try {
      // Only delete backend programs (those with isBackendProgram flag)
      const programToDelete = programs.find(p => p.id === programId);
      
      if (!programToDelete?.isBackendProgram) {
        alert('Cannot delete default programs');
        return;
      }

      // Make API call to delete the program
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required to delete programs');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      await axios.delete(`${API}/admin/program-tabs/${programId}`, { headers });

      // Remove from UI immediately (optimistic update)
      setPrograms(prevPrograms => prevPrograms.filter(p => p.id !== programId));
      
      console.log(`Successfully deleted program: ${programName}`);
      
    } catch (error) {
      console.error('Error deleting program:', error);
      
      let errorMessage = 'Failed to delete program';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login as admin.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Program not found.';
      }
      
      alert(`Error deleting program: ${errorMessage}`);
      
      // Refresh the program list to ensure UI is in sync
      fetchProgramTabs();
    }
  };

  // Function to fetch program tabs from backend and merge with default programs
  const fetchProgramTabs = async () => {
    try {
      const response = await axios.get(`${API}/admin/program-tabs`);
      const programTabs = response.data;
      
      // Convert backend program tabs to frontend format
      const backendPrograms = programTabs.map((tab, index) => {
        console.log('🔍 BACKEND PROGRAM TAB DATA:', {
          id: tab.id,
          title: tab.title,
          border_color_light: tab.border_color_light,
          border_color_dark: tab.border_color_dark,
          raw_tab: tab
        });
        
        return {
          id: tab.id || `backend-${index}`, // Use backend ID or generate one
          name: tab.title,
          tagline: tab.description ? tab.description.substring(0, 60) + "..." : "New Program",
          description: tab.description || "Program description",
          image: tab.image || "https://images.unsplash.com/photo-1694758375810-2d7c7bc3e84e",
          icon: BookOpen, // Default icon for backend programs
          type: tab.type || "informational",
          isBackendProgram: true, // Mark as backend program for identification
          border_color_light: tab.border_color_light || "#E0F7FA", // CUSTOM BORDER COLORS
          border_color_dark: tab.border_color_dark || "#4A90A4"
        };
      });
      
      // Original hardcoded programs
      const defaultPrograms = [
        {
          id: 1,
          name: "Quran Studies",
          tagline: "Deep dive into the Holy Quran with expert guidance",
          description: "Comprehensive study of the Quran including recitation, interpretation (Tafseer), and memorization (Hifz). Our expert teachers guide students through proper pronunciation, understanding of verses, and practical application in daily life.",
          image: "https://images.unsplash.com/photo-1694758375810-2d7c7bc3e84e",
          icon: BookOpen,
          type: "informational"
        },
        {
          id: 2,
          name: "Hadith Studies",
          tagline: "Learn the teachings and traditions of Prophet Muhammad (PBUH)",
          description: "Study the authentic sayings, actions, and approvals of Prophet Muhammad (PBUH). Learn to identify authentic narrations, understand their contexts, and apply their teachings in contemporary Islamic life.",
          image: "https://images.unsplash.com/photo-1714746643489-a893ada081f5",
          icon: Users,
          type: "interactive"
        },
        {
          id: 3,
          name: "Islamic Jurisprudence (Fiqh)",
          tagline: "Master Islamic law and jurisprudence principles",
          description: "Comprehensive study of Islamic legal theory and practice. Learn the principles of Islamic jurisprudence, comparative Fiqh, and how to derive rulings from primary sources according to Shia Ithna Ashari methodology.",
          image: "https://images.unsplash.com/photo-1626553261684-68f25328988f",
          icon: Scale,
          type: "warning"
        },
        {
          id: 4,
          name: "Islamic History",
          tagline: "Explore the rich history of Islam and its civilizations",
          description: "Journey through Islamic history from the time of Prophet Muhammad (PBUH) to the present day. Study the lives of the Imams, Islamic golden age, and the development of Islamic societies and cultures.",
          image: "https://images.unsplash.com/photo-1660674807706-49e85f121c59",
          icon: Clock,
          type: "success"
        }
      ];
      
      // Merge backend programs with default programs (backend programs first)
      const allPrograms = [...backendPrograms, ...defaultPrograms];
      setPrograms(allPrograms);
      
      console.log(`Loaded ${backendPrograms.length} backend programs and ${defaultPrograms.length} default programs`);
      
    } catch (error) {
      console.error("Error fetching program tabs:", error);
      // If backend fetch fails, use default programs only
      const defaultPrograms = [
        {
          id: 1,
          name: "Quran Studies",
          tagline: "Deep dive into the Holy Quran with expert guidance",
          description: "Comprehensive study of the Quran including recitation, interpretation (Tafseer), and memorization (Hifz). Our expert teachers guide students through proper pronunciation, understanding of verses, and practical application in daily life.",
          image: "https://images.unsplash.com/photo-1694758375810-2d7c7bc3e84e",
          icon: BookOpen,
          type: "informational"
        },
        {
          id: 2,
          name: "Hadith Studies",
          tagline: "Learn the teachings and traditions of Prophet Muhammad (PBUH)",
          description: "Study the authentic sayings, actions, and approvals of Prophet Muhammad (PBUH). Learn to identify authentic narrations, understand their contexts, and apply their teachings in contemporary Islamic life.",
          image: "https://images.unsplash.com/photo-1714746643489-a893ada081f5",
          icon: Users,
          type: "interactive"
        },
        {
          id: 3,
          name: "Islamic Jurisprudence (Fiqh)",
          tagline: "Master Islamic law and jurisprudence principles",
          description: "Comprehensive study of Islamic legal theory and practice. Learn the principles of Islamic jurisprudence, comparative Fiqh, and how to derive rulings from primary sources according to Shia Ithna Ashari methodology.",
          image: "https://images.unsplash.com/photo-1626553261684-68f25328988f",
          icon: Scale,
          type: "warning"
        },
        {
          id: 4,
          name: "Islamic History",
          tagline: "Explore the rich history of Islam and its civilizations",
          description: "Journey through Islamic history from the time of Prophet Muhammad (PBUH) to the present day. Study the lives of the Imams, Islamic golden age, and the development of Islamic societies and cultures.",
          image: "https://images.unsplash.com/photo-1660674807706-49e85f121c59",
          icon: Clock,
          type: "success"
        }
      ];
      setPrograms(defaultPrograms);
    }
  };

  // EDITABLE STATS DATA - Dynamic with Backend Integration
  const [statsData, setStatsData] = useState([
    { number: "4", label: "Programs Available", type: "a" }, // EDITABLE
    { number: "50+", label: "Students Enrolled", type: "b" }, // EDITABLE
    { number: "95%", label: "Completion Rate", type: "c" } // EDITABLE
  ]);

  // Function to fetch stat tabs from backend and merge with default stats
  const fetchStatTabs = async () => {
    try {
      const response = await axios.get(`${API}/admin/stat-tabs`);
      const statTabs = response.data;
      
      // Convert backend stat tabs to frontend format
      const backendStats = statTabs.map((tab, index) => ({
        number: tab.value || "New",
        label: tab.title || "New Stat",
        type: tab.type || "a",
        id: tab.id,
        isBackendStat: true, // Mark as backend stat for identification
        border_color_light: tab.border_color_light || "#4A90A4", // CUSTOM BORDER COLORS
        border_color_dark: tab.border_color_dark || "#B8739B"
      }));
      
      // Original hardcoded stats
      const defaultStats = [
        { number: "4", label: "Programs Available", type: "a" },
        { number: "50+", label: "Students Enrolled", type: "b" },
        { number: "95%", label: "Completion Rate", type: "c" }
      ];
      
      // Merge backend stats with default stats (backend stats first)
      const allStats = [...backendStats, ...defaultStats];
      setStatsData(allStats);
      
      console.log(`Loaded ${backendStats.length} backend stats and ${defaultStats.length} default stats`);
      
    } catch (error) {
      console.error("Error fetching stat tabs:", error);
      // If backend fetch fails, use default stats only
      const defaultStats = [
        { number: "4", label: "Programs Available", type: "a" },
        { number: "50+", label: "Students Enrolled", type: "b" },
        { number: "95%", label: "Completion Rate", type: "c" }
      ];
      setStatsData(defaultStats);
    }
  };

  // Add an update mechanism that triggers when border colors are modified
  useEffect(() => {
    const updateBorderColors = () => {
      const programCards = document.querySelectorAll('.program-card');
      programCards.forEach(card => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const lightBorder = card.getAttribute('data-theme-light-border');
        const darkBorder = card.getAttribute('data-theme-dark-border');
        
        if (lightBorder || darkBorder) {
          const leftBorderColor = currentTheme === 'dark' ? darkBorder : lightBorder;
          const bottomBorderColor = leftBorderColor ? calculateDarkerHue(leftBorderColor, 0.5) : null;
          
          if (leftBorderColor) {
            card.style.borderLeftColor = leftBorderColor;
            if (currentTheme === 'dark' && bottomBorderColor) {
              card.style.borderBottomColor = bottomBorderColor;
            } else if (currentTheme === 'light') {
              card.style.borderBottomColor = leftBorderColor;
            }
            
            console.log('Updated card borders:', card, 'Left:', leftBorderColor, 'Bottom:', bottomBorderColor);
          }
        }
      });
    };

    // Update on theme change
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateBorderColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Initial update
    updateBorderColors();

    return () => observer.disconnect();
  }, [programs, statsData]); // Re-run when data changes

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

    // Fetch both content, program tabs, and stat tabs
    fetchContent();
    fetchProgramTabs();
    fetchStatTabs();
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
    // CRITICAL FIX: Also update left border width
    root.style.setProperty('--left-border-width', `${borderThickness}px`);
  }, [borderThickness]);

  // Initialize border length to 28% on mount
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--border-length', '28%');
  }, []);

  // Update border length when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--border-length', `${borderLength}%`);
  }, [borderLength]);

  // Load border colors from localStorage on mount
  useEffect(() => {
    const savedColors = localStorage.getItem('borderColors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      setBorderColors(colors);
      // Apply colors to CSS variables
      const root = document.documentElement;
      root.style.setProperty('--card-border-aqua-custom', colors.aqua);
      root.style.setProperty('--card-border-pink-custom', colors.pink);
      root.style.setProperty('--card-border-orange-custom', colors.orange);
      root.style.setProperty('--card-border-green-custom', colors.green);
    }
  }, []);

  // Save border colors to localStorage and apply to CSS
  const handleBorderColorChange = (type, color) => {
    const newColors = { ...borderColors, [type]: color };
    setBorderColors(newColors);
    localStorage.setItem('borderColors', JSON.stringify(newColors));
    
    // Apply to CSS variable
    const root = document.documentElement;
    root.style.setProperty(`--card-border-${type}-custom`, color);
  };

  // Reset border colors to default
  const resetBorderColors = () => {
    const defaultColors = {
      aqua: "#4A90A4",
      pink: "#B8739B", 
      orange: "#CC9966",
      green: "#7AAF7A"
    };
    setBorderColors(defaultColors);
    localStorage.setItem('borderColors', JSON.stringify(defaultColors));
    
    // Apply to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--card-border-aqua-custom', defaultColors.aqua);
    root.style.setProperty('--card-border-pink-custom', defaultColors.pink);
    root.style.setProperty('--card-border-orange-custom', defaultColors.orange);
    root.style.setProperty('--card-border-green-custom', defaultColors.green);
  };

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
    // ENHANCED: Theme-aware background color function
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const variableName = theme === 'dark' ? '--custom-bg-color-dark' : '--custom-bg-color-light';
    document.documentElement.style.setProperty(variableName, color);
    document.documentElement.style.setProperty('--main-bg-color', color);
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
    <div className="app-background ds-bg-main landing-page">
      {/* Theme Toggle and Design System Link - Top Right Corner with Higher Z-Index */}
      <div className="fixed top-4 right-4 z-[9999] flex items-center space-x-3">
        <a 
          href="/design-system" 
          className="px-4 py-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30"
        >
          Design System
        </a>
        <ThemeToggle />
      </div>
      
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

      {/* Border Color Editor Panel */}
      {showBorderColorEditor && (
        <div className="fixed top-20 right-4 bg-white p-6 rounded-2xl shadow-2xl border border-gray-200 z-50 max-w-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Border Colors (Dark Mode)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aqua Cards</label>
              <input
                type="color"
                value={borderColors.aqua}
                onChange={(e) => handleBorderColorChange('aqua', e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pink Cards</label>
              <input
                type="color"
                value={borderColors.pink}
                onChange={(e) => handleBorderColorChange('pink', e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orange Cards</label>
              <input
                type="color"
                value={borderColors.orange}
                onChange={(e) => handleBorderColorChange('orange', e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Green Cards</label>
              <input
                type="color"
                value={borderColors.green}
                onChange={(e) => handleBorderColorChange('green', e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <button
                onClick={resetBorderColors}
                className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={() => setShowBorderColorEditor(false)}
                className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Border Editor Panel */}
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
                  setShowBorderColorEditor(!showBorderColorEditor);
                }}
                className="flex items-center space-x-2 text-teal-700 text-sm hover:text-teal-800 transition-colors"
                title="Change border colors (Dark Mode only)"
              >
                <Palette className="h-4 w-4" />
                <span>Colors</span>
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

      {/* Admin Tab Management - Show for Super Admin */}
      <AdminControls 
        currentUser={{ role: 'super_admin' }} 
        onProgramSaved={fetchProgramTabs}
        onStatSaved={fetchStatTabs}
      />

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
            {programs.map((program, index) => {
              // Ensure BOTH borders use the custom colors correctly
              const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
              const leftBorderColor = currentTheme === 'dark' ? program.border_color_dark : program.border_color_light;
              const bottomBorderColor = leftBorderColor ? calculateDarkerHue(leftBorderColor, 0.5) : null; // 50% darker
              
              console.log('🎨 BORDER COLOR APPLICATION:', {
                programName: program.name,
                currentTheme: currentTheme,
                isBackendProgram: program.isBackendProgram,
                border_color_light: program.border_color_light,
                border_color_dark: program.border_color_dark,
                calculatedLeftBorder: leftBorderColor,
                calculatedBottomBorder: bottomBorderColor,
                shouldApplyCustomColors: program.isBackendProgram && leftBorderColor
              });
              
              const IconComponent = program.icon;
              return (
                <Card 
                  key={program.id} 
                  className={`${getCardClassName(program.type)} group relative`}
                  style={{
                    // Apply custom border colors for backend programs
                    ...(program.isBackendProgram && leftBorderColor && {
                      '--custom-light-border': program.border_color_light,
                      '--custom-dark-border': program.border_color_dark,
                      '--custom-dark-border-darker': bottomBorderColor,
                      // Apply to both borders immediately
                      borderLeftColor: leftBorderColor,
                      borderBottomColor: currentTheme === 'dark' ? bottomBorderColor : undefined,
                    })
                  }}
                  data-theme-light-border={program.isBackendProgram ? program.border_color_light : null}
                  data-theme-dark-border={program.isBackendProgram ? program.border_color_dark : null}
                  data-bottom-border-color={bottomBorderColor}
                >
                  {/* Delete Button - Only show for backend programs - POSITIONED OUTSIDE IMAGE CONTAINER */}
                  {program.isBackendProgram && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProgram(program.id, program.name);
                      }}
                      className="delete-program-btn"
                      title={`Delete ${program.name}`}
                    >
                      <Trash2 
                        className="h-5 w-5" 
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </button>
                  )}
                  
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
            {statsData.map((stat, index) => {
              return (
                <div 
                  key={stat.id || index} 
                  className={`${getStatsClassName(stat.type)} group relative`}
                  style={{
                    // Apply custom border colors for backend stats
                    ...(stat.isBackendStat && stat.border_color_light && {
                      '--custom-stat-light-border': stat.border_color_light,
                      '--custom-stat-dark-border': stat.border_color_dark || stat.border_color_light,
                    })
                  }}
                  data-stat-light-border={stat.isBackendStat ? stat.border_color_light : null}
                  data-stat-dark-border={stat.isBackendStat ? stat.border_color_dark : null}
                >
                  {/* Delete Button - Only show for backend stats */}
                  {stat.isBackendStat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStat(stat.id, stat.label);
                      }}
                      className="delete-stat-btn"
                      title={`Delete ${stat.label}`}
                    >
                      <Trash2 
                        className="h-5 w-5" 
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </button>
                  )}
                  
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
              );
            })}
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