import type { CoursesData } from "@/types";

export const C = {
  bg: "#06080D", surface: "#0D1219", card: "#111928", border: "#1A2A40",
  teal: "#22D4C0", tealGlow: "rgba(34,212,192,0.09)",
  amber: "#FFBA08", amberGlow: "rgba(255,186,8,0.09)",
  red: "#FF4D6D", muted: "#637088", text: "#E2EAF6", soft: "#A8B8D0",
};

export const TYPE_COLOR: Record<string, string> = {
  "University": "#22D4C0",
  "College": "#FFBA08",
  "Univ./College": "#A855F7",
  "Applied": "#F97316",
  "Academic": "#3B82F6",
  "Open": "#6B7A99",
  "Workplace": "#FF6B6B",
  "De-streamed": "#06D6A0",
  "Locally Dev.": "#94A3B8",
};

export const AV_COLORS = ["#22D4C0","#FFBA08","#A855F7","#FF4D6D","#06D6A0","#F97316","#3B82F6","#EC4899"];

export const TIMES = ["3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM"];

export const COURSES: CoursesData = {
  "Grade 9": {
    "English": [
      { code:"ENG1D", name:"English (Academic)", type:"Academic" },
      { code:"ENG1P", name:"English (Applied)", type:"Applied" },
      { code:"ENG1L", name:"English (Locally Developed)", type:"Locally Dev." },
    ],
    "Mathematics": [
      { code:"MTH1W", name:"Mathematics (De-streamed)", type:"De-streamed" },
    ],
    "Science": [
      { code:"SNC1W", name:"Science (De-streamed)", type:"De-streamed" },
    ],
    "French": [
      { code:"FSF1D", name:"Core French (Academic)", type:"Academic" },
      { code:"FSF1P", name:"Core French (Applied)", type:"Applied" },
      { code:"FIF1O", name:"French Immersion", type:"Open" },
    ],
    "History / Geography": [
      { code:"CGC1D", name:"Issues in Canadian Geography (Academic)", type:"Academic" },
      { code:"CGC1P", name:"Issues in Canadian Geography (Applied)", type:"Applied" },
    ],
    "Arts": [
      { code:"AVI1O", name:"Visual Arts", type:"Open" },
      { code:"AMU1O", name:"Music", type:"Open" },
      { code:"ADA1O", name:"Drama", type:"Open" },
      { code:"AWR1O", name:"Media Arts", type:"Open" },
    ],
    "Physical Education": [
      { code:"PPL1O", name:"Health & Physical Education", type:"Open" },
    ],
    "Technology": [
      { code:"TIJ1O", name:"Exploring Technologies", type:"Open" },
      { code:"TTJ1O", name:"Transportation Technology", type:"Open" },
      { code:"TFJ1O", name:"Food and Culture", type:"Open" },
    ],
    "Business": [
      { code:"BBI1O", name:"Introduction to Business", type:"Open" },
    ],
    "Computer Studies": [
      { code:"BTT1O", name:"Information & Communication Technology", type:"Open" },
    ],
    "Religion (DPCDSB)": [
      { code:"NBE1O", name:"Navigating the Bible", type:"Open" },
    ],
  },
  "Grade 10": {
    "English": [
      { code:"ENG2D", name:"English (Academic)", type:"Academic" },
      { code:"ENG2P", name:"English (Applied)", type:"Applied" },
      { code:"ENG2L", name:"English (Locally Developed)", type:"Locally Dev." },
    ],
    "Mathematics": [
      { code:"MPM2D", name:"Principles of Mathematics (Academic)", type:"Academic" },
      { code:"MFM2P", name:"Foundations of Mathematics (Applied)", type:"Applied" },
    ],
    "Science": [
      { code:"SNC2D", name:"Science (Academic)", type:"Academic" },
      { code:"SNC2P", name:"Science (Applied)", type:"Applied" },
    ],
    "French": [
      { code:"FSF2D", name:"Core French (Academic)", type:"Academic" },
      { code:"FSF2P", name:"Core French (Applied)", type:"Applied" },
      { code:"FIF2O", name:"French Immersion", type:"Open" },
    ],
    "History / Geography": [
      { code:"CHC2D", name:"Canadian History Since WWI (Academic)", type:"Academic" },
      { code:"CHC2P", name:"Canadian History Since WWI (Applied)", type:"Applied" },
    ],
    "Civics & Careers": [
      { code:"CHV2O", name:"Civics and Citizenship", type:"Open" },
      { code:"GLC2O", name:"Career Studies", type:"Open" },
    ],
    "Arts": [
      { code:"AVI2O", name:"Visual Arts", type:"Open" },
      { code:"AMU2O", name:"Music", type:"Open" },
      { code:"ADA2O", name:"Drama", type:"Open" },
      { code:"AWR2O", name:"Media Arts", type:"Open" },
    ],
    "Physical Education": [
      { code:"PPL2O", name:"Health & Physical Education", type:"Open" },
    ],
    "Technology": [
      { code:"TGJ2O", name:"Communications Technology", type:"Open" },
      { code:"TMJ2O", name:"Manufacturing Technology", type:"Open" },
      { code:"TFJ2O", name:"Food & Nutrition", type:"Open" },
    ],
    "Business": [
      { code:"BAF3M", name:"Financial Accounting Fundamentals", type:"College/Univ." },
      { code:"BTA3O", name:"Computer Applications", type:"Open" },
    ],
    "Religion (DPCDSB)": [
      { code:"HRE2O", name:"Catholic Perspectives (Grade 10)", type:"Open" },
    ],
  },
  "Grade 11": {
    "English": [
      { code:"ENG3U", name:"English (University)", type:"University" },
      { code:"ENG3C", name:"English (College)", type:"College" },
      { code:"ENG3E", name:"English for Everyday Life (Workplace)", type:"Workplace" },
      { code:"NBE3U", name:"New Media (University)", type:"University" },
    ],
    "Mathematics": [
      { code:"MCR3U", name:"Functions (University)", type:"University" },
      { code:"MBF3C", name:"Foundations for College Mathematics (College)", type:"College" },
      { code:"MEL3E", name:"Mathematics for Work & Everyday Life (Workplace)", type:"Workplace" },
      { code:"MCF3M", name:"Functions & Applications (Univ./College)", type:"Univ./College" },
    ],
    "Science": [
      { code:"SBI3U", name:"Biology (University)", type:"University" },
      { code:"SCH3U", name:"Chemistry (University)", type:"University" },
      { code:"SPH3U", name:"Physics (University)", type:"University" },
      { code:"SES4U", name:"Earth & Space Science (University)", type:"University" },
      { code:"SVN3M", name:"Environmental Science (Univ./College)", type:"Univ./College" },
      { code:"SBI3C", name:"Biology (College)", type:"College" },
      { code:"SCH3C", name:"Chemistry (College)", type:"College" },
    ],
    "French": [
      { code:"FSF3U", name:"Core French (University)", type:"University" },
      { code:"FIF3U", name:"French Immersion (University)", type:"University" },
      { code:"FIF3O", name:"French Immersion (Open)", type:"Open" },
    ],
    "History / Social Sciences": [
      { code:"CHW3M", name:"World History to the End of the 15th Century (Univ./College)", type:"Univ./College" },
      { code:"CHI3U", name:"Canada: History, Identity & Culture (University)", type:"University" },
      { code:"CLN3U", name:"Canadian and International Law (University)", type:"University" },
      { code:"HSP3U", name:"Intro to Anthropology, Psychology & Sociology (University)", type:"University" },
      { code:"HSP3C", name:"Intro to Anthropology, Psychology & Sociology (College)", type:"College" },
      { code:"CIA3U", name:"Analysing Current Economic Issues (University)", type:"University" },
    ],
    "Arts": [
      { code:"AVI3M", name:"Visual Arts (Univ./College)", type:"Univ./College" },
      { code:"AMU3M", name:"Music (Univ./College)", type:"Univ./College" },
      { code:"ADA3M", name:"Drama (Univ./College)", type:"Univ./College" },
      { code:"AWR3M", name:"Media Arts (Univ./College)", type:"Univ./College" },
      { code:"ASM3M", name:"Studio Music (Univ./College)", type:"Univ./College" },
    ],
    "Physical Education / Health": [
      { code:"PPL3O", name:"Health & Physical Education", type:"Open" },
      { code:"PSK3U", name:"Introduction to Kinesiology (University)", type:"University" },
    ],
    "Technology": [
      { code:"TGJ3M", name:"Communications Technology (Univ./College)", type:"Univ./College" },
      { code:"TFJ3C", name:"Hospitality & Tourism (College)", type:"College" },
      { code:"TOJ3M", name:"Technological Design (Univ./College)", type:"Univ./College" },
      { code:"TCJ3C", name:"Construction Technology (College)", type:"College" },
    ],
    "Business": [
      { code:"BAF3M", name:"Financial Accounting Fundamentals (Univ./College)", type:"Univ./College" },
      { code:"BMI3C", name:"Marketing — Goods, Services & Events (College)", type:"College" },
      { code:"BTA3O", name:"Computer Applications (Open)", type:"Open" },
      { code:"BOH4M", name:"Business Leadership (Univ./College)", type:"Univ./College" },
    ],
    "Computer Studies": [
      { code:"ICS3U", name:"Introduction to Computer Science (University)", type:"University" },
      { code:"ICS3C", name:"Introduction to Computer Science (College)", type:"College" },
    ],
    "Religion (DPCDSB)": [
      { code:"HRE3O", name:"Catholic Perspectives (Grade 11)", type:"Open" },
      { code:"HZB3M", name:"Philosophy — Questions & Theories (Univ./College)", type:"Univ./College" },
    ],
  },
  "Grade 12": {
    "English": [
      { code:"ENG4U", name:"English (University)", type:"University" },
      { code:"ENG4C", name:"English (College)", type:"College" },
      { code:"ENG4E", name:"English for Everyday Life (Workplace)", type:"Workplace" },
      { code:"EWC4U", name:"The Writer's Craft (University)", type:"University" },
      { code:"OLC4O", name:"Ontario Secondary School Literacy Course", type:"Open" },
    ],
    "Mathematics": [
      { code:"MHF4U", name:"Advanced Functions (University)", type:"University" },
      { code:"MCV4U", name:"Calculus & Vectors (University)", type:"University" },
      { code:"MDM4U", name:"Mathematics of Data Management (University)", type:"University" },
      { code:"MAP4C", name:"Foundations for College Mathematics (College)", type:"College" },
      { code:"MEL4E", name:"Mathematics for Work & Everyday Life (Workplace)", type:"Workplace" },
      { code:"MCT4C", name:"Mathematics for College Technology (College)", type:"College" },
    ],
    "Science": [
      { code:"SBI4U", name:"Biology (University)", type:"University" },
      { code:"SCH4U", name:"Chemistry (University)", type:"University" },
      { code:"SPH4U", name:"Physics (University)", type:"University" },
      { code:"SES4U", name:"Earth & Space Science (University)", type:"University" },
      { code:"SVN4M", name:"Environmental Science (Univ./College)", type:"Univ./College" },
      { code:"SNC4M", name:"Science (Univ./College)", type:"Univ./College" },
      { code:"SBI4C", name:"Biology (College)", type:"College" },
      { code:"SCH4C", name:"Chemistry (College)", type:"College" },
    ],
    "French": [
      { code:"FSF4U", name:"Core French (University)", type:"University" },
      { code:"FIF4U", name:"French Immersion (University)", type:"University" },
      { code:"FRA4U", name:"French Language Arts (University)", type:"University" },
    ],
    "History / Social Sciences": [
      { code:"CHY4U", name:"World History Since the 15th Century (University)", type:"University" },
      { code:"CHI4U", name:"Canada: History, Identity & Culture (University)", type:"University" },
      { code:"CPW4U", name:"Canadian and World Politics (University)", type:"University" },
      { code:"CIA4U", name:"Analysing Current Economic Issues (University)", type:"University" },
      { code:"CLN4U", name:"Canadian and International Law (University)", type:"University" },
      { code:"HNB4M", name:"Navigating the Human Brain (Univ./College)", type:"Univ./College" },
      { code:"HZT4U", name:"Philosophy — The Big Questions (University)", type:"University" },
    ],
    "Arts": [
      { code:"AVI4M", name:"Visual Arts (Univ./College)", type:"Univ./College" },
      { code:"AWA4M", name:"World Arts & Cultures (Univ./College)", type:"Univ./College" },
      { code:"AMU4M", name:"Music (Univ./College)", type:"Univ./College" },
      { code:"ADA4M", name:"Drama (Univ./College)", type:"Univ./College" },
      { code:"AWR4M", name:"Media Arts (Univ./College)", type:"Univ./College" },
      { code:"ASM4M", name:"Studio Music (Univ./College)", type:"Univ./College" },
    ],
    "Physical Education / Health": [
      { code:"PPL4O", name:"Health & Physical Education", type:"Open" },
      { code:"PSK4U", name:"Kinesiology (University)", type:"University" },
      { code:"PAF4O", name:"Fitness & Lifestyle Management", type:"Open" },
    ],
    "Technology": [
      { code:"TGJ4M", name:"Communications Technology (Univ./College)", type:"Univ./College" },
      { code:"TFJ4C", name:"Hospitality & Tourism (College)", type:"College" },
      { code:"TOJ4M", name:"Technological Design (Univ./College)", type:"Univ./College" },
      { code:"TCJ4C", name:"Construction Technology (College)", type:"College" },
      { code:"TDJ4M", name:"Technological Design (Univ./College)", type:"Univ./College" },
    ],
    "Business": [
      { code:"BAT4M", name:"Financial Accounting Principles (Univ./College)", type:"Univ./College" },
      { code:"BBB4M", name:"International Business Fundamentals (Univ./College)", type:"Univ./College" },
      { code:"BOH4M", name:"Business Leadership (Univ./College)", type:"Univ./College" },
      { code:"BDI4C", name:"Entrepreneurship — The Venture (College)", type:"College" },
      { code:"BMX4E", name:"Marketing — The Digital World (Workplace)", type:"Workplace" },
    ],
    "Computer Studies": [
      { code:"ICS4U", name:"Computer Science (University)", type:"University" },
      { code:"ICS4C", name:"Computer Science (College)", type:"College" },
    ],
    "Cooperative Education": [
      { code:"COP4", name:"Cooperative Education (any subject — 1 credit)", type:"Open" },
      { code:"COPP4", name:"Cooperative Education (any subject — 2 credits)", type:"Open" },
    ],
    "Religion (DPCDSB)": [
      { code:"HRE4M", name:"Catholic Perspectives (Grade 12)", type:"Univ./College" },
      { code:"HZB4M", name:"The Examined Life — Philosophy (Univ./College)", type:"Univ./College" },
    ],
  },
};

export const SCHOOLS = [
  { id:"ascension",     name:"Ascension of Our Lord SS",            city:"Mississauga", emoji:"✝️"  },
  { id:"father_goetz",  name:"Father Michael Goetz SS",             city:"Mississauga", emoji:"🎓"  },
  { id:"iona",          name:"Iona Catholic SS",                    city:"Mississauga", emoji:"🌊"  },
  { id:"john_cabot",    name:"John Cabot Catholic SS",              city:"Mississauga", emoji:"⚓"  },
  { id:"loyola",        name:"Loyola Catholic SS",                  city:"Mississauga", emoji:"⚜️" },
  { id:"mount_carmel",  name:"Our Lady of Mount Carmel SS",         city:"Mississauga", emoji:"🏔️" },
  { id:"philip_pocock", name:"Philip Pocock Catholic SS",           city:"Mississauga", emoji:"📘"  },
  { id:"st_aloysius",   name:"St. Aloysius Gonzaga SS",             city:"Mississauga", emoji:"🌿"  },
  { id:"st_francis_x",  name:"St. Francis Xavier SS",              city:"Mississauga", emoji:"⚡"  },
  { id:"st_joan",       name:"St. Joan of Arc Catholic SS",         city:"Mississauga", emoji:"🗡️" },
  { id:"st_josephs",    name:"St. Joseph's SS",                    city:"Mississauga", emoji:"🕊️" },
  { id:"st_marcellinus",name:"St. Marcellinus SS",                  city:"Mississauga", emoji:"📖"  },
  { id:"st_martin",     name:"St. Martin SS",                      city:"Mississauga", emoji:"🌟"  },
  { id:"st_oscar",      name:"St. Oscar Romero Catholic SS",        city:"Mississauga", emoji:"☮️"  },
  { id:"st_paul",       name:"St. Paul SS",                        city:"Mississauga", emoji:"📜"  },
  { id:"cardinal_amb",  name:"Cardinal Ambrozic SS",               city:"Brampton",    emoji:"🔴"  },
  { id:"cardinal_leg",  name:"Cardinal Leger SS",                  city:"Brampton",    emoji:"🏛️" },
  { id:"holy_name",     name:"Holy Name of Mary SS",               city:"Brampton",    emoji:"🌸"  },
  { id:"notre_dame",    name:"Notre Dame Catholic SS",             city:"Brampton",    emoji:"🌹"  },
  { id:"st_augustine",  name:"St. Augustine Catholic SS",          city:"Brampton",    emoji:"📿"  },
  { id:"st_campion",    name:"St. Edmund Campion SS",              city:"Brampton",    emoji:"✏️"  },
  { id:"st_marguerite", name:"St. Marguerite d'Youville SS",       city:"Brampton",    emoji:"💙"  },
  { id:"st_roch",       name:"St. Roch Catholic SS",               city:"Brampton",    emoji:"🙏"  },
  { id:"st_thomas_aq",  name:"St. Thomas Aquinas SS",              city:"Brampton",    emoji:"🦁"  },
  { id:"rf_hall",       name:"Robert F. Hall Catholic SS",         city:"Caledon",     emoji:"🍁"  },
  { id:"st_michael_bol",name:"St. Michael Catholic SS",            city:"Caledon",     emoji:"⚔️"  },
];

export const MOCK_MENTORS = [
  { id:1, name:"Aisha Mahmoud",    year:"Grade 12", initials:"AM", avatarColor:0, subjects:["MHF4U","MCV4U","SCH4U"], rating:4.9, sessions:38, available:true,  bio:"Scored 95+ in all Grade 12 maths. I know every exam style at DPCDSB and I'll help you get there too." },
  { id:2, name:"Ryan Patel",       year:"Grade 11", initials:"RP", avatarColor:1, subjects:["SCH4U","SBI4U","SPH4U"], rating:4.8, sessions:22, available:true,  bio:"Pre-med track, top of class in sciences. Reactions, genetics, and circuits — I'll explain them clearly." },
  { id:3, name:"Sophie Tremblay",  year:"Grade 12", initials:"ST", avatarColor:2, subjects:["ENG4U","EWC4U","FIF4U"], rating:5.0, sessions:45, available:false, bio:"Literary mag editor and French Immersion student. Essays, literary analysis, and French writing are my thing." },
  { id:4, name:"Karan Dhaliwal",   year:"Grade 12", initials:"KD", avatarColor:3, subjects:["ICS4U","ICS3U","MDM4U"], rating:4.7, sessions:19, available:true,  bio:"CS club founder. I'll walk you through every ICS4U topic — OOP, recursion, and algorithms in plain English." },
  { id:5, name:"Emma Beausoleil",  year:"Grade 12", initials:"EB", avatarColor:4, subjects:["FIF4U","FSF4U","ENG4U"], rating:4.9, sessions:31, available:true,  bio:"French Immersion from Grade 1. Let me help you actually think in French, not just translate from English." },
  { id:6, name:"James Okafor",     year:"Grade 11", initials:"JO", avatarColor:5, subjects:["SPH3U","SPH4U","MCV4U"], rating:4.8, sessions:17, available:true,  bio:"Physics and calculus together make total sense — I'll show you the connection that makes both courses easy." },
];
