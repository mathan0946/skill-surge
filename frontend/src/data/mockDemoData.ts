/**
 * Mock Demo Data for SkillSurge Workflow Recording
 * Based on: Mathana Guru Sabareesan S's Resume
 */

// ============ PROFILE DATA ============
export const DEMO_PROFILE = {
  id: "demo-profile-001",
  userId: "demo-user-001",
  name: "Mathana Guru Sabareesan S",
  email: "mathanaguru18@gmail.com",
  phone: "+91-8248625858",
  
  skills: [
    { id: "s1", name: "Python", level: 90, category: "Languages", connections: ["s5", "s6", "s7"], yearsOfExperience: 3, evidence: "Primary language for all AI/ML projects" },
    { id: "s2", name: "JavaScript", level: 80, category: "Languages", connections: ["s9", "s10"], yearsOfExperience: 2, evidence: "Used in React.js and Node.js projects" },
    { id: "s3", name: "Java", level: 65, category: "Languages", connections: [], yearsOfExperience: 1, evidence: "Academic coursework" },
    { id: "s4", name: "SQL", level: 70, category: "Languages", connections: ["s14"], yearsOfExperience: 2, evidence: "Database design and queries" },
    { id: "s5", name: "TensorFlow", level: 85, category: "AI/ML", connections: ["s1", "s6"], yearsOfExperience: 2, evidence: "94% accuracy model with MobileNetV2" },
    { id: "s6", name: "PyTorch", level: 75, category: "AI/ML", connections: ["s1", "s5"], yearsOfExperience: 1.5, evidence: "Deep learning projects" },
    { id: "s7", name: "OpenAI API", level: 88, category: "AI/ML", connections: ["s1", "s8"], yearsOfExperience: 1, evidence: "RAG integration, multilingual chatbot" },
    { id: "s8", name: "LangChain", level: 80, category: "AI/ML", connections: ["s7"], yearsOfExperience: 1, evidence: "RAG implementations" },
    { id: "s9", name: "React.js", level: 78, category: "Frontend", connections: ["s2", "s10"], yearsOfExperience: 1.5, evidence: "Full-stack web development" },
    { id: "s10", name: "Node.js", level: 72, category: "Backend", connections: ["s2", "s11"], yearsOfExperience: 1.5, evidence: "Backend API development" },
    { id: "s11", name: "FastAPI", level: 82, category: "Backend", connections: ["s1"], yearsOfExperience: 1, evidence: "REST API development" },
    { id: "s12", name: "Computer Vision", level: 80, category: "AI/ML", connections: ["s5", "s13"], yearsOfExperience: 1.5, evidence: "TomatoCare disease detection" },
    { id: "s13", name: "NLP", level: 78, category: "AI/ML", connections: ["s7", "s8"], yearsOfExperience: 1, evidence: "Multilingual chatbot, RAG" },
    { id: "s14", name: "MongoDB", level: 68, category: "Database", connections: ["s10"], yearsOfExperience: 1, evidence: "NoSQL database projects" },
    { id: "s15", name: "Transfer Learning", level: 82, category: "AI/ML", connections: ["s5", "s6"], yearsOfExperience: 1, evidence: "MobileNetV2 fine-tuning" },
  ],

  skillGraph: [], // Will be populated from skills

  experience: [
    {
      company: "IIT Kharagpur Data Science Hackathon",
      role: "Team Leader - Generative AI Solution Development",
      duration: "2024",
      highlights: [
        "Led team of 4 to develop innovative Generative AI solution",
        "Ranked 7th place among 10,000 participants nationally",
        "Demonstrated exceptional problem-solving and technical leadership"
      ]
    },
    {
      company: "Technical Innovation & Research",
      role: "AI/ML Researcher & Developer",
      duration: "2022-Present",
      highlights: [
        "Led technical projects spanning EdTech, AgriTech, Healthcare AI",
        "Mentored junior students in AI/ML and full-stack development",
        "Research automation and specialized domain applications"
      ]
    }
  ],

  education: [
    {
      degree: "B.Tech in Computer Science and Engineering (AI Specialization)",
      institution: "Amrita Vishwa Vidyapeetham, Coimbatore",
      year: "2023-27",
      gpa: "8.53/10.0"
    },
    {
      degree: "Higher Secondary Certificate",
      institution: "Srinivasa Public School",
      year: "2021-23",
      gpa: "91%"
    }
  ],

  projects: [
    {
      id: "p1",
      name: "AI Multilingual Learning Assistant with Sign Language",
      description: "Conversational AI supporting 7 languages with audio, text, and sign language accessibility",
      technologies: ["Python", "OpenAI API", "RAG", "Speech-to-Text", "Text-to-Speech", "NLP"],
      role: "Lead Developer",
      impact: "Made education accessible to hearing-impaired students in 7 regional languages"
    },
    {
      id: "p2",
      name: "AI Research Paper Evaluation & Conference Matching",
      description: "Intelligent system using one-shot classification for conference recommendations",
      technologies: ["Python", "One-Shot Learning", "Vector Database", "NLP", "Chatbot Development"],
      role: "Full Stack Developer",
      impact: "Automated conference matching with transparent acceptance/rejection insights"
    },
    {
      id: "p3",
      name: "TomatoCare: AI Smart Disease Detection & Treatment",
      description: "Agricultural AI platform for crop disease management with 94% accuracy",
      technologies: ["Python", "TensorFlow", "MobileNetV2", "Transfer Learning", "Computer Vision", "IoT"],
      role: "ML Engineer",
      impact: "94% accuracy in disease identification, integrated weather-aware recommendations"
    }
  ],

  achievements: [
    {
      id: "a1",
      title: "7th Place - IIT Kharagpur Data Science Hackathon 2024",
      description: "Led team to top 10 finish among 10,000+ participants with Generative AI solution",
      metrics: "Top 0.07% nationally"
    },
    {
      id: "a2",
      title: "Technical Leadership Award",
      description: "Led cross-domain projects in EdTech, AgriTech, and Healthcare AI",
      metrics: "4+ major projects delivered"
    }
  ],

  certifications: [
    {
      id: "c1",
      name: "Python and Machine Learning Specialist",
      issuer: "Udemy",
      year: "2024"
    },
    {
      id: "c2",
      name: "Large Language Models Certification",
      issuer: "Udemy",
      year: "2024"
    }
  ],

  summary: "AI/ML Engineer with strong foundation in deep learning, NLP, and computer vision. Proven track record in hackathons (7th place among 10,000 at IIT Kharagpur). Experienced in building production-ready AI systems including multilingual chatbots, research paper analysis, and agricultural AI. Strong technical leadership and mentoring skills.",
  
  strongestSkills: ["Python", "TensorFlow", "OpenAI API", "LangChain", "Computer Vision"],
  skillGaps: ["System Design", "Distributed Systems", "Advanced DSA", "Kubernetes"],
  
  totalYearsExperience: 2.5,
  seniorityLevel: "Junior-Mid"
};

// ============ ROLE RECOMMENDATIONS ============
export const DEMO_ROLES = [
  {
    id: "r1",
    title: "AI/ML Engineer",
    matchPercentage: 92,
    requiredSkills: ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "LangChain"],
    missingSkills: ["MLOps", "Kubernetes", "A/B Testing"],
    salary: "₹15-25 LPA",
    subjects: ["Machine Learning Fundamentals", "Deep Learning", "MLOps & Deployment", "System Design for ML"]
  },
  {
    id: "r2",
    title: "Full Stack AI Developer",
    matchPercentage: 88,
    requiredSkills: ["Python", "JavaScript", "React.js", "Node.js", "FastAPI", "OpenAI API"],
    missingSkills: ["TypeScript", "Docker", "CI/CD"],
    salary: "₹12-20 LPA",
    subjects: ["Frontend Mastery", "Backend Architecture", "AI Integration", "DevOps Basics"]
  },
  {
    id: "r3",
    title: "NLP Engineer",
    matchPercentage: 85,
    requiredSkills: ["Python", "NLP", "LangChain", "OpenAI API", "BERT", "Transformers"],
    missingSkills: ["Hugging Face Advanced", "Model Fine-tuning at Scale", "Vector DBs"],
    salary: "₹14-22 LPA",
    subjects: ["NLP Fundamentals", "Transformers & LLMs", "RAG Systems", "Production NLP"]
  },
  {
    id: "r4",
    title: "Computer Vision Engineer",
    matchPercentage: 82,
    requiredSkills: ["Python", "TensorFlow", "Computer Vision", "Transfer Learning", "OpenCV"],
    missingSkills: ["3D Vision", "Video Processing", "Edge Deployment"],
    salary: "₹14-24 LPA",
    subjects: ["CV Fundamentals", "Object Detection", "Segmentation", "Edge AI"]
  }
];

// ============ SUBJECT-WISE ROADMAP ============
export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  totalWeeks: number;
  completedWeeks: number;
  totalTasks: number;
  completedTasks: number;
  priority: "high" | "medium" | "low";
  weeks: Week[];
}

export interface Week {
  id: string;
  number: number;
  title: string;
  description: string;
  focus: string;
  isCompleted: boolean;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  type: "video" | "reading" | "problem" | "project" | "quiz";
  duration: string;
  difficulty: "easy" | "medium" | "hard";
  link?: string;
  completed: boolean;
  reason: string;
  platform?: string;
}

export const DEMO_SUBJECTS: Subject[] = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    description: "Master problem-solving skills essential for technical interviews",
    icon: "Code",
    color: "from-blue-500 to-cyan-500",
    totalWeeks: 6,
    completedWeeks: 0,
    totalTasks: 30,
    completedTasks: 0,
    priority: "high",
    weeks: [
      {
        id: "dsa-w1",
        number: 1,
        title: "Arrays & Hashing",
        description: "Master array manipulation and hash table techniques",
        focus: "Foundation",
        isCompleted: false,
        tasks: [
          { id: "dsa-w1-t1", title: "Two Sum", type: "problem", duration: "30 min", difficulty: "easy", link: "https://leetcode.com/problems/two-sum/", completed: false, reason: "Classic hash map problem - asked at Google, Amazon" },
          { id: "dsa-w1-t2", title: "Valid Anagram", type: "problem", duration: "20 min", difficulty: "easy", link: "https://leetcode.com/problems/valid-anagram/", completed: false, reason: "String + hash map fundamentals" },
          { id: "dsa-w1-t3", title: "Group Anagrams", type: "problem", duration: "35 min", difficulty: "medium", link: "https://leetcode.com/problems/group-anagrams/", completed: false, reason: "Hash map with sorting - Meta favorite" },
          { id: "dsa-w1-t4", title: "Top K Frequent Elements", type: "problem", duration: "40 min", difficulty: "medium", link: "https://leetcode.com/problems/top-k-frequent-elements/", completed: false, reason: "Heap + hash map combo" },
          { id: "dsa-w1-t5", title: "Arrays Masterclass", type: "video", duration: "1 hr", difficulty: "easy", link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", completed: false, reason: "Build strong foundation" },
        ]
      },
      {
        id: "dsa-w2",
        number: 2,
        title: "Two Pointers & Sliding Window",
        description: "Optimize array traversal with pointer techniques",
        focus: "Optimization",
        isCompleted: false,
        tasks: [
          { id: "dsa-w2-t1", title: "Container With Most Water", type: "problem", duration: "35 min", difficulty: "medium", link: "https://leetcode.com/problems/container-with-most-water/", completed: false, reason: "Classic two-pointer" },
          { id: "dsa-w2-t2", title: "3Sum", type: "problem", duration: "45 min", difficulty: "medium", link: "https://leetcode.com/problems/3sum/", completed: false, reason: "Essential - asked everywhere" },
          { id: "dsa-w2-t3", title: "Longest Substring Without Repeating", type: "problem", duration: "40 min", difficulty: "medium", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", completed: false, reason: "Sliding window classic" },
          { id: "dsa-w2-t4", title: "Minimum Window Substring", type: "problem", duration: "50 min", difficulty: "hard", link: "https://leetcode.com/problems/minimum-window-substring/", completed: false, reason: "Advanced sliding window" },
          { id: "dsa-w2-t5", title: "Sliding Window Patterns", type: "reading", duration: "45 min", difficulty: "medium", link: "https://leetcode.com/discuss/study-guide/", completed: false, reason: "Pattern recognition" },
        ]
      },
      {
        id: "dsa-w3",
        number: 3,
        title: "Stacks & Queues",
        description: "Master stack and queue data structures",
        focus: "Data Structures",
        isCompleted: false,
        tasks: [
          { id: "dsa-w3-t1", title: "Valid Parentheses", type: "problem", duration: "20 min", difficulty: "easy", link: "https://leetcode.com/problems/valid-parentheses/", completed: false, reason: "Stack fundamentals" },
          { id: "dsa-w3-t2", title: "Min Stack", type: "problem", duration: "30 min", difficulty: "medium", link: "https://leetcode.com/problems/min-stack/", completed: false, reason: "Design + stack" },
          { id: "dsa-w3-t3", title: "Daily Temperatures", type: "problem", duration: "40 min", difficulty: "medium", link: "https://leetcode.com/problems/daily-temperatures/", completed: false, reason: "Monotonic stack" },
          { id: "dsa-w3-t4", title: "Largest Rectangle in Histogram", type: "problem", duration: "50 min", difficulty: "hard", link: "https://leetcode.com/problems/largest-rectangle-in-histogram/", completed: false, reason: "Stack mastery" },
          { id: "dsa-w3-t5", title: "Stack Patterns Guide", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Visual learning" },
        ]
      },
      {
        id: "dsa-w4",
        number: 4,
        title: "Binary Search",
        description: "Master binary search and its variations",
        focus: "Algorithms",
        isCompleted: false,
        tasks: [
          { id: "dsa-w4-t1", title: "Binary Search", type: "problem", duration: "15 min", difficulty: "easy", link: "https://leetcode.com/problems/binary-search/", completed: false, reason: "Foundation" },
          { id: "dsa-w4-t2", title: "Search in Rotated Sorted Array", type: "problem", duration: "40 min", difficulty: "medium", link: "https://leetcode.com/problems/search-in-rotated-sorted-array/", completed: false, reason: "Google favorite" },
          { id: "dsa-w4-t3", title: "Find Minimum in Rotated Sorted Array", type: "problem", duration: "35 min", difficulty: "medium", link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", completed: false, reason: "Binary search variation" },
          { id: "dsa-w4-t4", title: "Koko Eating Bananas", type: "problem", duration: "45 min", difficulty: "medium", link: "https://leetcode.com/problems/koko-eating-bananas/", completed: false, reason: "Binary search on answer" },
          { id: "dsa-w4-t5", title: "Binary Search Patterns", type: "reading", duration: "30 min", difficulty: "medium", completed: false, reason: "Pattern mastery" },
        ]
      },
      {
        id: "dsa-w5",
        number: 5,
        title: "Trees & Graphs",
        description: "Navigate tree and graph structures",
        focus: "Advanced DS",
        isCompleted: false,
        tasks: [
          { id: "dsa-w5-t1", title: "Maximum Depth of Binary Tree", type: "problem", duration: "20 min", difficulty: "easy", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", completed: false, reason: "Tree basics" },
          { id: "dsa-w5-t2", title: "Validate BST", type: "problem", duration: "35 min", difficulty: "medium", link: "https://leetcode.com/problems/validate-binary-search-tree/", completed: false, reason: "BST properties" },
          { id: "dsa-w5-t3", title: "Number of Islands", type: "problem", duration: "40 min", difficulty: "medium", link: "https://leetcode.com/problems/number-of-islands/", completed: false, reason: "Graph traversal essential" },
          { id: "dsa-w5-t4", title: "Course Schedule", type: "problem", duration: "45 min", difficulty: "medium", link: "https://leetcode.com/problems/course-schedule/", completed: false, reason: "Topological sort" },
          { id: "dsa-w5-t5", title: "Graph Algorithms Crash Course", type: "video", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "Comprehensive overview" },
        ]
      },
      {
        id: "dsa-w6",
        number: 6,
        title: "Dynamic Programming",
        description: "Master DP patterns for optimization problems",
        focus: "Advanced Algorithms",
        isCompleted: false,
        tasks: [
          { id: "dsa-w6-t1", title: "Climbing Stairs", type: "problem", duration: "20 min", difficulty: "easy", link: "https://leetcode.com/problems/climbing-stairs/", completed: false, reason: "DP introduction" },
          { id: "dsa-w6-t2", title: "Coin Change", type: "problem", duration: "40 min", difficulty: "medium", link: "https://leetcode.com/problems/coin-change/", completed: false, reason: "Classic DP" },
          { id: "dsa-w6-t3", title: "Longest Increasing Subsequence", type: "problem", duration: "45 min", difficulty: "medium", link: "https://leetcode.com/problems/longest-increasing-subsequence/", completed: false, reason: "1D DP mastery" },
          { id: "dsa-w6-t4", title: "Unique Paths", type: "problem", duration: "35 min", difficulty: "medium", link: "https://leetcode.com/problems/unique-paths/", completed: false, reason: "2D DP" },
          { id: "dsa-w6-t5", title: "DP Patterns Masterclass", type: "video", duration: "2 hr", difficulty: "hard", completed: false, reason: "Complete DP patterns" },
        ]
      }
    ]
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Learn to design scalable distributed systems",
    icon: "Server",
    color: "from-purple-500 to-pink-500",
    totalWeeks: 4,
    completedWeeks: 0,
    totalTasks: 20,
    completedTasks: 0,
    priority: "high",
    weeks: [
      {
        id: "sd-w1",
        number: 1,
        title: "System Design Fundamentals",
        description: "Core concepts and building blocks",
        focus: "Foundation",
        isCompleted: false,
        tasks: [
          { id: "sd-w1-t1", title: "System Design Primer", type: "reading", duration: "2 hr", difficulty: "medium", link: "https://github.com/donnemartin/system-design-primer", completed: false, reason: "Essential foundation" },
          { id: "sd-w1-t2", title: "CAP Theorem Explained", type: "video", duration: "45 min", difficulty: "medium", completed: false, reason: "Distributed systems basics" },
          { id: "sd-w1-t3", title: "Load Balancing Concepts", type: "reading", duration: "30 min", difficulty: "easy", completed: false, reason: "Scalability fundamentals" },
          { id: "sd-w1-t4", title: "Database Sharding", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Data partitioning" },
          { id: "sd-w1-t5", title: "Caching Strategies", type: "reading", duration: "45 min", difficulty: "medium", completed: false, reason: "Performance optimization" },
        ]
      },
      {
        id: "sd-w2",
        number: 2,
        title: "Design URL Shortener & Rate Limiter",
        description: "Classic system design problems",
        focus: "Practical Design",
        isCompleted: false,
        tasks: [
          { id: "sd-w2-t1", title: "Design URL Shortener", type: "project", duration: "2 hr", difficulty: "medium", completed: false, reason: "Most common interview question" },
          { id: "sd-w2-t2", title: "Design Rate Limiter", type: "project", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "API design essential" },
          { id: "sd-w2-t3", title: "Hash Function Deep Dive", type: "reading", duration: "30 min", difficulty: "medium", completed: false, reason: "URL shortener prerequisite" },
          { id: "sd-w2-t4", title: "Token Bucket Algorithm", type: "video", duration: "45 min", difficulty: "medium", completed: false, reason: "Rate limiting algorithm" },
          { id: "sd-w2-t5", title: "Mini Project: Build Rate Limiter", type: "project", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "Hands-on practice" },
        ]
      },
      {
        id: "sd-w3",
        number: 3,
        title: "Design Chat System & Notification",
        description: "Real-time systems design",
        focus: "Real-time Systems",
        isCompleted: false,
        tasks: [
          { id: "sd-w3-t1", title: "Design WhatsApp/Messenger", type: "project", duration: "2.5 hr", difficulty: "hard", completed: false, reason: "Real-time messaging" },
          { id: "sd-w3-t2", title: "WebSocket vs Polling", type: "reading", duration: "30 min", difficulty: "medium", completed: false, reason: "Real-time communication" },
          { id: "sd-w3-t3", title: "Design Notification System", type: "project", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "Push notification architecture" },
          { id: "sd-w3-t4", title: "Message Queues (Kafka, RabbitMQ)", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Async processing" },
          { id: "sd-w3-t5", title: "Design Discord", type: "project", duration: "2 hr", difficulty: "hard", completed: false, reason: "Complex real-time system" },
        ]
      },
      {
        id: "sd-w4",
        number: 4,
        title: "Design ML Systems",
        description: "System design for AI/ML applications",
        focus: "ML Systems",
        isCompleted: false,
        tasks: [
          { id: "sd-w4-t1", title: "Design Recommendation System", type: "project", duration: "2 hr", difficulty: "hard", completed: false, reason: "ML + System Design combo" },
          { id: "sd-w4-t2", title: "Design Search Autocomplete", type: "project", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "NLP + System Design" },
          { id: "sd-w4-t3", title: "ML Model Serving at Scale", type: "reading", duration: "1 hr", difficulty: "hard", completed: false, reason: "Production ML" },
          { id: "sd-w4-t4", title: "Feature Store Design", type: "video", duration: "45 min", difficulty: "medium", completed: false, reason: "MLOps essential" },
          { id: "sd-w4-t5", title: "Design YouTube/Netflix", type: "project", duration: "2.5 hr", difficulty: "hard", completed: false, reason: "Video streaming + recommendations" },
        ]
      }
    ]
  },
  {
    id: "ai-ml",
    name: "AI/ML Interview Prep",
    description: "Strengthen your AI/ML fundamentals for interviews",
    icon: "Brain",
    color: "from-green-500 to-emerald-500",
    totalWeeks: 4,
    completedWeeks: 0,
    totalTasks: 20,
    completedTasks: 0,
    priority: "medium",
    weeks: [
      {
        id: "ml-w1",
        number: 1,
        title: "ML Fundamentals Review",
        description: "Core ML concepts and algorithms",
        focus: "Fundamentals",
        isCompleted: false,
        tasks: [
          { id: "ml-w1-t1", title: "Linear Regression Deep Dive", type: "reading", duration: "1 hr", difficulty: "medium", completed: false, reason: "Foundation algorithm" },
          { id: "ml-w1-t2", title: "Logistic Regression & Classification", type: "video", duration: "45 min", difficulty: "medium", completed: false, reason: "Classification basics" },
          { id: "ml-w1-t3", title: "Decision Trees & Random Forests", type: "reading", duration: "1 hr", difficulty: "medium", completed: false, reason: "Tree-based models" },
          { id: "ml-w1-t4", title: "SVM Explained", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Classic ML algorithm" },
          { id: "ml-w1-t5", title: "ML Interview Questions Set 1", type: "quiz", duration: "45 min", difficulty: "medium", completed: false, reason: "Test knowledge" },
        ]
      },
      {
        id: "ml-w2",
        number: 2,
        title: "Deep Learning Essentials",
        description: "Neural networks and deep learning",
        focus: "Deep Learning",
        isCompleted: false,
        tasks: [
          { id: "ml-w2-t1", title: "Neural Network Backpropagation", type: "reading", duration: "1.5 hr", difficulty: "hard", completed: false, reason: "Core DL concept" },
          { id: "ml-w2-t2", title: "CNN Architecture Deep Dive", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Computer vision foundation" },
          { id: "ml-w2-t3", title: "RNN & LSTM Explained", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Sequence modeling" },
          { id: "ml-w2-t4", title: "Attention Mechanism", type: "reading", duration: "1 hr", difficulty: "hard", completed: false, reason: "Transformer prerequisite" },
          { id: "ml-w2-t5", title: "Build CNN from Scratch", type: "project", duration: "2 hr", difficulty: "medium", completed: false, reason: "Hands-on practice" },
        ]
      },
      {
        id: "ml-w3",
        number: 3,
        title: "Transformers & LLMs",
        description: "Modern NLP and large language models",
        focus: "NLP/LLMs",
        isCompleted: false,
        tasks: [
          { id: "ml-w3-t1", title: "Transformer Architecture", type: "reading", duration: "2 hr", difficulty: "hard", link: "https://jalammar.github.io/illustrated-transformer/", completed: false, reason: "Essential for modern AI" },
          { id: "ml-w3-t2", title: "BERT vs GPT Comparison", type: "video", duration: "1 hr", difficulty: "medium", completed: false, reason: "Understand LLM variants" },
          { id: "ml-w3-t3", title: "Fine-tuning LLMs", type: "project", duration: "2 hr", difficulty: "hard", completed: false, reason: "Practical LLM skills" },
          { id: "ml-w3-t4", title: "RAG Implementation", type: "project", duration: "2 hr", difficulty: "medium", completed: false, reason: "Your strength - polish it" },
          { id: "ml-w3-t5", title: "LLM Interview Questions", type: "quiz", duration: "1 hr", difficulty: "hard", completed: false, reason: "LLM-specific prep" },
        ]
      },
      {
        id: "ml-w4",
        number: 4,
        title: "MLOps & Production ML",
        description: "Deploying and maintaining ML systems",
        focus: "MLOps",
        isCompleted: false,
        tasks: [
          { id: "ml-w4-t1", title: "MLOps Fundamentals", type: "reading", duration: "1 hr", difficulty: "medium", completed: false, reason: "Production ML essentials" },
          { id: "ml-w4-t2", title: "Model Monitoring & Drift", type: "video", duration: "45 min", difficulty: "medium", completed: false, reason: "Maintain model quality" },
          { id: "ml-w4-t3", title: "Docker for ML", type: "project", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "Containerization" },
          { id: "ml-w4-t4", title: "Kubernetes Basics", type: "reading", duration: "1 hr", difficulty: "hard", completed: false, reason: "Orchestration" },
          { id: "ml-w4-t5", title: "Deploy Model to Production", type: "project", duration: "2 hr", difficulty: "medium", completed: false, reason: "End-to-end deployment" },
        ]
      }
    ]
  },
  {
    id: "behavioral",
    name: "Behavioral & Soft Skills",
    description: "Ace the behavioral round with structured preparation",
    icon: "Users",
    color: "from-orange-500 to-yellow-500",
    totalWeeks: 2,
    completedWeeks: 0,
    totalTasks: 10,
    completedTasks: 0,
    priority: "medium",
    weeks: [
      {
        id: "bh-w1",
        number: 1,
        title: "STAR Method & Story Bank",
        description: "Build your behavioral answer toolkit",
        focus: "Preparation",
        isCompleted: false,
        tasks: [
          { id: "bh-w1-t1", title: "STAR Method Mastery", type: "reading", duration: "30 min", difficulty: "easy", completed: false, reason: "Structure your answers" },
          { id: "bh-w1-t2", title: "Build Your Story Bank", type: "project", duration: "2 hr", difficulty: "medium", completed: false, reason: "Prepare 10+ stories" },
          { id: "bh-w1-t3", title: "Leadership Questions Practice", type: "quiz", duration: "1 hr", difficulty: "medium", completed: false, reason: "Common category" },
          { id: "bh-w1-t4", title: "Conflict Resolution Stories", type: "project", duration: "1 hr", difficulty: "medium", completed: false, reason: "Tricky but important" },
          { id: "bh-w1-t5", title: "Mock Interview: Behavioral", type: "project", duration: "1 hr", difficulty: "medium", completed: false, reason: "Practice with AI" },
        ]
      },
      {
        id: "bh-w2",
        number: 2,
        title: "Company Research & Questions",
        description: "Company-specific preparation",
        focus: "Company Prep",
        isCompleted: false,
        tasks: [
          { id: "bh-w2-t1", title: "Research Target Companies", type: "reading", duration: "2 hr", difficulty: "easy", completed: false, reason: "Know the company" },
          { id: "bh-w2-t2", title: "Prepare Questions to Ask", type: "project", duration: "1 hr", difficulty: "easy", completed: false, reason: "Show interest" },
          { id: "bh-w2-t3", title: "Amazon Leadership Principles", type: "reading", duration: "1 hr", difficulty: "medium", completed: false, reason: "Amazon specific" },
          { id: "bh-w2-t4", title: "Google Googliness Prep", type: "reading", duration: "45 min", difficulty: "medium", completed: false, reason: "Google culture fit" },
          { id: "bh-w2-t5", title: "Final Mock Interview", type: "project", duration: "1.5 hr", difficulty: "medium", completed: false, reason: "Full simulation" },
        ]
      }
    ]
  }
];

// ============ DAILY PROBLEM ============
export const DEMO_DAILY_PROBLEM = {
  id: "daily-001",
  title: "LRU Cache",
  difficulty: "medium",
  link: "https://leetcode.com/problems/lru-cache/",
  description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations in O(1) time complexity.",
  reason: "Perfect for your level - combines HashMap + Doubly Linked List. Asked frequently at Google, Meta, and Amazon.",
  companies: ["Google", "Meta", "Amazon", "Microsoft"],
  topics: ["Hash Table", "Linked List", "Design"],
  frequency: 92,
  estimatedTime: "45 min",
  type: "problem",
  hints: [
    "Use a HashMap for O(1) lookup",
    "Use a Doubly Linked List to track recency",
    "The most recently used item goes to the head",
    "The least recently used item is at the tail"
  ]
};

// ============ EXPORT ALL ============
export const DEMO_DATA = {
  profile: DEMO_PROFILE,
  roles: DEMO_ROLES,
  subjects: DEMO_SUBJECTS,
  dailyProblem: DEMO_DAILY_PROBLEM,
};

export default DEMO_DATA;
