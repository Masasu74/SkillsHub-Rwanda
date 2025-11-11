import mongoose from 'mongoose';
import 'dotenv/config.js';
import Course from '../models/courseModel.js';
import Enrollment from '../models/enrollmentModel.js';
import User from '../models/userModel.js';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://masasu74:salomon123!@creditjambo.fad5qrn.mongodb.net/?appName=creditjambo';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const ensureUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    return existing;
  }

  const user = new User(userData);
  await user.save();
  return user;
};

const buildExercises = (moduleTitle) => [
  `Create a mini project that demonstrates "${moduleTitle}" in a real-world context.`,
  `Write a short reflection on how "${moduleTitle}" can benefit your community or workplace.`
];

const buildActivities = (moduleTitle) => [
  `Pair with a peer to review each other's work for "${moduleTitle}" and share two pieces of feedback each.`,
  `Document next steps you will take to deepen your mastery of "${moduleTitle}".`
];

const buildQuiz = (moduleTitle) => [
  {
    question: `What is the first step you should take when applying lessons from "${moduleTitle}"?`,
    options: [
      'Jump into implementation without planning',
      'Clarify the problem and desired outcome',
      'Wait for additional instructions before starting',
      'Ignore user feedback until the end'
    ],
    answerIndex: 1
  },
  {
    question: `How can you validate that you understand "${moduleTitle}"?`,
    options: [
      'Only re-read the notes',
      'Teach the concept to someone else or apply it practically',
      'Avoid any experimentation',
      'Rely solely on quiz scores'
    ],
    answerIndex: 1
  }
];

const createSampleCourses = async (instructors) => {
  const instructorByEmail = instructors.reduce((acc, instructor) => {
    acc[instructor.email] = instructor;
    return acc;
  }, {});

  const baseSampleCourses = [
    {
      title: 'Web Development Fundamentals',
      description:
        'Learn modern web development with HTML, CSS, and JavaScript while building responsive interfaces tailored for local needs.',
      category: 'technology',
      level: 'beginner',
      duration: 40,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'aline.uwase@skillshub.rw',
      modules: [
        {
          title: 'Getting Started with the Web',
          content: 'Introduction to the internet, browsers, and the fundamentals of building web pages.',
          videoUrl: 'https://player.vimeo.com/video/76979871',
          duration: 8,
          resources: ['Project brief', 'Web fundamentals cheat-sheet']
        },
        {
          title: 'HTML & Accessibility Essentials',
          content: 'Create semantic pages that are accessible and friendly to inclusive audiences.',
          videoUrl: 'https://player.vimeo.com/video/32785722',
          duration: 12,
          resources: ['Sample HTML project', 'Accessibility checklist']
        },
        {
          title: 'Responsive Styling with CSS',
          content: 'Design mobile-first layouts ideal for learners accessing content on low bandwidth.',
          videoUrl: 'https://player.vimeo.com/video/1084537',
          duration: 14,
          resources: ['Figma mockups', 'CSS utility reference']
        }
      ]
    },
    {
      title: 'Digital Marketing Basics',
      description:
        'Master storytelling for social media, community-led campaigns, and digital marketing analytics.',
      category: 'business',
      level: 'beginner',
      duration: 30,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'julien.ndoli@skillshub.rw',
      modules: [
        {
          title: 'Crafting a Digital Presence',
          content: 'How to plan marketing content that resonates with Rwandan youth.',
          videoUrl: 'https://player.vimeo.com/video/148751763',
          duration: 10,
          resources: ['Content calendar template', 'Brand voice worksheet']
        },
        {
          title: 'Platforms and Campaigns',
          content: 'Using social platforms and messaging apps to launch authentic campaigns.',
          videoUrl: 'https://player.vimeo.com/video/3239434',
          duration: 9,
          resources: ['Platform comparison matrix', 'Sample campaign storyboard']
        },
        {
          title: 'Measuring Impact',
          content: 'Track campaign performance and pivot using data-driven insights.',
          videoUrl: 'https://player.vimeo.com/video/64927331',
          duration: 8,
          resources: ['Analytics glossary', 'KPI dashboard template']
        }
      ]
    },
    {
      title: 'Entrepreneurship for Emerging Businesses',
      description:
        'Develop a practical business model, understand financial basics, and learn how to pitch your idea.',
      category: 'business',
      level: 'intermediate',
      duration: 36,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'julien.ndoli@skillshub.rw',
      modules: [
        {
          title: 'Designing a Value Proposition',
          content: 'Identify local problems and craft solutions with clear value.',
          videoUrl: 'https://player.vimeo.com/video/168648012',
          duration: 9,
          resources: ['Value proposition canvas', 'Community insight guide']
        },
        {
          title: 'Financial Health for Startups',
          content: 'Budgeting, pricing, and tracking key numbers for small businesses.',
          videoUrl: 'https://player.vimeo.com/video/14592941',
          duration: 11,
          resources: ['Budget spreadsheet', 'Cash-flow tracker']
        },
        {
          title: 'Pitching and Storytelling',
          content: 'Structure winning pitches that highlight social and economic impact.',
          videoUrl: 'https://player.vimeo.com/video/138998813',
          duration: 12,
          resources: ['Pitch deck template', 'Storytelling checklist']
        }
      ]
    },
    {
      title: 'Hospitality Service Excellence',
      description:
        'Deliver memorable guest experiences with world-class hospitality standards tailored to Rwanda.',
      category: 'hospitality',
      level: 'intermediate',
      duration: 28,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'aline.uwase@skillshub.rw',
      modules: [
        {
          title: 'Foundations of Hospitality',
          content: 'Understand service culture and guest expectations in East Africa.',
          videoUrl: 'https://player.vimeo.com/video/85847266',
          duration: 8,
          resources: ['Service charter template', 'Guest persona workbook']
        },
        {
          title: 'Communication and Cultural Intelligence',
          content: 'Build empathy-driven communication skills and cultural awareness.',
          videoUrl: 'https://player.vimeo.com/video/70642716',
          duration: 10,
          resources: ['Role play scripts', 'Cultural phrases guide']
        },
        {
          title: 'Operational Excellence',
          content: 'Deliver consistent experiences through checklists and continuous improvement.',
          videoUrl: 'https://player.vimeo.com/video/68987823',
          duration: 9,
          resources: ['Daily checklist', 'Service recovery framework']
        }
      ]
    },
    {
      title: 'Intro to Data and AI Literacy',
      description:
        'Explore data fundamentals, AI concepts, and how emerging tools support Rwanda’s socio-economic growth.',
      category: 'technology',
      level: 'beginner',
      duration: 24,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'chloe.mugisha@skillshub.rw',
      modules: [
        {
          title: 'Data Everywhere',
          content: 'Understand data types, collection methods, and ethical considerations.',
          videoUrl: 'https://player.vimeo.com/video/24660481',
          duration: 7,
          resources: ['Data glossary', 'Ethics checklist']
        },
        {
          title: 'AI in Everyday Life',
          content: 'Discover practical AI use cases enhancing agriculture, finance, and education.',
          videoUrl: 'https://player.vimeo.com/video/27296860',
          duration: 9,
          resources: ['Case study booklet', 'AI literacy reading list']
        },
        {
          title: 'Hands-on with No-Code Tools',
          content: 'Work with accessible AI tools to automate tasks and prototype solutions.',
          videoUrl: 'https://player.vimeo.com/video/51528394',
          duration: 8,
          resources: ['Tool tutorials', 'Prototype brief']
        }
      ]
    },
    {
      title: 'Career Readiness Accelerator',
      description:
        'Build personal branding, portfolio storytelling, and interview skills that stand out.',
      category: 'business',
      level: 'advanced',
      duration: 18,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'chloe.mugisha@skillshub.rw',
      modules: [
        {
          title: 'Personal Brand Foundations',
          content: 'Articulate your story and align it with high-growth opportunities.',
          videoUrl: 'https://player.vimeo.com/video/39462472',
          duration: 6,
          resources: ['Personal brand canvas', 'Portfolio checklist']
        },
        {
          title: 'Portfolio and Case Studies',
          content: 'Document your learning journey and showcase community impact.',
          videoUrl: 'https://player.vimeo.com/video/134957822',
          duration: 7,
          resources: ['Case study template', 'Feedback rubric']
        },
        {
          title: 'Interviews & Networking',
          content: 'Practice interviews, pitch your strengths, and grow professional networks.',
          videoUrl: 'https://player.vimeo.com/video/52264828',
          duration: 5,
          resources: ['Interview question bank', 'Networking planner']
        }
      ]
    },
    {
      title: 'Backend Engineering with Node.js',
      description:
        'Design secure REST APIs, integrate MongoDB, and deploy scalable services tailored for Rwanda’s growing tech startups.',
      category: 'technology',
      level: 'intermediate',
      duration: 42,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'aline.uwase@skillshub.rw',
      modules: [
        {
          title: 'API Design Fundamentals',
          content: 'Learn routing, controllers, and data validation with Express and modern best practices.',
          videoUrl: 'https://player.vimeo.com/video/137857207',
          duration: 12,
          resources: ['API blueprint', 'Validation checklist']
        },
        {
          title: 'Working with MongoDB',
          content: 'Model data, create indexes, and handle aggregation pipelines for analytics.',
          videoUrl: 'https://player.vimeo.com/video/143274028',
          duration: 14,
          resources: ['Sample schemas', 'Aggregation workbook']
        },
        {
          title: 'Security & Deployment',
          content: 'Implement JWT auth, environment configs, and deploy with continuous integration.',
          videoUrl: 'https://player.vimeo.com/video/149046741',
          duration: 12,
          resources: ['Security checklist', 'Deployment guide']
        }
      ]
    },
    {
      title: 'UX Design for Digital Services',
      description:
        'Master human-centered design, prototyping, and usability testing for mobile-first experiences.',
      category: 'technology',
      level: 'beginner',
      duration: 26,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'chloe.mugisha@skillshub.rw',
      modules: [
        {
          title: 'Design Thinking Foundations',
          content: 'Empathise with users, define problems, and ideate solutions that solve real pain points.',
          videoUrl: 'https://player.vimeo.com/video/218766785',
          duration: 8,
          resources: ['Empathy map', 'Problem statement template']
        },
        {
          title: 'Wireframes to Prototypes',
          content: 'Turn sketches into interactive prototypes using accessible design tools.',
          videoUrl: 'https://player.vimeo.com/video/255180366',
          duration: 10,
          resources: ['Low-fidelity kit', 'Prototype checklist']
        },
        {
          title: 'Testing & Iteration',
          content: 'Run usability tests, collect insights, and iterate for inclusive experiences.',
          videoUrl: 'https://player.vimeo.com/video/217627810',
          duration: 8,
          resources: ['Test script template', 'Feedback synthesis board']
        }
      ]
    },
    {
      title: 'Agribusiness Operations & Market Access',
      description:
        'Support farmer cooperatives with supply planning, quality control, and market linkage strategies.',
      category: 'business',
      level: 'intermediate',
      duration: 32,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'julien.ndoli@skillshub.rw',
      modules: [
        {
          title: 'Value Chain Mapping',
          content: 'Identify stakeholders, logistics, and opportunities for efficiency improvements.',
          videoUrl: 'https://player.vimeo.com/video/146022717',
          duration: 9,
          resources: ['Value chain canvas', 'Stakeholder map']
        },
        {
          title: 'Quality & Compliance',
          content: 'Implement quality standards, traceability, and compliance for export readiness.',
          videoUrl: 'https://player.vimeo.com/video/96410324',
          duration: 11,
          resources: ['Quality checklist', 'Compliance workbook']
        },
        {
          title: 'Market Access Playbook',
          content: 'Craft go-to-market strategies and partnership proposals for regional buyers.',
          videoUrl: 'https://player.vimeo.com/video/150341998',
          duration: 10,
          resources: ['Market research template', 'Pitch outline']
        }
      ]
    },
    {
      title: 'Customer Success for Digital Products',
      description:
        'Deliver empathetic support, onboard users, and build retention programs for SaaS and mobile services.',
      category: 'business',
      level: 'beginner',
      duration: 20,
      price: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80',
      instructorEmail: 'aline.uwase@skillshub.rw',
      modules: [
        {
          title: 'Foundations of Customer Success',
          content: 'Understand success metrics, user journeys, and proactive support frameworks.',
          videoUrl: 'https://player.vimeo.com/video/214657964',
          duration: 6,
          resources: ['Success plan template', 'Customer journey map']
        },
        {
          title: 'Support Operations',
          content: 'Implement ticketing workflows, escalation paths, and knowledge bases.',
          videoUrl: 'https://player.vimeo.com/video/220015950',
          duration: 7,
          resources: ['Ticket triage guide', 'Knowledge base structure']
        },
        {
          title: 'Retention & Community',
          content: 'Build engagement programs, feedback loops, and advocacy campaigns.',
          videoUrl: 'https://player.vimeo.com/video/180695985',
          duration: 5,
          resources: ['Retention roadmap', 'Community playbook']
        }
      ]
    }
  ];

  const sampleCourses = baseSampleCourses.map((course) => ({
    ...course,
    modules: course.modules.map((module) => ({
      ...module,
      exercises: module.exercises?.length ? module.exercises : buildExercises(module.title),
      activities: module.activities?.length ? module.activities : buildActivities(module.title),
      quiz: module.quiz?.length ? module.quiz : buildQuiz(module.title)
    }))
  }));

  const createdCourses = [];

  for (const courseData of sampleCourses) {
    const instructor = instructorByEmail[courseData.instructorEmail];

    if (!instructor) {
      console.warn(`⚠️ No instructor found for ${courseData.title}, skipping course creation.`);
      continue;
    }

    const course = await Course.findOneAndUpdate(
      { title: courseData.title },
      {
        ...courseData,
        instructor: instructor._id,
        isPublished: true
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).populate('instructor', 'name email profile');

    createdCourses.push(course);
  }

  return createdCourses;
};

const createSampleEnrollments = async (student, courses) => {
  const targetCourses = courses.slice(0, 3);

  for (const course of targetCourses) {
    await Enrollment.findOneAndUpdate(
      {
        student: student._id,
        course: course._id
      },
      {},
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  }
};

const createInitialData = async () => {
  try {
    await connectDB();

    const admin = await ensureUser({
      name: 'SkillsHub Admin',
      email: 'admin@skillshub.rw',
      password: 'Admin123!',
      role: 'admin',
      profile: {
        bio: 'Platform administrator supporting students and instructors across Rwanda.',
        skills: ['Operations', 'Support'],
        location: 'Kigali, Rwanda'
      }
    });

    const instructors = await Promise.all([
      ensureUser({
        name: 'Aline Uwase',
        email: 'aline.uwase@skillshub.rw',
        password: 'Teach123!',
        role: 'instructor',
        profile: {
          bio: 'Frontend developer and mentor focused on inclusive digital skills.',
          skills: ['Frontend Development', 'Instructional Design'],
          location: 'Kigali, Rwanda'
        }
      }),
      ensureUser({
        name: 'Julien Ndoli',
        email: 'julien.ndoli@skillshub.rw',
        password: 'Teach123!',
        role: 'instructor',
        profile: {
          bio: 'Entrepreneurial coach empowering youth-led ventures in Rwanda.',
          skills: ['Entrepreneurship', 'Business Strategy'],
          location: 'Musanze, Rwanda'
        }
      }),
      ensureUser({
        name: 'Chloe Mugisha',
        email: 'chloe.mugisha@skillshub.rw',
        password: 'Teach123!',
        role: 'instructor',
        profile: {
          bio: 'Data literacy advocate and innovation facilitator.',
          skills: ['Data Literacy', 'AI Fundamentals'],
          location: 'Huye, Rwanda'
        }
      })
    ]);

    const sampleStudent = await ensureUser({
      name: 'Emmanuel Habimana',
      email: 'emmanuel@student.skillshub.rw',
      password: 'Student123!',
      role: 'student',
      profile: {
        bio: 'Aspiring web developer eager to solve local challenges.',
        skills: ['Problem Solving'],
        location: 'Rubavu, Rwanda'
      }
    });

    const courses = await createSampleCourses(instructors);

    await createSampleEnrollments(sampleStudent, courses);

    console.log('\n🚀 Sample data ready:');
    console.log(`   • Admin: ${admin.email}`);
    console.log(
      `   • Instructors: ${instructors.map((instructor) => instructor.email).join(', ')}`
    );
    console.log(`   • Student: ${sampleStudent.email}`);
    console.log(`   • Courses seeded: ${courses.length}`);
    console.log('   • Enrollments created for demo student');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating initial data:', error);
    process.exit(1);
  }
};

createInitialData();
