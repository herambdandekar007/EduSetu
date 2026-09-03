/**
 * DashboardLanguageContext — Full dashboard auto-translation
 *
 * Same approach as LanguageContext.tsx from Project 1 but:
 * 1. Supports 6 Indian languages (EN, HI, MR, TA, TE, GU)
 * 2. Covers all dashboard pages — Jobs, Schemes, Mentors,
 *    Community, Profile, Settings, Achievements, Education, Nearby
 * 3. Uses Google Translate free API (no API key needed)
 * 4. Translates text nodes directly on the DOM (same as original)
 * 5. Caches translations so switching back is instant
 * 6. Shows progress bar and toast while translating
 */

import React, {
  createContext, useContext, useState,
  useEffect, useRef, useCallback, ReactNode,
} from "react";

// ── Supported Languages ────────────────────────────────────────────────────
export type DashboardLanguage =
  | "English"
  | "Hindi"
  | "Marathi"
  | "Tamil"
  | "Telugu"
  | "Gujarati";

const LANG_CODE: Record<DashboardLanguage, string> = {
  English:  "en",
  Hindi:    "hi",
  Marathi:  "mr",
  Tamil:    "ta",
  Telugu:   "te",
  Gujarati: "gu",
};

export const LANG_FLAGS: Record<DashboardLanguage, string> = {
  English:  "🇬🇧",
  Hindi:    "🇮🇳",
  Marathi:  "🇮🇳",
  Tamil:    "🇮🇳",
  Telugu:   "🇮🇳",
  Gujarati: "🇮🇳",
};

export const LANG_NATIVE: Record<DashboardLanguage, string> = {
  English:  "English",
  Hindi:    "हिंदी",
  Marathi:  "मराठी",
  Tamil:    "தமிழ்",
  Telugu:   "తెలుగు",
  Gujarati: "ગુજરાતી",
};

// ── Context Shape ──────────────────────────────────────────────────────────
interface DashboardLanguageContextType {
  language: DashboardLanguage;
  setLanguage: (lang: DashboardLanguage) => void;
  td: (key: string) => string;        // translate by key (static)
  isTranslating: boolean;
  langCode: string;                   // e.g. "hi", "mr", "ta"
}

const DashboardLanguageContext = createContext<DashboardLanguageContextType | undefined>(undefined);

// ══════════════════════════════════════════════════════════════════════════
// STATIC TRANSLATIONS — Dashboard UI strings
// All pages: Dashboard, Jobs, Schemes, Mentors, Community,
//            Profile, Settings, Achievements, Education, Nearby
// ══════════════════════════════════════════════════════════════════════════
const dashboardTranslations: Record<DashboardLanguage, Record<string, string>> = {

  // ── English (base) ──────────────────────────────────────────────────────
  English: {
    // ── Sidebar ──────────────────────────────────────────────
    "sidebar.dashboard":        "Dashboard",
    "sidebar.profile":          "Profile",
    "sidebar.jobs":             "Job Matches",
    "sidebar.schemes":          "Scheme Eligibility",
    "sidebar.education":        "Education",
    "sidebar.nearby":           "Nearby Services",
    "sidebar.community":        "Community",
    "sidebar.mentors":          "Mentors",
    "sidebar.achievements":     "Achievements",
    "sidebar.accessibility":    "Accessibility",
    "sidebar.admin":            "Admin Panel",
    "sidebar.settings":         "Settings",
    "sidebar.profile_strength": "Profile Strength",

    // ── TopBar ───────────────────────────────────────────────
    "topbar.search":            "Search jobs, schemes, or ask AI...",
    "topbar.translate":         "Translate",

    // ── Dashboard Home ───────────────────────────────────────
    "dashboard.good_morning":   "Good morning",
    "dashboard.good_afternoon": "Good afternoon",
    "dashboard.good_evening":   "Good evening",
    "dashboard.welcome_back":   "Welcome back",
    "dashboard.ai_ready":       "Your AI assistant is ready — let's find your next opportunity.",
    "dashboard.ai_active":      "AI Active",
    "dashboard.profile_pct":    "Profile",
    "dashboard.smart_recs":     "Smart Recommendations",
    "dashboard.skill_gap":      "Skill Gap Analyzer",
    "dashboard.recent_alerts":  "Recent Alerts",
    "dashboard.view_all":       "View All",

    // ── Smart Recommendations ────────────────────────────────
    "recs.title":               "Personalized For You",
    "recs.subtitle":            "AI-powered matches based on your profile",
    "recs.job":                 "Job",
    "recs.scheme":              "Scheme",
    "recs.course":              "Course",
    "recs.match":               "Match",
    "recs.apply_now":           "Apply Now",
    "recs.check_eligibility":   "Check Eligibility",
    "recs.start_learning":      "Start Learning",
    "recs.loading":             "Finding your best matches...",
    "recs.no_profile":          "Complete your profile to get personalized recommendations",

    // ── Skill Gap Analyzer ───────────────────────────────────
    "skill.title":              "Skill Gap Analyzer",
    "skill.subtitle":           "Find out what skills you need for your dream job",
    "skill.target_job":         "Enter your target job role...",
    "skill.analyze":            "Analyze My Skills",
    "skill.analyzing":          "Analyzing...",
    "skill.current":            "Current",
    "skill.target":             "Target",
    "skill.gap":                "Gap",
    "skill.on_track":           "On Track",
    "skill.complete":           "Complete",
    "skill.overall":            "Overall Readiness",
    "skill.insight":            "Career Insight",
    "skill.no_result":          "Enter a job role above and click Analyze",

    // ── Recent Alerts ────────────────────────────────────────
    "alerts.title":             "Recent Alerts",
    "alerts.new_job":           "New job match",
    "alerts.scheme_deadline":   "Scheme deadline approaching",
    "alerts.profile_tip":       "Profile completion tip",
    "alerts.no_alerts":         "No new alerts",

    // ── Jobs Page ────────────────────────────────────────────
    "jobs.title":               "Job Matches",
    "jobs.subtitle":            "AI-powered jobs suited to your abilities",
    "jobs.search":              "Search jobs...",
    "jobs.ai_match":            "AI Match",
    "jobs.apply":               "Apply Now",
    "jobs.save":                "Save Job",
    "jobs.share":               "Share",
    "jobs.saved":               "Saved",
    "jobs.loading":             "Finding jobs for you...",
    "jobs.no_jobs":             "No jobs found. Try a different search.",
    "jobs.reasons":             "Why this matches you",
    "jobs.missing_skills":      "Skills to develop",
    "jobs.location":            "Location",
    "jobs.type":                "Job Type",
    "jobs.salary":              "Salary",
    "jobs.posted":              "Posted",
    "jobs.full_time":           "Full Time",
    "jobs.part_time":           "Part Time",
    "jobs.remote":              "Remote",
    "jobs.hybrid":              "Hybrid",
    "jobs.government":          "Government",
    "jobs.private":             "Private",
    "jobs.ngo":                 "NGO",
    "jobs.freelance":           "Freelance",
    "jobs.get_ai_matches":      "Get AI Match Scores",

    // ── Schemes Page ─────────────────────────────────────────
    "schemes.title":            "Scheme Eligibility",
    "schemes.subtitle":         "Check which government schemes you qualify for",
    "schemes.check":            "Check My Eligibility",
    "schemes.checking":         "Checking eligibility...",
    "schemes.eligible":         "Eligible",
    "schemes.not_eligible":     "Not Eligible",
    "schemes.confidence":       "Confidence",
    "schemes.ministry":         "Ministry",
    "schemes.what_to_do":       "What to do next",
    "schemes.total_eligible":   "Total Eligible",
    "schemes.summary":          "AI Summary",
    "schemes.apply_now":        "Apply Now",
    "schemes.loading":          "Loading schemes...",
    "schemes.no_schemes":       "No schemes found",

    // ── Education Page ───────────────────────────────────────
    "education.title":          "Education & Courses",
    "education.subtitle":       "Courses and training programs for your growth",
    "education.search":         "Search courses...",
    "education.enroll":         "Enroll Now",
    "education.free":           "Free",
    "education.paid":           "Paid",
    "education.duration":       "Duration",
    "education.provider":       "Provider",
    "education.level":          "Level",
    "education.beginner":       "Beginner",
    "education.intermediate":   "Intermediate",
    "education.advanced":       "Advanced",
    "education.loading":        "Loading courses...",
    "education.no_courses":     "No courses found",
    "education.certificate":    "Certificate",
    "education.skills_taught":  "Skills You Will Learn",

    // ── Nearby Page ──────────────────────────────────────────
    "nearby.title":             "Nearby Services",
    "nearby.subtitle":          "Find disability services near your location",
    "nearby.hospital":          "Hospitals",
    "nearby.rehab":             "Rehabilitation Centers",
    "nearby.school":            "Special Schools",
    "nearby.office":            "Disability Offices",
    "nearby.loading":           "Finding services near you...",
    "nearby.no_services":       "No services found nearby",
    "nearby.get_directions":    "Get Directions",
    "nearby.call":              "Call",
    "nearby.distance":          "Distance",
    "nearby.open_now":          "Open Now",
    "nearby.closed":            "Closed",

    // ── Mentors Page ─────────────────────────────────────────
    "mentors.title":            "AI Mentor Matching",
    "mentors.subtitle":         "Connect with mentors who understand your journey",
    "mentors.request":          "Request Mentorship",
    "mentors.career_goal":      "Your Career Goal",
    "mentors.career_goal_ph":   "e.g. Become a Full Stack Developer",
    "mentors.message":          "Message to Mentor",
    "mentors.message_ph":       "Tell them about yourself and why you'd like their guidance...",
    "mentors.send":             "Send Request",
    "mentors.available":        "Available",
    "mentors.busy":             "Busy",
    "mentors.unavailable":      "Unavailable",
    "mentors.sessions":         "sessions",
    "mentors.match":            "Match",
    "mentors.expertise":        "Expertise",
    "mentors.loading":          "Finding mentors...",
    "mentors.no_mentors":       "No mentors available right now",
    "mentors.request_sent":     "Mentor request sent! They'll respond soon.",
    "mentors.ai_powered":       "AI-Powered",

    // ── Community Page ───────────────────────────────────────
    "community.title":          "Community Forum",
    "community.subtitle":       "Share experiences and support each other",
    "community.new_post":       "New Post",
    "community.post_title":     "Post Title",
    "community.post_content":   "What's on your mind?",
    "community.post":           "Post",
    "community.reply":          "Reply",
    "community.replies":        "replies",
    "community.likes":          "likes",
    "community.loading":        "Loading community posts...",
    "community.no_posts":       "No posts yet. Be the first to share!",
    "community.share":          "Share your experience",
    "community.tags":           "Tags",

    // ── Profile Page ─────────────────────────────────────────
    "profile.title":            "My Profile",
    "profile.subtitle":         "Manage your personal information",
    "profile.full_name":        "Full Name",
    "profile.email":            "Email Address",
    "profile.city":             "City",
    "profile.disability_type":  "Disability Type",
    "profile.education_level":  "Education Level",
    "profile.skills":           "Your Skills",
    "profile.add_skill":        "Add a skill...",
    "profile.save":             "Save Profile",
    "profile.saving":           "Saving...",
    "profile.saved":            "Profile saved successfully!",
    "profile.completion":       "Profile Completion",
    "profile.bio":              "Bio",
    "profile.bio_ph":           "Tell employers about yourself...",
    "profile.resume_score":     "Get AI Resume Score",
    "profile.analyzing":        "Analyzing profile...",
    "profile.score":            "Profile Score",
    "profile.strengths":        "Your Strengths",
    "profile.improvements":     "Areas to Improve",
    "profile.pwdtips":          "PWD Career Tips",

    // ── Settings Page ────────────────────────────────────────
    "settings.title":           "Settings",
    "settings.subtitle":        "Manage your account preferences",
    "settings.notifications":   "Notifications",
    "settings.notifications_desc": "Receive job alerts and scheme deadlines",
    "settings.privacy":         "Privacy",
    "settings.privacy_desc":    "Control who sees your profile",
    "settings.language":        "Language",
    "settings.language_desc":   "Choose your preferred language",
    "settings.accessibility":   "Accessibility Settings",
    "settings.logout":          "Sign Out",
    "settings.logout_confirm":  "Are you sure you want to sign out?",
    "settings.danger_zone":     "Danger Zone",
    "settings.delete_account":  "Delete Account",

    // ── Achievements Page ────────────────────────────────────
    "achievements.title":       "Achievements",
    "achievements.subtitle":    "Your progress and milestones",
    "achievements.points":      "Total Points",
    "achievements.level":       "Current Level",
    "achievements.badges":      "Badges Earned",
    "achievements.leaderboard": "Leaderboard",
    "achievements.rank":        "Your Rank",
    "achievements.keep_going":  "Keep going to earn more badges!",
    "achievements.loading":     "Loading achievements...",
    "achievements.beginner":    "Beginner",
    "achievements.intermediate":"Intermediate",
    "achievements.advanced":    "Advanced",
    "achievements.expert":      "Expert",

    // ── Admin Page ───────────────────────────────────────────
    "admin.title":              "Admin Panel",
    "admin.subtitle":           "Manage platform content and users",
    "admin.add_job":            "Add New Job",
    "admin.add_scheme":         "Add New Scheme",
    "admin.add_course":         "Add New Course",
    "admin.users":              "Total Users",
    "admin.jobs":               "Total Jobs",
    "admin.schemes":            "Total Schemes",
    "admin.loading":            "Loading admin data...",

    // ── Accessibility Page ───────────────────────────────────
    "access.title":             "Accessibility Settings",
    "access.subtitle":          "Customize your experience",
    "access.font_size":         "Font Size",
    "access.high_contrast":     "High Contrast Mode",
    "access.dyslexia":          "Dyslexia Friendly Font",
    "access.reduce_motion":     "Reduce Animations",
    "access.reading_guide":     "Reading Guide Line",
    "access.gesture":           "Hand Gesture Control",
    "access.sign_language":     "Sign Language Detector",
    "access.on":                "On",
    "access.off":               "Off",
    "access.save":              "Save Preferences",

    // ── Common ───────────────────────────────────────────────
    "common.loading":           "Loading...",
    "common.error":             "Something went wrong. Please try again.",
    "common.save":              "Save",
    "common.cancel":            "Cancel",
    "common.close":             "Close",
    "common.back":              "Back",
    "common.next":              "Next",
    "common.search":            "Search",
    "common.filter":            "Filter",
    "common.clear":             "Clear",
    "common.submit":            "Submit",
    "common.view_more":         "View More",
    "common.show_less":         "Show Less",
    "common.no_data":           "No data available",
    "common.ai_powered":        "AI Powered",
    "common.free":              "Free",
    "common.new":               "New",
  },

  // ── Hindi ────────────────────────────────────────────────────────────────
  Hindi: {
    "sidebar.dashboard":        "डैशबोर्ड",
    "sidebar.profile":          "प्रोफ़ाइल",
    "sidebar.jobs":             "नौकरी मैच",
    "sidebar.schemes":          "योजना पात्रता",
    "sidebar.education":        "शिक्षा",
    "sidebar.nearby":           "नजदीकी सेवाएं",
    "sidebar.community":        "समुदाय",
    "sidebar.mentors":          "मेंटर",
    "sidebar.achievements":     "उपलब्धियां",
    "sidebar.accessibility":    "सुलभता",
    "sidebar.admin":            "एडमिन पैनल",
    "sidebar.settings":         "सेटिंग्स",
    "sidebar.profile_strength": "प्रोफ़ाइल शक्ति",
    "topbar.search":            "नौकरी, योजना खोजें या AI से पूछें...",
    "topbar.translate":         "अनुवाद",
    "dashboard.good_morning":   "सुप्रभात",
    "dashboard.good_afternoon": "नमस्ते",
    "dashboard.good_evening":   "शुभ संध्या",
    "dashboard.welcome_back":   "वापस स्वागत है",
    "dashboard.ai_ready":       "आपका AI सहायक तैयार है — अगला अवसर खोजें।",
    "dashboard.ai_active":      "AI सक्रिय",
    "dashboard.profile_pct":    "प्रोफ़ाइल",
    "dashboard.smart_recs":     "स्मार्ट सिफारिशें",
    "dashboard.skill_gap":      "कौशल अंतर विश्लेषक",
    "dashboard.recent_alerts":  "हाल की अलर्ट",
    "dashboard.view_all":       "सभी देखें",
    "recs.title":               "आपके लिए व्यक्तिगत",
    "recs.subtitle":            "आपकी प्रोफ़ाइल के आधार पर AI मैच",
    "recs.job":                 "नौकरी",
    "recs.scheme":              "योजना",
    "recs.course":              "कोर्स",
    "recs.match":               "मैच",
    "recs.apply_now":           "अभी आवेदन करें",
    "recs.check_eligibility":   "पात्रता जांचें",
    "recs.start_learning":      "सीखना शुरू करें",
    "recs.loading":             "आपके सर्वोत्तम मैच खोज रहे हैं...",
    "recs.no_profile":          "व्यक्तिगत सुझाव पाने के लिए प्रोफ़ाइल पूरी करें",
    "skill.title":              "कौशल अंतर विश्लेषक",
    "skill.subtitle":           "अपने सपने की नौकरी के लिए जरूरी कौशल जानें",
    "skill.target_job":         "लक्ष्य नौकरी दर्ज करें...",
    "skill.analyze":            "मेरे कौशल का विश्लेषण करें",
    "skill.analyzing":          "विश्लेषण हो रहा है...",
    "skill.current":            "वर्तमान",
    "skill.target":             "लक्ष्य",
    "skill.gap":                "अंतर",
    "skill.on_track":           "सही रास्ते पर",
    "skill.complete":           "पूर्ण",
    "skill.overall":            "कुल तैयारी",
    "skill.insight":            "करियर सलाह",
    "skill.no_result":          "ऊपर नौकरी का रोल दर्ज करें और विश्लेषण करें",
    "alerts.title":             "हाल की अलर्ट",
    "alerts.new_job":           "नई नौकरी मैच",
    "alerts.scheme_deadline":   "योजना की समय सीमा नजदीक",
    "alerts.profile_tip":       "प्रोफ़ाइल सुझाव",
    "alerts.no_alerts":         "कोई नई अलर्ट नहीं",
    "jobs.title":               "नौकरी मैच",
    "jobs.subtitle":            "आपकी क्षमताओं के अनुसार AI-संचालित नौकरियां",
    "jobs.search":              "नौकरियां खोजें...",
    "jobs.ai_match":            "AI मैच",
    "jobs.apply":               "अभी आवेदन करें",
    "jobs.save":                "नौकरी सहेजें",
    "jobs.share":               "शेयर करें",
    "jobs.saved":               "सहेजा गया",
    "jobs.loading":             "आपके लिए नौकरियां खोज रहे हैं...",
    "jobs.no_jobs":             "कोई नौकरी नहीं मिली।",
    "jobs.reasons":             "यह आपसे क्यों मेल खाती है",
    "jobs.missing_skills":      "विकसित करने योग्य कौशल",
    "jobs.location":            "स्थान",
    "jobs.type":                "नौकरी का प्रकार",
    "jobs.salary":              "वेतन",
    "jobs.posted":              "प्रकाशित",
    "jobs.full_time":           "पूर्णकालिक",
    "jobs.part_time":           "अंशकालिक",
    "jobs.remote":              "रिमोट",
    "jobs.hybrid":              "हाइब्रिड",
    "jobs.government":          "सरकारी",
    "jobs.private":             "निजी",
    "jobs.ngo":                 "NGO",
    "jobs.freelance":           "फ्रीलांस",
    "jobs.get_ai_matches":      "AI मैच स्कोर प्राप्त करें",
    "schemes.title":            "योजना पात्रता",
    "schemes.subtitle":         "जांचें आप किन सरकारी योजनाओं के लिए पात्र हैं",
    "schemes.check":            "मेरी पात्रता जांचें",
    "schemes.checking":         "पात्रता जांच रहे हैं...",
    "schemes.eligible":         "पात्र",
    "schemes.not_eligible":     "अपात्र",
    "schemes.confidence":       "विश्वास",
    "schemes.ministry":         "मंत्रालय",
    "schemes.what_to_do":       "अगला कदम",
    "schemes.total_eligible":   "कुल पात्र",
    "schemes.summary":          "AI सारांश",
    "schemes.apply_now":        "अभी आवेदन करें",
    "schemes.loading":          "योजनाएं लोड हो रही हैं...",
    "schemes.no_schemes":       "कोई योजना नहीं मिली",
    "education.title":          "शिक्षा और कोर्स",
    "education.subtitle":       "आपकी वृद्धि के लिए कोर्स और प्रशिक्षण",
    "education.search":         "कोर्स खोजें...",
    "education.enroll":         "अभी नामांकन करें",
    "education.free":           "मुफ्त",
    "education.paid":           "भुगतान",
    "education.duration":       "अवधि",
    "education.provider":       "प्रदाता",
    "education.level":          "स्तर",
    "education.beginner":       "शुरुआती",
    "education.intermediate":   "मध्यम",
    "education.advanced":       "उन्नत",
    "education.loading":        "कोर्स लोड हो रहे हैं...",
    "education.no_courses":     "कोई कोर्स नहीं मिला",
    "education.certificate":    "प्रमाण पत्र",
    "education.skills_taught":  "आप जो कौशल सीखेंगे",
    "nearby.title":             "नजदीकी सेवाएं",
    "nearby.subtitle":          "अपने स्थान के पास दिव्यांग सेवाएं खोजें",
    "nearby.hospital":          "अस्पताल",
    "nearby.rehab":             "पुनर्वास केंद्र",
    "nearby.school":            "विशेष विद्यालय",
    "nearby.office":            "दिव्यांग कार्यालय",
    "nearby.loading":           "आपके पास सेवाएं खोज रहे हैं...",
    "nearby.no_services":       "पास में कोई सेवा नहीं मिली",
    "nearby.get_directions":    "दिशा-निर्देश पाएं",
    "nearby.call":              "कॉल करें",
    "nearby.distance":          "दूरी",
    "nearby.open_now":          "अभी खुला",
    "nearby.closed":            "बंद",
    "mentors.title":            "AI मेंटर मैचिंग",
    "mentors.subtitle":         "उन मेंटर से जुड़ें जो आपकी यात्रा समझते हैं",
    "mentors.request":          "मेंटरशिप अनुरोध करें",
    "mentors.career_goal":      "आपका करियर लक्ष्य",
    "mentors.career_goal_ph":   "जैसे: फुल स्टैक डेवलपर बनना",
    "mentors.message":          "मेंटर को संदेश",
    "mentors.message_ph":       "अपने बारे में बताएं...",
    "mentors.send":             "अनुरोध भेजें",
    "mentors.available":        "उपलब्ध",
    "mentors.busy":             "व्यस्त",
    "mentors.unavailable":      "अनुपलब्ध",
    "mentors.sessions":         "सत्र",
    "mentors.match":            "मैच",
    "mentors.expertise":        "विशेषज्ञता",
    "mentors.loading":          "मेंटर खोज रहे हैं...",
    "mentors.no_mentors":       "अभी कोई मेंटर उपलब्ध नहीं",
    "mentors.request_sent":     "मेंटरशिप अनुरोध भेजा गया!",
    "mentors.ai_powered":       "AI-संचालित",
    "community.title":          "सामुदायिक मंच",
    "community.subtitle":       "अनुभव साझा करें और एक-दूसरे को सहारा दें",
    "community.new_post":       "नई पोस्ट",
    "community.post_title":     "पोस्ट शीर्षक",
    "community.post_content":   "आपके मन में क्या है?",
    "community.post":           "पोस्ट करें",
    "community.reply":          "जवाब दें",
    "community.replies":        "जवाब",
    "community.likes":          "पसंद",
    "community.loading":        "पोस्ट लोड हो रहे हैं...",
    "community.no_posts":       "अभी कोई पोस्ट नहीं।",
    "community.share":          "अपना अनुभव साझा करें",
    "community.tags":           "टैग",
    "profile.title":            "मेरी प्रोफ़ाइल",
    "profile.subtitle":         "अपनी व्यक्तिगत जानकारी प्रबंधित करें",
    "profile.full_name":        "पूरा नाम",
    "profile.email":            "ईमेल पता",
    "profile.city":             "शहर",
    "profile.disability_type":  "दिव्यांगता का प्रकार",
    "profile.education_level":  "शिक्षा स्तर",
    "profile.skills":           "आपके कौशल",
    "profile.add_skill":        "कौशल जोड़ें...",
    "profile.save":             "प्रोफ़ाइल सहेजें",
    "profile.saving":           "सहेज रहे हैं...",
    "profile.saved":            "प्रोफ़ाइल सफलतापूर्वक सहेजी गई!",
    "profile.completion":       "प्रोफ़ाइल पूर्णता",
    "profile.bio":              "परिचय",
    "profile.bio_ph":           "नियोक्ताओं को अपने बारे में बताएं...",
    "profile.resume_score":     "AI रिज्यूमे स्कोर पाएं",
    "profile.analyzing":        "प्रोफ़ाइल का विश्लेषण हो रहा है...",
    "profile.score":            "प्रोफ़ाइल स्कोर",
    "profile.strengths":        "आपकी ताकत",
    "profile.improvements":     "सुधार के क्षेत्र",
    "profile.pwdtips":          "दिव्यांग करियर सुझाव",
    "settings.title":           "सेटिंग्स",
    "settings.subtitle":        "अपनी खाता प्राथमिकताएं प्रबंधित करें",
    "settings.notifications":   "सूचनाएं",
    "settings.notifications_desc":"नौकरी अलर्ट और योजना समय सीमा प्राप्त करें",
    "settings.privacy":         "गोपनीयता",
    "settings.privacy_desc":    "नियंत्रित करें कौन आपकी प्रोफ़ाइल देखे",
    "settings.language":        "भाषा",
    "settings.language_desc":   "अपनी पसंदीदा भाषा चुनें",
    "settings.accessibility":   "सुलभता सेटिंग्स",
    "settings.logout":          "साइन आउट",
    "settings.logout_confirm":  "क्या आप साइन आउट करना चाहते हैं?",
    "settings.danger_zone":     "खतरा क्षेत्र",
    "settings.delete_account":  "खाता हटाएं",
    "achievements.title":       "उपलब्धियां",
    "achievements.subtitle":    "आपकी प्रगति और मील के पत्थर",
    "achievements.points":      "कुल अंक",
    "achievements.level":       "वर्तमान स्तर",
    "achievements.badges":      "अर्जित बैज",
    "achievements.leaderboard": "लीडरबोर्ड",
    "achievements.rank":        "आपकी रैंक",
    "achievements.keep_going":  "और बैज कमाने के लिए आगे बढ़ें!",
    "achievements.loading":     "उपलब्धियां लोड हो रही हैं...",
    "achievements.beginner":    "शुरुआती",
    "achievements.intermediate":"मध्यम",
    "achievements.advanced":    "उन्नत",
    "achievements.expert":      "विशेषज्ञ",
    "admin.title":              "एडमिन पैनल",
    "admin.subtitle":           "प्लेटफॉर्म सामग्री और उपयोगकर्ता प्रबंधित करें",
    "admin.add_job":            "नई नौकरी जोड़ें",
    "admin.add_scheme":         "नई योजना जोड़ें",
    "admin.add_course":         "नया कोर्स जोड़ें",
    "admin.users":              "कुल उपयोगकर्ता",
    "admin.jobs":               "कुल नौकरियां",
    "admin.schemes":            "कुल योजनाएं",
    "admin.loading":            "एडमिन डेटा लोड हो रहा है...",
    "access.title":             "सुलभता सेटिंग्स",
    "access.subtitle":          "अपना अनुभव अनुकूलित करें",
    "access.font_size":         "फॉन्ट आकार",
    "access.high_contrast":     "उच्च कंट्रास्ट मोड",
    "access.dyslexia":          "डिस्लेक्सिया अनुकूल फॉन्ट",
    "access.reduce_motion":     "एनिमेशन कम करें",
    "access.reading_guide":     "पढ़ने की गाइड लाइन",
    "access.gesture":           "हाथ के इशारे से नियंत्रण",
    "access.sign_language":     "सांकेतिक भाषा डिटेक्टर",
    "access.on":                "चालू",
    "access.off":               "बंद",
    "access.save":              "प्राथमिकताएं सहेजें",
    "common.loading":           "लोड हो रहा है...",
    "common.error":             "कुछ गलत हुआ। कृपया फिर से प्रयास करें।",
    "common.save":              "सहेजें",
    "common.cancel":            "रद्द करें",
    "common.close":             "बंद करें",
    "common.back":              "वापस",
    "common.next":              "अगला",
    "common.search":            "खोजें",
    "common.filter":            "फ़िल्टर",
    "common.clear":             "साफ करें",
    "common.submit":            "जमा करें",
    "common.view_more":         "और देखें",
    "common.show_less":         "कम दिखाएं",
    "common.no_data":           "कोई डेटा उपलब्ध नहीं",
    "common.ai_powered":        "AI संचालित",
    "common.free":              "मुफ्त",
    "common.new":               "नया",
  },

  // ── Marathi ──────────────────────────────────────────────────────────────
  Marathi: {
    "sidebar.dashboard":        "डॅशबोर्ड",
    "sidebar.profile":          "प्रोफाइल",
    "sidebar.jobs":             "नोकरी जुळणी",
    "sidebar.schemes":          "योजना पात्रता",
    "sidebar.education":        "शिक्षण",
    "sidebar.nearby":           "जवळच्या सेवा",
    "sidebar.community":        "समुदाय",
    "sidebar.mentors":          "मार्गदर्शक",
    "sidebar.achievements":     "उपलब्धी",
    "sidebar.accessibility":    "सुलभता",
    "sidebar.admin":            "अॅडमिन पॅनेल",
    "sidebar.settings":         "सेटिंग्ज",
    "sidebar.profile_strength": "प्रोफाइल शक्ती",
    "topbar.search":            "नोकरी, योजना शोधा किंवा AI ला विचारा...",
    "topbar.translate":         "भाषांतर",
    "dashboard.good_morning":   "सुप्रभात",
    "dashboard.good_afternoon": "नमस्कार",
    "dashboard.good_evening":   "शुभ संध्याकाळ",
    "dashboard.welcome_back":   "पुन्हा स्वागत",
    "dashboard.ai_ready":       "तुमचा AI सहाय्यक तयार आहे — पुढील संधी शोधूया.",
    "dashboard.ai_active":      "AI सक्रिय",
    "dashboard.profile_pct":    "प्रोफाइल",
    "dashboard.smart_recs":     "स्मार्ट शिफारसी",
    "dashboard.skill_gap":      "कौशल्य अंतर विश्लेषक",
    "dashboard.recent_alerts":  "अलीकडील सूचना",
    "dashboard.view_all":       "सर्व पहा",
    "recs.title":               "तुमच्यासाठी वैयक्तिक",
    "recs.subtitle":            "तुमच्या प्रोफाइलवर आधारित AI जुळणी",
    "recs.job":                 "नोकरी",
    "recs.scheme":              "योजना",
    "recs.course":              "अभ्यासक्रम",
    "recs.match":               "जुळणी",
    "recs.apply_now":           "आता अर्ज करा",
    "recs.check_eligibility":   "पात्रता तपासा",
    "recs.start_learning":      "शिकणे सुरू करा",
    "recs.loading":             "तुमच्या सर्वोत्तम जुळण्या शोधत आहोत...",
    "recs.no_profile":          "वैयक्तिक शिफारसींसाठी प्रोफाइल पूर्ण करा",
    "skill.title":              "कौशल्य अंतर विश्लेषक",
    "skill.subtitle":           "स्वप्नातील नोकरीसाठी आवश्यक कौशल्ये जाणून घ्या",
    "skill.target_job":         "लक्ष्य नोकरी प्रविष्ट करा...",
    "skill.analyze":            "माझ्या कौशल्यांचे विश्लेषण करा",
    "skill.analyzing":          "विश्लेषण होत आहे...",
    "skill.current":            "सध्याचे",
    "skill.target":             "लक्ष्य",
    "skill.gap":                "अंतर",
    "skill.on_track":           "योग्य मार्गावर",
    "skill.complete":           "पूर्ण",
    "skill.overall":            "एकूण तयारी",
    "skill.insight":            "करिअर सल्ला",
    "skill.no_result":          "वर नोकरीची भूमिका प्रविष्ट करा आणि विश्लेषण करा",
    "alerts.title":             "अलीकडील सूचना",
    "alerts.new_job":           "नवीन नोकरी जुळणी",
    "alerts.scheme_deadline":   "योजनेची अंतिम मुदत जवळ",
    "alerts.profile_tip":       "प्रोफाइल सुधारणा सूचना",
    "alerts.no_alerts":         "कोणत्याही नवीन सूचना नाहीत",
    "jobs.title":               "नोकरी जुळणी",
    "jobs.subtitle":            "तुमच्या क्षमतांनुसार AI-शक्तीच्या नोकऱ्या",
    "jobs.search":              "नोकऱ्या शोधा...",
    "jobs.ai_match":            "AI जुळणी",
    "jobs.apply":               "आता अर्ज करा",
    "jobs.save":                "नोकरी जतन करा",
    "jobs.share":               "शेअर करा",
    "jobs.saved":               "जतन केले",
    "jobs.loading":             "तुमच्यासाठी नोकऱ्या शोधत आहोत...",
    "jobs.no_jobs":             "कोणतीही नोकरी सापडली नाही.",
    "jobs.reasons":             "हे तुम्हाला का जुळते",
    "jobs.missing_skills":      "विकसित करायची कौशल्ये",
    "jobs.location":            "स्थान",
    "jobs.type":                "नोकरीचा प्रकार",
    "jobs.salary":              "पगार",
    "jobs.posted":              "प्रकाशित",
    "jobs.full_time":           "पूर्णवेळ",
    "jobs.part_time":           "अर्धवेळ",
    "jobs.remote":              "रिमोट",
    "jobs.hybrid":              "हायब्रिड",
    "jobs.government":          "सरकारी",
    "jobs.private":             "खाजगी",
    "jobs.ngo":                 "NGO",
    "jobs.freelance":           "फ्रीलान्स",
    "jobs.get_ai_matches":      "AI जुळणी स्कोर मिळवा",
    "schemes.title":            "योजना पात्रता",
    "schemes.subtitle":         "कोणत्या सरकारी योजनांसाठी तुम्ही पात्र आहात ते तपासा",
    "schemes.check":            "माझी पात्रता तपासा",
    "schemes.checking":         "पात्रता तपासत आहोत...",
    "schemes.eligible":         "पात्र",
    "schemes.not_eligible":     "अपात्र",
    "schemes.confidence":       "विश्वास",
    "schemes.ministry":         "मंत्रालय",
    "schemes.what_to_do":       "पुढील पाऊल",
    "schemes.total_eligible":   "एकूण पात्र",
    "schemes.summary":          "AI सारांश",
    "schemes.apply_now":        "आता अर्ज करा",
    "schemes.loading":          "योजना लोड होत आहेत...",
    "schemes.no_schemes":       "कोणतीही योजना सापडली नाही",
    "education.title":          "शिक्षण आणि अभ्यासक्रम",
    "education.subtitle":       "तुमच्या वाढीसाठी अभ्यासक्रम आणि प्रशिक्षण",
    "education.search":         "अभ्यासक्रम शोधा...",
    "education.enroll":         "आता नोंदणी करा",
    "education.free":           "मोफत",
    "education.paid":           "सशुल्क",
    "education.duration":       "कालावधी",
    "education.provider":       "प्रदाता",
    "education.level":          "स्तर",
    "education.beginner":       "प्रारंभिक",
    "education.intermediate":   "मध्यम",
    "education.advanced":       "प्रगत",
    "education.loading":        "अभ्यासक्रम लोड होत आहेत...",
    "education.no_courses":     "कोणताही अभ्यासक्रम सापडला नाही",
    "education.certificate":    "प्रमाणपत्र",
    "education.skills_taught":  "तुम्ही शिकाल ती कौशल्ये",
    "nearby.title":             "जवळच्या सेवा",
    "nearby.subtitle":          "तुमच्या स्थानाजवळ दिव्यांग सेवा शोधा",
    "nearby.hospital":          "रुग्णालये",
    "nearby.rehab":             "पुनर्वसन केंद्रे",
    "nearby.school":            "विशेष शाळा",
    "nearby.office":            "दिव्यांग कार्यालये",
    "nearby.loading":           "तुमच्याजवळ सेवा शोधत आहोत...",
    "nearby.no_services":       "जवळपास कोणतीही सेवा सापडली नाही",
    "nearby.get_directions":    "दिशा मिळवा",
    "nearby.call":              "फोन करा",
    "nearby.distance":          "अंतर",
    "nearby.open_now":          "आता उघडे",
    "nearby.closed":            "बंद",
    "mentors.title":            "AI मार्गदर्शक जुळणी",
    "mentors.subtitle":         "तुमचा प्रवास समजणाऱ्या मार्गदर्शकांशी जोडा",
    "mentors.request":          "मार्गदर्शन विनंती करा",
    "mentors.career_goal":      "तुमचे करिअर ध्येय",
    "mentors.career_goal_ph":   "उदा. फुल स्टॅक डेव्हलपर व्हायचे",
    "mentors.message":          "मार्गदर्शकाला संदेश",
    "mentors.message_ph":       "स्वतःबद्दल सांगा...",
    "mentors.send":             "विनंती पाठवा",
    "mentors.available":        "उपलब्ध",
    "mentors.busy":             "व्यस्त",
    "mentors.unavailable":      "अनुपलब्ध",
    "mentors.sessions":         "सत्रे",
    "mentors.match":            "जुळणी",
    "mentors.expertise":        "तज्ञता",
    "mentors.loading":          "मार्गदर्शक शोधत आहोत...",
    "mentors.no_mentors":       "सध्या कोणताही मार्गदर्शक उपलब्ध नाही",
    "mentors.request_sent":     "मार्गदर्शन विनंती पाठवली!",
    "mentors.ai_powered":       "AI-शक्तीचे",
    "community.title":          "समुदाय मंच",
    "community.subtitle":       "अनुभव शेअर करा आणि एकमेकांना आधार द्या",
    "community.new_post":       "नवीन पोस्ट",
    "community.post_title":     "पोस्ट शीर्षक",
    "community.post_content":   "तुमच्या मनात काय आहे?",
    "community.post":           "पोस्ट करा",
    "community.reply":          "उत्तर द्या",
    "community.replies":        "उत्तरे",
    "community.likes":          "आवडले",
    "community.loading":        "पोस्ट लोड होत आहेत...",
    "community.no_posts":       "अजून कोणतीही पोस्ट नाही.",
    "community.share":          "तुमचा अनुभव शेअर करा",
    "community.tags":           "टॅग",
    "profile.title":            "माझी प्रोफाइल",
    "profile.subtitle":         "तुमची वैयक्तिक माहिती व्यवस्थापित करा",
    "profile.full_name":        "पूर्ण नाव",
    "profile.email":            "ईमेल पत्ता",
    "profile.city":             "शहर",
    "profile.disability_type":  "दिव्यांगतेचा प्रकार",
    "profile.education_level":  "शिक्षण पातळी",
    "profile.skills":           "तुमची कौशल्ये",
    "profile.add_skill":        "कौशल्य जोडा...",
    "profile.save":             "प्रोफाइल जतन करा",
    "profile.saving":           "जतन होत आहे...",
    "profile.saved":            "प्रोफाइल यशस्वीरीत्या जतन केली!",
    "profile.completion":       "प्रोफाइल पूर्णता",
    "profile.bio":              "परिचय",
    "profile.bio_ph":           "नियोक्त्यांना स्वतःबद्दल सांगा...",
    "profile.resume_score":     "AI रिझ्युमे स्कोर मिळवा",
    "profile.analyzing":        "प्रोफाइलचे विश्लेषण होत आहे...",
    "profile.score":            "प्रोफाइल स्कोर",
    "profile.strengths":        "तुमची ताकद",
    "profile.improvements":     "सुधारणेचे क्षेत्र",
    "profile.pwdtips":          "दिव्यांग करिअर सूचना",
    "settings.title":           "सेटिंग्ज",
    "settings.subtitle":        "तुमच्या खाते प्राधान्यांचे व्यवस्थापन करा",
    "settings.notifications":   "सूचना",
    "settings.notifications_desc":"नोकरी सूचना आणि योजना अंतिम मुदत मिळवा",
    "settings.privacy":         "गोपनीयता",
    "settings.privacy_desc":    "कोण तुमची प्रोफाइल पाहतो ते नियंत्रित करा",
    "settings.language":        "भाषा",
    "settings.language_desc":   "तुमची पसंतीची भाषा निवडा",
    "settings.accessibility":   "सुलभता सेटिंग्ज",
    "settings.logout":          "साइन आउट",
    "settings.logout_confirm":  "तुम्हाला साइन आउट करायचे आहे का?",
    "settings.danger_zone":     "धोका क्षेत्र",
    "settings.delete_account":  "खाते हटवा",
    "achievements.title":       "उपलब्धी",
    "achievements.subtitle":    "तुमची प्रगती आणि मैलाचे दगड",
    "achievements.points":      "एकूण गुण",
    "achievements.level":       "सध्याचा स्तर",
    "achievements.badges":      "मिळवलेले बॅज",
    "achievements.leaderboard": "लीडरबोर्ड",
    "achievements.rank":        "तुमची रँक",
    "achievements.keep_going":  "अधिक बॅज मिळवण्यासाठी पुढे जा!",
    "achievements.loading":     "उपलब्धी लोड होत आहेत...",
    "achievements.beginner":    "प्रारंभिक",
    "achievements.intermediate":"मध्यम",
    "achievements.advanced":    "प्रगत",
    "achievements.expert":      "तज्ञ",
    "admin.title":              "अॅडमिन पॅनेल",
    "admin.subtitle":           "प्लॅटफॉर्म सामग्री आणि वापरकर्ते व्यवस्थापित करा",
    "admin.add_job":            "नवीन नोकरी जोडा",
    "admin.add_scheme":         "नवीन योजना जोडा",
    "admin.add_course":         "नवीन अभ्यासक्रम जोडा",
    "admin.users":              "एकूण वापरकर्ते",
    "admin.jobs":               "एकूण नोकऱ्या",
    "admin.schemes":            "एकूण योजना",
    "admin.loading":            "अॅडमिन डेटा लोड होत आहे...",
    "access.title":             "सुलभता सेटिंग्ज",
    "access.subtitle":          "तुमचा अनुभव सानुकूलित करा",
    "access.font_size":         "फॉन्ट आकार",
    "access.high_contrast":     "उच्च कॉन्ट्रास्ट मोड",
    "access.dyslexia":          "डिस्लेक्सिया अनुकूल फॉन्ट",
    "access.reduce_motion":     "अॅनिमेशन कमी करा",
    "access.reading_guide":     "वाचन मार्गदर्शक रेषा",
    "access.gesture":           "हात इशारा नियंत्रण",
    "access.sign_language":     "सांकेतिक भाषा डिटेक्टर",
    "access.on":                "चालू",
    "access.off":               "बंद",
    "access.save":              "प्राधान्ये जतन करा",
    "common.loading":           "लोड होत आहे...",
    "common.error":             "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
    "common.save":              "जतन करा",
    "common.cancel":            "रद्द करा",
    "common.close":             "बंद करा",
    "common.back":              "मागे",
    "common.next":              "पुढे",
    "common.search":            "शोधा",
    "common.filter":            "फिल्टर",
    "common.clear":             "साफ करा",
    "common.submit":            "सादर करा",
    "common.view_more":         "अधिक पहा",
    "common.show_less":         "कमी दाखवा",
    "common.no_data":           "कोणताही डेटा उपलब्ध नाही",
    "common.ai_powered":        "AI शक्तीचे",
    "common.free":              "मोफत",
    "common.new":               "नवीन",
  },

  // ── Tamil, Telugu, Gujarati — use Google Translate API for these ──────────
  // Static keys provided for critical UI strings only
  Tamil: {
    "sidebar.dashboard":        "டாஷ்போர்டு",
    "sidebar.jobs":             "வேலை பொருத்தங்கள்",
    "sidebar.schemes":          "திட்ட தகுதி",
    "sidebar.mentors":          "வழிகாட்டிகள்",
    "sidebar.community":        "சமுதாயம்",
    "sidebar.settings":         "அமைப்புகள்",
    "topbar.search":            "வேலை, திட்டங்கள் தேடுங்கள்...",
    "topbar.translate":         "மொழிபெயர்",
    "common.loading":           "ஏற்றுகிறது...",
    "common.save":              "சேமி",
    "common.cancel":            "ரத்துசெய்",
    "jobs.apply":               "இப்போது விண்ணப்பிக்கவும்",
    "jobs.search":              "வேலைகளை தேடுங்கள்...",
    "mentors.request":          "வழிகாட்டல் கோரிக்கை",
    "mentors.send":             "கோரிக்கை அனுப்பு",
    "schemes.check":            "என் தகுதியை சரிபார்",
    "profile.save":             "சுயவிவரத்தை சேமி",
    "settings.logout":          "வெளியேறு",
  },
  Telugu: {
    "sidebar.dashboard":        "డాష్‌బోర్డ్",
    "sidebar.jobs":             "ఉద్యోగ మ్యాచ్‌లు",
    "sidebar.schemes":          "పథకం అర్హత",
    "sidebar.mentors":          "మార్గదర్శకులు",
    "sidebar.community":        "సమాజం",
    "sidebar.settings":         "సెట్టింగ్‌లు",
    "topbar.search":            "ఉద్యోగాలు, పథకాలు వెతకండి...",
    "topbar.translate":         "అనువదించు",
    "common.loading":           "లోడ్ అవుతోంది...",
    "common.save":              "సేవ్ చేయి",
    "common.cancel":            "రద్దు చేయి",
    "jobs.apply":               "ఇప్పుడే దరఖాస్తు చేయండి",
    "jobs.search":              "ఉద్యోగాలు వెతకండి...",
    "mentors.request":          "మెంటర్‌షిప్ అభ్యర్థన",
    "mentors.send":             "అభ్యర్థన పంపు",
    "schemes.check":            "నా అర్హత తనిఖీ చేయి",
    "profile.save":             "ప్రొఫైల్ సేవ్ చేయి",
    "settings.logout":          "సైన్ అవుట్",
  },
  Gujarati: {
    "sidebar.dashboard":        "ડેશબોર્ડ",
    "sidebar.jobs":             "નોકરી મેળ",
    "sidebar.schemes":          "યોજના પાત્રતા",
    "sidebar.mentors":          "માર્ગદર્શકો",
    "sidebar.community":        "સમુદાય",
    "sidebar.settings":         "સેટિંગ્સ",
    "topbar.search":            "નોકરી, યોજનાઓ શોધો...",
    "topbar.translate":         "અનુવાદ",
    "common.loading":           "લોડ થઈ રહ્યું છે...",
    "common.save":              "સાચવો",
    "common.cancel":            "રદ કરો",
    "jobs.apply":               "હવે અરજી કરો",
    "jobs.search":              "નોકરીઓ શોધો...",
    "mentors.request":          "માર્ગદર્શન વિનંતી",
    "mentors.send":             "વિનંતી મોકલો",
    "schemes.check":            "મારી પાત્રતા તપાસો",
    "profile.save":             "પ્રોફાઇલ સાચવો",
    "settings.logout":          "સાઇન આઉટ",
  },
};

// ══════════════════════════════════════════════════════════════════════════
// GOOGLE TRANSLATE — Free API (no key needed)
// Same approach as LanguageContext.tsx from Project 1
// ══════════════════════════════════════════════════════════════════════════

const originalTextMap = new WeakMap<Text, string>();

async function translateOne(text: string, targetLang: string): Promise<string> {
  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl",     "en");
    url.searchParams.set("tl",     targetLang);
    url.searchParams.set("dt",     "t");
    url.searchParams.set("q",      text);

    const res = await fetch(url.toString());
    if (!res.ok) return text;
    const data = await res.json();
    const translated = (data[0] as any[][])
      .map((chunk) => chunk[0] as string)
      .join("");
    return translated || text;
  } catch {
    return text;
  }
}

function getDashboardTextNodes(root: Element): Text[] {
  const nodes: Text[] = [];
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "SVG",
    "CANVAS", "CODE", "PRE", "INPUT", "TEXTAREA",
  ]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.getAttribute("aria-hidden") === "true") return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim() ?? "";
      if (text.length < 2)                          return NodeFilter.FILTER_REJECT;
      if (/^[\d\s₹%+/\-.:,()@]+$/.test(text))      return NodeFilter.FILTER_REJECT;
      if (/^https?:\/\//.test(text))                return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  return nodes;
}

// ══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ══════════════════════════════════════════════════════════════════════════
export const DashboardLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<DashboardLanguage>("English");
  const [isTranslating, setIsTranslating]   = useState(false);
  const prevLangRef = useRef<DashboardLanguage>("English");
  const cache       = useRef<Map<string, string>>(new Map());

  // Static translation by key
  const td = useCallback(
    (key: string): string =>
      dashboardTranslations[language]?.[key] ??
      dashboardTranslations["English"][key] ??
      key,
    [language]
  );

  // ── Restore all text nodes to English ──────────────────────────────────
  const restoreEnglish = useCallback(() => {
    const root = document.getElementById("root") ?? document.body;
    getDashboardTextNodes(root).forEach((node) => {
      const orig = originalTextMap.get(node);
      if (orig !== undefined) node.textContent = orig;
    });
  }, []);

  // ── Translate a batch of texts ──────────────────────────────────────────
  const translateTexts = useCallback(
    async (texts: string[], targetCode: string): Promise<string[]> => {
      const results: string[] = new Array(texts.length);
      const toFetch: { idx: number; text: string }[] = [];

      texts.forEach((text, i) => {
        const key = `${targetCode}:${text}`;
        if (cache.current.has(key)) {
          results[i] = cache.current.get(key)!;
        } else {
          toFetch.push({ idx: i, text });
        }
      });

      for (let i = 0; i < toFetch.length; i++) {
        const { idx, text } = toFetch[i];
        const translated = await translateOne(text, targetCode);
        results[idx] = translated;
        cache.current.set(`${targetCode}:${text}`, translated);
        if (i < toFetch.length - 1) {
          await new Promise((r) => setTimeout(r, 40));
        }
      }
      return results;
    },
    []
  );

  // ── Apply full page translation ─────────────────────────────────────────
  const applyTranslation = useCallback(
    async (lang: DashboardLanguage) => {
      if (lang === "English") {
        restoreEnglish();
        return;
      }

      setIsTranslating(true);

      if (prevLangRef.current !== "English") {
        restoreEnglish();
        await new Promise((r) => setTimeout(r, 100));
      }

      const targetCode = LANG_CODE[lang];
      const root = document.getElementById("root") ?? document.body;
      const textNodes = getDashboardTextNodes(root);

      // Save originals
      textNodes.forEach((node) => {
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, node.textContent ?? "");
        }
      });

      // Translate in batches of 10
      const BATCH = 10;
      for (let i = 0; i < textNodes.length; i += BATCH) {
        const batch = textNodes.slice(i, i + BATCH);
        const texts = batch.map((n) => n.textContent?.trim() ?? "");
        try {
          const translated = await translateTexts(texts, targetCode);
          batch.forEach((node, j) => {
            if (translated[j] && translated[j] !== texts[j]) {
              node.textContent = translated[j];
            }
          });
        } catch {
          // skip failed batch
        }
      }

      setIsTranslating(false);
    },
    [restoreEnglish, translateTexts]
  );

  // ── Public setLanguage ──────────────────────────────────────────────────
  const setLanguage = useCallback(
    (lang: DashboardLanguage) => {
      prevLangRef.current = language;
      setLanguageState(lang);
    },
    [language]
  );

  // ── Trigger translation on language change ──────────────────────────────
  useEffect(() => {
    applyTranslation(language);
  }, [language, applyTranslation]);

  return (
    <DashboardLanguageContext.Provider
      value={{
        language,
        setLanguage,
        td,
        isTranslating,
        langCode: LANG_CODE[language],
      }}
    >
      {/* Top progress bar while translating */}
      {isTranslating && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 999999,
            background:
              "linear-gradient(90deg,hsl(265,80%,56%),hsl(250,84%,54%),hsl(265,80%,56%))",
            backgroundSize: "200% 100%",
            animation: "gradient-rotate 1.2s linear infinite",
            height: 3,
          }}
        />
      )}

      {/* Bottom toast */}
      {isTranslating && (
        <div
          style={{
            position: "fixed", bottom: 24, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,16,35,0.95)",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: 24,
            zIndex: 999999,
            fontSize: 13,
            fontWeight: 500,
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(124,58,237,0.4)",
            display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 4px 24px rgba(124,58,237,0.3)",
          }}
        >
          <span
            style={{
              width: 14, height: 14,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#a78bfa",
              display: "inline-block",
              animation: "spin-y 0.6s linear infinite",
            }}
          />
          Translating dashboard...
        </div>
      )}

      {children}
    </DashboardLanguageContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────────────────────
export const useDashboardLanguage = () => {
  const ctx = useContext(DashboardLanguageContext);
  if (!ctx) throw new Error("useDashboardLanguage must be used within DashboardLanguageProvider");
  return ctx;
};