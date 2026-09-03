// frontend/src/features/education/services/nearbyInstitutesData.ts

export interface EducationInstitute {
  id: string;
  name: string;
  type: string;
  category: 'special' | 'college' | 'vocational' | 'school' | 'support' | 'ngo';
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  courses: string[];
  accessibilityFeatures: string[];
  timings?: string;
  description: string;
  rating?: number;
  tags?: string[];
}

export const EDUCATION_INSTITUTES: EducationInstitute[] = [
  // --- Dehradun & Uttarakhand ---
  {
    id: "inst-niepvd-dehradun",
    name: "National Institute for the Empowerment of Persons with Visual Disabilities (NIEPVD)",
    type: "Special Education & Training Center",
    category: "special",
    address: "116, Rajpur Road, Dehradun, Uttarakhand - 248001",
    city: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3475,
    lng: 78.0645,
    phone: "+91-135-2744491",
    email: "director@niepvd.nic.in",
    website: "https://nivh.gov.in",
    courses: [
      "Diploma in Special Education (Visual Impairment)",
      "B.Ed. Special Education (V.I.)",
      "Computer Applications for Visually Impaired",
      "Braille Transcription & Assistive Tech Certification",
      "Orientation & Mobility Instructor Training"
    ],
    accessibilityFeatures: [
      "Wheelchair Accessible Campus",
      "Tactile Paving & Braille Signage",
      "Screen Reader & Audio Library Lab",
      "Accessible Hostels",
      "Assistive Software Workstations"
    ],
    timings: "Mon - Fri: 9:00 AM - 5:30 PM",
    description: "Apex national institute dedicated to the education, vocational training, research, and rehabilitation of visually impaired students across India.",
    rating: 4.8,
    tags: ["college", "special education", "dehradun", "visual impairment", "b.ed"]
  },
  {
    id: "inst-dav-pg-college-dehradun",
    name: "D.A.V. (PG) College Dehradun",
    type: "College & Postgraduate Institute",
    category: "college",
    address: "Karanpur, Dehradun, Uttarakhand - 248001",
    city: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3291,
    lng: 78.0584,
    phone: "+91-135-2743555",
    email: "info@davpgcollege.in",
    website: "https://davpgcollege.in",
    courses: [
      "B.A., B.Sc., B.Com Degree Courses",
      "M.A., M.Sc., M.Com Postgraduate Programs",
      "B.Ed. Teacher Education Program",
      "Computer Applications & Science Diplomas"
    ],
    accessibilityFeatures: [
      "Wheelchair Ramps at Main Academic Buildings",
      "Equal Opportunity Student Cell",
      "Accessible Central Library Section",
      "Special Examination Accommodations"
    ],
    timings: "Mon - Sat: 9:00 AM - 4:30 PM",
    description: "One of the premier and largest postgraduate degree colleges in Uttarakhand offering diverse undergraduate and postgraduate degree courses.",
    rating: 4.6,
    tags: ["college", "colleges", "dehradun", "degree", "postgraduate", "higher education"]
  },
  {
    id: "inst-sgrr-college-dehradun",
    name: "Shri Guru Ram Rai (SGRR) PG College",
    type: "College & Higher Education",
    category: "college",
    address: "Pathri Bagh, Tyagi Road, Dehradun, Uttarakhand - 248001",
    city: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3064,
    lng: 78.0320,
    phone: "+91-135-2621881",
    email: "sgrrpgcollege@gmail.com",
    website: "https://sgrrpgcollege.in",
    courses: [
      "B.Sc. in Physics, Chemistry, Mathematics, Biotech",
      "B.A. Arts & Humanities",
      "B.Com & M.Com Commerce Degrees",
      "B.Sc. Agriculture & IT Programs"
    ],
    accessibilityFeatures: [
      "Ramp Access & Ground Floor Classrooms",
      "Assistive Digital Study Resources",
      "Inclusive Student Support Center",
      "Accessible Sports Ground"
    ],
    timings: "Mon - Sat: 9:00 AM - 5:00 PM",
    description: "Renowned autonomous PG college in Dehradun providing quality undergraduate and postgraduate higher education across science, arts, and commerce.",
    rating: 4.5,
    tags: ["college", "colleges", "dehradun", "sgrr", "science", "arts", "commerce"]
  },
  {
    id: "inst-dit-university-dehradun",
    name: "DIT University (Dehradun Institute of Technology)",
    type: "University & Engineering College",
    category: "college",
    address: "Mussoorie Diversion Road, Makkawala, Dehradun, Uttarakhand - 248009",
    city: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3852,
    lng: 78.0776,
    phone: "+91-135-3000300",
    email: "admissions@dituniversity.edu.in",
    website: "https://www.dituniversity.edu.in",
    courses: [
      "B.Tech in Computer Science, AI & ML, Data Science",
      "B.Arch & Bachelor of Design (B.Des)",
      "B.Pharm & M.Pharm Pharmacy Programs",
      "M.Tech / M.B.A. / Ph.D. Programs"
    ],
    accessibilityFeatures: [
      "Modern Barrier-Free Campus Architecture",
      "Elevators in all Academic Blocks",
      "Assistive Computing Facilities in Central Library",
      "Accessible On-Campus Transport"
    ],
    timings: "Mon - Sat: 9:00 AM - 5:30 PM",
    description: "Leading technological university in Uttarakhand offering accredited engineering, architecture, pharmacy, computing, and management degree programs.",
    rating: 4.7,
    tags: ["college", "university", "dehradun", "engineering", "b.tech", "higher education"]
  },
  {
    id: "inst-graphic-era-dehradun",
    name: "Graphic Era (Deemed to be University)",
    type: "University & Technical College",
    category: "college",
    address: "566/6, Bell Road, Clement Town, Dehradun, Uttarakhand - 248002",
    city: "Dehradun",
    state: "Uttarakhand",
    lat: 28.6892,
    lng: 77.2104,
    phone: "+91-135-2643470",
    email: "enquiry@geu.ac.in",
    website: "https://geu.ac.in",
    courses: [
      "B.Tech in Computer Science, Cybersecurity & Cloud Computing",
      "B.C.A. & M.C.A. Computer Applications",
      "B.B.A. & M.B.A. Business Administration",
      "B.Sc. Nursing & Allied Health Sciences"
    ],
    accessibilityFeatures: [
      "Wheelchair Accessible Classrooms & Auditoriums",
      "Tactile Pathways & Automated Lifts",
      "Digital Audio-Text Resource Center",
      "Equal Opportunity Support Cell"
    ],
    timings: "Mon - Sat: 8:30 AM - 5:30 PM",
    description: "Top-tier accredited private university in Dehradun with modern computing facilities, inclusive education cells, and extensive career placements.",
    rating: 4.8,
    tags: ["college", "university", "dehradun", "graphic era", "b.tech", "mca"]
  },
  {
    id: "inst-iit-roorkee",
    name: "Indian Institute of Technology Roorkee (IIT Roorkee)",
    type: "Higher Education & Research",
    category: "college",
    address: "Roorkee, Haridwar District, Uttarakhand - 247667",
    city: "Roorkee",
    state: "Uttarakhand",
    lat: 29.8649,
    lng: 77.8966,
    phone: "+91-1332-285311",
    email: "registrar@iitr.ac.in",
    website: "https://www.iitr.ac.in",
    courses: [
      "B.Tech in Computer Science & Engineering",
      "B.Tech in Artificial Intelligence & Data Science",
      "M.Tech / M.Des / Ph.D.",
      "Inclusive Equal Opportunity Cell Programs"
    ],
    accessibilityFeatures: [
      "PwD Enabling Unit & Assistive Tech Lab",
      "Wheelchair Accessible Ramps & Elevators",
      "Accessible Digital Library (DAISY/Audio)",
      "Battery-Operated Campus Mobility Carts"
    ],
    timings: "Mon - Sat: 8:30 AM - 6:00 PM",
    description: "Premier engineering and technology institute equipped with an Equal Opportunity Cell and specialized assistive technology resources for students.",
    rating: 4.9,
    tags: ["college", "university", "iit", "roorkee", "engineering", "b.tech"]
  },

  // --- Delhi NCR ---
  {
    id: "inst-st-stephens-delhi",
    name: "St. Stephen's College - University of Delhi",
    type: "Premier Degree College",
    category: "college",
    address: "University Enclave, North Campus, Delhi - 110007",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6898,
    lng: 77.2119,
    phone: "+91-11-27667271",
    email: "principal@ststephens.edu",
    website: "https://www.ststephens.edu",
    courses: [
      "B.A. (Hons) in Economics, English, History, Philosophy",
      "B.Sc. (Hons) in Mathematics, Physics, Chemistry",
      "M.A. & M.Sc. Postgraduate Studies",
      "Enabling Unit Digital Literacy Programs"
    ],
    accessibilityFeatures: [
      "Enable India & Equal Opportunity Cell",
      "Audio-Text Digitization Lab & Screen Readers",
      "Ramp Access across Main College & Hall",
      "Volunteer Scribe Network"
    ],
    timings: "Mon - Fri: 8:30 AM - 5:00 PM",
    description: "Prestigious North Campus college under Delhi University with an active Enabling Unit providing accessible digital course materials for PwD students.",
    rating: 4.9,
    tags: ["college", "colleges", "delhi", "north campus", "arts", "science", "st stephens"]
  },
  {
    id: "inst-hindu-college-delhi",
    name: "Hindu College - University of Delhi",
    type: "Premier Degree College",
    category: "college",
    address: "Sudhir Bose Marg, North Campus, Delhi - 110007",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6885,
    lng: 77.2100,
    phone: "+91-11-27667184",
    email: "principal@hinducollege.ac.in",
    website: "https://hinducollege.ac.in",
    courses: [
      "B.A. (Hons), B.Com (Hons), B.Sc. (Hons)",
      "M.A. & M.Sc. Postgraduate Programs",
      "Equal Opportunity Cell Workshops"
    ],
    accessibilityFeatures: [
      "Abhyas Enabling Unit with JAWS & NVDA Softwares",
      "Accessible Amphitheatre & Seminar Halls",
      "Tactile Corridors & Elevators in New Block",
      "Braille Books and Recording Equipment"
    ],
    timings: "Mon - Sat: 8:30 AM - 5:00 PM",
    description: "Top-ranked DU college with an active Enabling Unit supporting students with disabilities through audio materials, accessible labs, and scribes.",
    rating: 4.9,
    tags: ["college", "colleges", "delhi", "hindu college", "north campus", "b.com", "b.a."]
  },
  {
    id: "inst-hansraj-college-delhi",
    name: "Hansraj College - University of Delhi",
    type: "Premier Degree College",
    category: "college",
    address: "Mahatma Hans Raj Marg, Malkaganj, Delhi - 110007",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6811,
    lng: 77.2109,
    phone: "+91-11-27667747",
    email: "principal_hrc@yahoo.com",
    website: "https://www.hansrajcollege.ac.in",
    courses: [
      "B.Sc. (Hons) in Computer Science, Electronics, Physics",
      "B.Com (Hons) & B.A. (Hons)",
      "Certificate Courses in Foreign Languages & Data Skills"
    ],
    accessibilityFeatures: [
      "Equal Opportunity Cell & Assistive Tech Lab",
      "Wheelchair Accessible Elevators & Pathways",
      "Audio-Book Reading Room in Central Library",
      "Personal Notetakers & Exam Scribe Cell"
    ],
    timings: "Mon - Sat: 8:30 AM - 5:30 PM",
    description: "Prominent North Campus college equipped with specialized assistive software, accessible classrooms, and equal opportunity cells.",
    rating: 4.8,
    tags: ["college", "colleges", "delhi", "hansraj", "computer science", "b.com"]
  },
  {
    id: "inst-du-delhi",
    name: "University of Delhi - Equal Opportunity Cell (EOC)",
    type: "Central University & Enabling Unit",
    category: "college",
    address: "Tutorial Building, Arts Faculty, University of Delhi, Delhi - 110007",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6892,
    lng: 77.2104,
    phone: "+91-11-27662602",
    email: "eoc@du.ac.in",
    website: "https://eoc.du.ac.in",
    courses: [
      "B.A. / B.Sc. / B.Com. Undergraduate Programs",
      "M.A. / M.Sc. Postgraduate Studies",
      "Short Term Certificate Courses in Assistive Tech",
      "Sign Language & Digital Accessibility Training"
    ],
    accessibilityFeatures: [
      "Assistive Tech Computer Lab with JAWS & NVDA",
      "Audio Recording Studios & Braille Printers",
      "Sign Language Interpretation Support",
      "Accessible E-Books Repository"
    ],
    timings: "Mon - Fri: 9:00 AM - 5:30 PM",
    description: "Delhi University's flagship Equal Opportunity Cell ensuring equal access, digital study materials, assistive software, and counseling for PwD students.",
    rating: 4.8,
    tags: ["college", "university", "delhi", "eoc", "equal opportunity", "higher education"]
  },
  {
    id: "inst-jnu-delhi",
    name: "Jawaharlal Nehru University (JNU) - Hellen Keller Unit",
    type: "Central University",
    category: "college",
    address: "New Mehrauli Road, JNU Ring Road, New Delhi - 110067",
    city: "New Delhi",
    state: "Delhi",
    lat: 28.5398,
    lng: 77.1664,
    phone: "+91-11-26704090",
    email: "eoc@jnu.ac.in",
    website: "https://www.jnu.ac.in",
    courses: [
      "Integrated B.A.-M.A. in Languages",
      "Postgraduate & Doctoral Research (Ph.D.)",
      "Social Sciences, International Studies & Computer Science"
    ],
    accessibilityFeatures: [
      "Hellen Keller Accessible Resource Centre",
      "Accessible Hostels with Ramps & Elevators",
      "Text-to-Speech Scanning Station",
      "Campus Electric Vehicle Support"
    ],
    timings: "Mon - Fri: 9:00 AM - 6:00 PM",
    description: "Renowned central research university featuring state-of-the-art Hellen Keller Resource Centre providing academic resources to disabled researchers.",
    rating: 4.9,
    tags: ["college", "university", "delhi", "jnu", "research", "higher education"]
  },
  {
    id: "inst-pdunippd-delhi",
    name: "Pandit Deendayal Upadhyaya National Institute for Persons with Physical Disabilities (PDUNIPPD)",
    type: "National Physical Rehabilitation Institute",
    category: "special",
    address: "4, Vishnu Digamber Marg, New Delhi - 110002",
    city: "New Delhi",
    state: "Delhi",
    lat: 28.6318,
    lng: 77.2415,
    phone: "+91-11-23233782",
    email: "diriph@nic.in",
    website: "http://iphnewdelhi.in",
    courses: [
      "Bachelor of Occupational Therapy (BOT)",
      "Bachelor of Physiotherapy (BPT)",
      "Bachelor of Prosthetics & Orthotics (BPO)",
      "Vocational Skill Development Workshops"
    ],
    accessibilityFeatures: [
      "100% Barrier-Free Accessible Campus",
      "Wheelchair Lift & Automated Ramps",
      "Prosthetic & Orthotic Fitting Center",
      "Dedicated Accessible Transport Support"
    ],
    timings: "Mon - Sat: 9:00 AM - 5:00 PM",
    description: "Autonomous institute under MSJE, providing premier education in physical therapy, occupational therapy, prosthetics, and rehabilitation engineering.",
    rating: 4.7,
    tags: ["special education", "college", "delhi", "physiotherapy", "occupational therapy"]
  },
  {
    id: "inst-blind-relief-delhi",
    name: "The Blind Relief Association & Durgabai Deshmukh College",
    type: "Inclusive Training & Special College",
    category: "vocational",
    address: "Lal Bahadur Shastri Marg, Near Oberoi Hotel, New Delhi - 110003",
    city: "New Delhi",
    state: "Delhi",
    lat: 28.5947,
    lng: 77.2372,
    phone: "+91-11-24361376",
    email: "bra@blindrelief.org",
    website: "https://blindrelief.org",
    courses: [
      "Durgabai Deshmukh B.Ed. Special Education (Visual)",
      "Computer Literacy & Assistive Softwares",
      "Handloom Weaving & Craft Production",
      "Acupressure & Reflexology Vocational Training"
    ],
    accessibilityFeatures: [
      "Full Tactile Campus Navigation",
      "High-Tech Audio Library & Braille Printing",
      "Specialized Classrooms & Hostels",
      "Vocational Workshop Studios"
    ],
    timings: "Mon - Sat: 8:30 AM - 5:00 PM",
    description: "Historic NGO and premier special education teacher training college empowering visually challenged youth with education and livelihood skills.",
    rating: 4.8,
    tags: ["vocational", "special education", "college", "delhi", "b.ed", "skill development"]
  },
  {
    id: "inst-amar-jyoti-delhi",
    name: "Amar Jyoti Institute of Inclusive Education",
    type: "Inclusive Model School & Rehabilitation",
    category: "school",
    address: "Karkardooma, Vikas Marg, New Delhi - 110092",
    city: "Delhi",
    state: "Delhi",
    lat: 28.6508,
    lng: 77.2995,
    phone: "+91-11-22372173",
    email: "contact@amarjyotirehab.org",
    website: "https://amarjyotirehab.org",
    courses: [
      "Inclusive CBSE Integrated Schooling (Nursery - XII)",
      "Bachelor of Physiotherapy (BPT)",
      "D.Ed. & B.Ed. in Special Education",
      "Vocational Training in Computers, Jewelry & Pottery"
    ],
    accessibilityFeatures: [
      "Universal Inclusive Architecture",
      "Speech & Audiology Labs",
      "Physiotherapy & Occupational Gyms",
      "Accessible Transportation Fleet"
    ],
    timings: "Mon - Sat: 8:00 AM - 4:00 PM",
    description: "Pioneering inclusive school and college where children with and without disabilities study and grow together under one roof.",
    rating: 4.8,
    tags: ["school", "college", "delhi", "inclusive education", "cbse", "physiotherapy"]
  },
  {
    id: "inst-skill-noida",
    name: "National Institute for Career Service (NICS) & Skill Centre for PwD",
    type: "Skill Development & Career Center",
    category: "vocational",
    address: "A-22, Sector 62, Institutional Area, Noida, Uttar Pradesh - 201309",
    city: "Noida",
    state: "Uttar Pradesh",
    lat: 28.6225,
    lng: 77.3638,
    phone: "+91-120-2400089",
    email: "nics-noida@nic.in",
    website: "https://nicsnoida.gov.in",
    courses: [
      "Digital Marketing & Web Development for PwD",
      "Accounts & Tally with Assistive Technologies",
      "BPO & Customer Care Executive Training",
      "Government Competitive Exam Preparatory Coaching"
    ],
    accessibilityFeatures: [
      "Accessible Computer Laboratories",
      "Screen Reader Support Stations",
      "Ramp Access to All Blocks",
      "Sign Language Career Mentoring"
    ],
    timings: "Mon - Fri: 9:00 AM - 5:30 PM",
    description: "Ministry of Labour & Employment institution providing skill development, career counseling, and job placement assistance for disabled youth.",
    rating: 4.6,
    tags: ["vocational", "skill center", "noida", "delhi", "it skills"]
  },

  // --- Pune & Maharashtra ---
  {
    id: "inst-fergusson-college-pune",
    name: "Fergusson College (Autonomous), Pune",
    type: "Premier Degree College",
    category: "college",
    address: "FC Road, Shivajinagar, Pune, Maharashtra - 411004",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5236,
    lng: 73.8407,
    phone: "+91-20-67656000",
    email: "principal@fergusson.edu",
    website: "https://www.fergusson.edu",
    courses: [
      "B.A. in Psychology, Economics, English, Sociology",
      "B.Sc. in Computer Science, Animation, Biotechnology, Physics",
      "M.Sc. in Computer Applications & Data Science",
      "Equal Opportunity Enabling Center Programs"
    ],
    accessibilityFeatures: [
      "SAATHI Enabling Centre for Blind & Low-Vision Students",
      "Braille Books, Talking Terminals & Screen Magnifiers",
      "Ramps & Wheelchair Friendly Ground Classrooms",
      "Dedicated Scribe & Reader Bank"
    ],
    timings: "Mon - Sat: 8:00 AM - 5:30 PM",
    description: "Iconic autonomous college with the SAATHI Enabling Center providing extensive assistive software, audio textbooks, and scribes for PwD students.",
    rating: 4.9,
    tags: ["college", "colleges", "pune", "fergusson", "b.sc", "b.a.", "higher education"]
  },
  {
    id: "inst-coep-pune",
    name: "COEP Technological University",
    type: "Premier Engineering University",
    category: "college",
    address: "Wellesley Road, Shivajinagar, Pune, Maharashtra - 411005",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5293,
    lng: 73.8565,
    phone: "+91-20-25507000",
    email: "director@coep.ac.in",
    website: "https://www.coeptech.ac.in",
    courses: [
      "B.Tech in Computer Engineering & IT",
      "B.Tech in Mechanical, Electronics & Telecommunication",
      "M.Tech / Ph.D. Engineering Programs"
    ],
    accessibilityFeatures: [
      "Wheelchair Accessible Main Building & Labs",
      "Equal Opportunity Advisory Desk",
      "Accessible Audio-Visual Presentation Halls",
      "Special Exam Accommodations & Scribe Facilitation"
    ],
    timings: "Mon - Fri: 8:30 AM - 5:30 PM",
    description: "One of India's oldest engineering institutions with robust accommodations, assistive tech laboratories, and engineering skill training.",
    rating: 4.8,
    tags: ["college", "university", "pune", "coep", "engineering", "b.tech"]
  },
  {
    id: "inst-sppu-pune",
    name: "Savitribai Phule Pune University (SPPU) - Equal Opportunity Cell",
    type: "State Public University",
    category: "college",
    address: "Ganeshkhind Road, Pune, Maharashtra - 411007",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5529,
    lng: 73.8267,
    phone: "+91-20-25696061",
    email: "eoc@unipune.ac.in",
    website: "http://www.unipune.ac.in",
    courses: [
      "B.A., B.Sc., B.Com, B.C.A., M.C.A. Programs",
      "Special Education Certification Courses",
      "Assistive Software & Digital Literacy Certification"
    ],
    accessibilityFeatures: [
      "Aniket Resource Centre for Disabled Students",
      "Braille Printing & Screen Reading Studio",
      "Accessible Jayakar Library Wing",
      "Ramped Administrative & Academic Wings"
    ],
    timings: "Mon - Sat: 10:00 AM - 5:30 PM",
    description: "Major university in Maharashtra offering comprehensive support services, accessible learning materials, and scholarships for PwD students.",
    rating: 4.7,
    tags: ["college", "university", "pune", "sppu", "unipune", "higher education"]
  },
  {
    id: "inst-ayjnishd-mumbai",
    name: "Ali Yavar Jung National Institute of Speech and Hearing Disabilities (AYJNISHD)",
    type: "National Hearing & Speech Institute",
    category: "special",
    address: "K.C. Marg, Bandra Reclamation, Bandra (West), Mumbai, Maharashtra - 400050",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0435,
    lng: 72.8291,
    phone: "+91-22-26400211",
    email: "ayjnihh-mum@nic.in",
    website: "http://ayjnihh.nic.in",
    courses: [
      "Bachelor of Audiology & Speech-Language Pathology (BASLP)",
      "B.Ed. Special Education (Hearing Impairment)",
      "M.Sc. Audiology / M.Sc. SLP",
      "Indian Sign Language (ISL) Interpreter Course"
    ],
    accessibilityFeatures: [
      "Acoustically Treated Audio/Speech Labs",
      "Certified ISL Interpreters on Campus",
      "Visual Alert and Captioning Displays",
      "Barrier-Free Ramps & Elevators"
    ],
    timings: "Mon - Fri: 9:00 AM - 5:30 PM",
    description: "Premier national institute for speech and hearing rehabilitation, audio engineering, special educator training, and sign language programs.",
    rating: 4.8,
    tags: ["special education", "college", "mumbai", "speech", "hearing", "sign language"]
  },
  {
    id: "inst-iit-bombay",
    name: "Indian Institute of Technology Bombay (IIT Bombay)",
    type: "Institute of National Eminence",
    category: "college",
    address: "Main Gate Rd, IIT Area, Powai, Mumbai, Maharashtra - 400076",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.1334,
    lng: 72.9133,
    phone: "+91-22-25722545",
    email: "registrar@iitb.ac.in",
    website: "https://www.iitb.ac.in",
    courses: [
      "B.Tech / M.Tech in Computer Science, Electrical & AI",
      "Industrial Design Centre (IDC) - Inclusive Design",
      "Ph.D. Research & Innovation Programs"
    ],
    accessibilityFeatures: [
      "Centre for Accessible Tech & Universal Design",
      "Accessible Electric Shuttle Transit",
      "Automated Doors, Elevators & Ramps in All Hostels",
      "Screen Reader & Audio Textbook Lab"
    ],
    timings: "Mon - Sat: 8:30 AM - 6:00 PM",
    description: "World-class technological institute leading breakthroughs in assistive robotics, accessible AI, and inclusive higher education.",
    rating: 4.9,
    tags: ["college", "university", "mumbai", "iit", "engineering", "b.tech"]
  },

  // --- Bengaluru / Karnataka ---
  {
    id: "inst-iisc-bangalore",
    name: "Indian Institute of Science (IISc Bangalore)",
    type: "Premier Research Institute & University",
    category: "college",
    address: "CV Raman Road, Bengaluru, Karnataka - 560012",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 13.0219,
    lng: 77.5671,
    phone: "+91-80-22932001",
    email: "registrar@iisc.ac.in",
    website: "https://iisc.ac.in",
    courses: [
      "Bachelor of Science (Research)",
      "M.Tech / M.Des / Integrated Ph.D.",
      "Computational & Data Sciences Research"
    ],
    accessibilityFeatures: [
      "Equal Opportunities Cell with Assistive Hardware",
      "Campus Electric Buggy Transportation",
      "Fully Accessible JR Tagore Library",
      "Barrier-Free Residential Blocks"
    ],
    timings: "Mon - Sat: 8:30 AM - 6:00 PM",
    description: "India's highest-ranked scientific research institution with pioneering assistive technology labs and supportive academic environment.",
    rating: 5.0,
    tags: ["college", "university", "bengaluru", "iisc", "research", "science"]
  },
  {
    id: "inst-christ-univ-bangalore",
    name: "Christ (Deemed to be University), Bengaluru",
    type: "Premier University & Degree College",
    category: "college",
    address: "Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka - 560029",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9344,
    lng: 77.6060,
    phone: "+91-80-40129100",
    email: "mail@christuniversity.in",
    website: "https://christuniversity.in",
    courses: [
      "B.B.A., B.Com., B.A. (Hons) in Psychology & English",
      "B.C.A., B.Sc. Data Science & Computer Science",
      "M.B.A., LL.M., M.Sc. Postgraduate Degrees"
    ],
    accessibilityFeatures: [
      "Centre for Social Action & Enabling Cell",
      "Braille Lab & Screen Readers (JAWS / NVDA)",
      "Wheelchair Lifts & Barrier-Free Blocks",
      "Exam Accommodations & Extended Time"
    ],
    timings: "Mon - Sat: 8:30 AM - 5:30 PM",
    description: "Top multidisciplinary university in Bangalore offering innovative degree programs with comprehensive student disability support.",
    rating: 4.8,
    tags: ["college", "university", "bengaluru", "christ university", "bba", "b.com", "bca"]
  },

  // --- Chennai / Tamil Nadu ---
  {
    id: "inst-loyola-college-chennai",
    name: "Loyola College (Autonomous), Chennai",
    type: "Premier Degree College",
    category: "college",
    address: "Sterling Road, Nungambakkam, Chennai, Tamil Nadu - 600034",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0628,
    lng: 80.2351,
    phone: "+91-44-28178200",
    email: "loyolaprincipal@gmail.com",
    website: "https://www.loyolacollege.edu",
    courses: [
      "B.Com., B.A. Economics, English, History",
      "B.Sc. in Computer Science, Visual Communication, Math",
      "Resource Centre for Differently Abled (RCDA)"
    ],
    accessibilityFeatures: [
      "Pioneering Resource Centre for Differently Abled (RCDA)",
      "Fully Accessible Assistive Computer Lab & Audio Books",
      "Braille Transcribers & Reading Volunteers",
      "Ramp Access across Classrooms"
    ],
    timings: "Mon - Sat: 8:00 AM - 4:30 PM",
    description: "Pioneering institution in South India with the dedicated RCDA center providing assistive software, scholarships, and scribe facilitation for students with disabilities.",
    rating: 4.9,
    tags: ["college", "colleges", "chennai", "loyola", "rcda", "b.com", "b.sc"]
  },
  {
    id: "inst-iit-madras",
    name: "Indian Institute of Technology Madras (IIT Madras)",
    type: "Institute of National Eminence",
    category: "college",
    address: "Sardar Patel Road, Opposite Guindy National Park, Chennai, Tamil Nadu - 600036",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 12.9915,
    lng: 80.2337,
    phone: "+91-44-22578000",
    email: "registrar@iitm.ac.in",
    website: "https://www.iitm.ac.in",
    courses: [
      "B.Tech in Computer Science, Mechanical & Biomedical Engg",
      "Biomedical Engineering & Rehabilitation Design",
      "Online BS Degree in Data Science & Applications",
      "Standing Wheelchair & Assistive Device Innovation Labs"
    ],
    accessibilityFeatures: [
      "TTK Center for Rehabilitation Research & Device Testing",
      "Eco-Friendly Battery Shuttle Network",
      "Ramps, Tactile Paths, and Accessible Restrooms in All Buildings",
      "Equal Opportunities Cell with Dedicated Counselors"
    ],
    timings: "Mon - Sat: 8:30 AM - 5:30 PM",
    description: "Top-ranking technical university creator of the 'Standing Wheelchair' and leader in accessible engineering and technology education.",
    rating: 4.9,
    tags: ["college", "university", "chennai", "iit", "engineering", "b.tech"]
  },

  // --- Hyderabad / Telangana ---
  {
    id: "inst-uoh-hyderabad",
    name: "University of Hyderabad (UoH) - Centre for Empowering PwD",
    type: "Central University",
    category: "college",
    address: "Prof. C.R. Rao Road, Gachibowli, Hyderabad, Telangana - 500046",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.4600,
    lng: 78.3308,
    phone: "+91-40-23130000",
    email: "eoc@uohyd.ac.in",
    website: "https://uohyd.ac.in",
    courses: [
      "Integrated Master’s & Postgraduate Courses in Sciences & Humanities",
      "M.C.A. & Artificial Intelligence Studies",
      "Ph.D. Fellowships for PwD Candidates"
    ],
    accessibilityFeatures: [
      "Sparsh Equal Opportunity Cell with Braille Displays",
      "Accessible Campus Shuttles",
      "Assistive Listening Classrooms",
      "Digital Audio Repository with Screen Readers"
    ],
    timings: "Mon - Fri: 9:00 AM - 5:30 PM",
    description: "Prestigious central university known for inclusive campus environment, dedicated assistive tech lab, and equal opportunity scholarships.",
    rating: 4.8,
    tags: ["college", "university", "hyderabad", "uoh", "higher education"]
  },

  // --- Kolkata / West Bengal ---
  {
    id: "inst-st-xaviers-kolkata",
    name: "St. Xavier's College (Autonomous), Kolkata",
    type: "Premier Degree College",
    category: "college",
    address: "30, Mother Teresa Sarani (Park Street), Kolkata, West Bengal - 700016",
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.5492,
    lng: 88.3582,
    phone: "+91-33-22551101",
    email: "principal@sxccal.edu",
    website: "https://www.sxccal.edu",
    courses: [
      "B.Com. (Hons), B.B.A. (Hons), B.A. & B.Sc. Programs",
      "M.Sc. in Computer Science & Biotechnology",
      "Equal Opportunity & Enabling Cell Facilities"
    ],
    accessibilityFeatures: [
      "Enabling Unit with Talking Screen Reading Workstations",
      "Elevators and Wheelchair Ramps Across All Buildings",
      "Audio Resource Section in Central Library",
      "Volunteer Scribe Registry"
    ],
    timings: "Mon - Sat: 8:00 AM - 5:00 PM",
    description: "Centuries-old autonomous institution with strong academic traditions, barrier-free access, and active enabling cells for disabled scholars.",
    rating: 4.9,
    tags: ["college", "colleges", "kolkata", "st xaviers", "b.com", "b.sc"]
  },

  // --- Jaipur / Rajasthan ---
  {
    id: "inst-uniraj-jaipur",
    name: "University of Rajasthan - Equal Opportunity & Enabling Cell",
    type: "State University & College System",
    category: "college",
    address: "Jawahar Lal Nehru Marg, Jaipur, Rajasthan - 302004",
    city: "Jaipur",
    state: "Rajasthan",
    lat: 26.8851,
    lng: 75.8142,
    phone: "+91-141-2708824",
    email: "registrar@uniraj.ac.in",
    website: "https://www.uniraj.ac.in",
    courses: [
      "B.A., B.Sc., B.Com., LL.B., M.A. Programs",
      "Special Education Teacher Training Diplomas",
      "Digital Literacy for Visually Impaired"
    ],
    accessibilityFeatures: [
      "Braille Section in Central Library",
      "Audio Recorded Book Bank Facility",
      "Ramp Access in Departments & Exam Halls",
      "Accessible Drinking Water and Sanitary Facilities"
    ],
    timings: "Mon - Sat: 10:00 AM - 5:00 PM",
    description: "Oldest higher education institution in Rajasthan providing structured academic support, fee concessions, and library resources for PwD students.",
    rating: 4.6,
    tags: ["college", "university", "jaipur", "rajasthan", "uniraj"]
  },

  // --- Lucknow / Uttar Pradesh ---
  {
    id: "inst-dsmru-lucknow",
    name: "Dr. Shakuntala Misra National Rehabilitation University (DSMNRU)",
    type: "Premier Inclusive State University",
    category: "college",
    address: "Mohaan Road, Lucknow, Uttar Pradesh - 226017",
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8188,
    lng: 80.8295,
    phone: "+91-522-2998471",
    email: "registrar@dsmru.up.nic.in",
    website: "http://dsmru.up.nic.in",
    courses: [
      "B.Tech in Computer Science, Mechanical & Civil Engg",
      "B.Ed. & M.Ed. in Special Education (VI, HI, ID)",
      "B.A., B.Com., LL.B., M.B.A., M.C.A.",
      "Prosthetics & Orthotics (BPO) and Audiology (BASLP)"
    ],
    accessibilityFeatures: [
      "India's First 50% Reserved University for Disabled Students",
      "100% Barrier-Free Smart Classrooms with Sign Language Video Sync",
      "Tactile Pathways, Talking Elevators & Braille Signboards",
      "Accessible Ultra-Modern Hostels & Sports Complex"
    ],
    timings: "Mon - Sat: 9:00 AM - 5:00 PM",
    description: "India's first specialized rehabilitation university with 50% reservation for students with disabilities across all undergraduate, engineering, and legal courses.",
    rating: 4.9,
    tags: ["college", "university", "lucknow", "dsmru", "special education", "engineering"]
  }
];

export const POPULAR_CITIES = [
  { name: "Delhi NCR (New Delhi, Noida, Gurgaon)", lat: 28.6139, lng: 77.2090 },
  { name: "Dehradun (Uttarakhand)", lat: 30.3165, lng: 78.0322 },
  { name: "Mumbai (Maharashtra)", lat: 19.0760, lng: 72.8777 },
  { name: "Pune (Maharashtra)", lat: 18.5204, lng: 73.8567 },
  { name: "Bengaluru (Karnataka)", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai (Tamil Nadu)", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad (Telangana)", lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata (West Bengal)", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad (Gujarat)", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur (Rajasthan)", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow (Uttar Pradesh)", lat: 26.8467, lng: 80.9462 },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Bhopal (Madhya Pradesh)", lat: 23.2599, lng: 77.4126 },
  { name: "Cuttack / Bhubaneswar (Odisha)", lat: 20.4625, lng: 85.8828 },
  { name: "Patna (Bihar)", lat: 25.5941, lng: 85.1376 },
];
