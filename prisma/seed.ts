import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Default HR User
  const existingHR = await prisma.hRUser.findUnique({
    where: { username: 'admin' },
  });

  if (!existingHR) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await prisma.hRUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'HR Administrator',
        email: 'hr.admin@corporate.com',
      },
    });
    console.log('✅ Created HR Administrator: admin / admin123');
  }

  // 2. Create Sample Employees
  const sampleEmployees = [
    {
      employeeId: 'EMP1001',
      firstName: 'Alex',
      middleName: 'R.',
      lastName: 'Morgan',
      email: 'alex.morgan@corporate.com',
      department: 'Engineering',
      designation: 'Software Engineer',
      office: 'New York HQ',
      joiningDate: new Date('2026-01-15'),
      status: 'ACTIVE',
    },
    {
      employeeId: 'EMP1002',
      firstName: 'Sarah',
      middleName: 'M.',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@corporate.com',
      department: 'Human Resources',
      designation: 'People Operations Lead',
      office: 'London Hub',
      joiningDate: new Date('2026-02-01'),
      status: 'ACTIVE',
    },
    {
      employeeId: 'EMP1003',
      firstName: 'Rajesh',
      middleName: 'K.',
      lastName: 'Kumar',
      email: 'rajesh.kumar@corporate.com',
      department: 'Product Management',
      designation: 'Senior Product Manager',
      office: 'Bengaluru Tech Park',
      joiningDate: new Date('2026-02-10'),
      status: 'ACTIVE',
    },
    {
      employeeId: 'EMP1004',
      firstName: 'Elena',
      middleName: null,
      lastName: 'Rostova',
      email: 'elena.rostova@corporate.com',
      department: 'Finance',
      designation: 'Financial Analyst',
      office: 'Zurich Office',
      joiningDate: new Date('2026-03-01'),
      status: 'ACTIVE',
    },
    {
      employeeId: 'EMP1005',
      firstName: 'Marcus',
      middleName: 'J.',
      lastName: 'Vance',
      email: 'marcus.vance@corporate.com',
      department: 'Marketing',
      designation: 'Brand Strategist',
      office: 'San Francisco HQ',
      joiningDate: new Date('2026-03-15'),
      status: 'ACTIVE',
    },
  ];

  for (const emp of sampleEmployees) {
    await prisma.employee.upsert({
      where: { employeeId: emp.employeeId },
      update: emp,
      create: emp,
    });
  }
  console.log(`✅ Upserted ${sampleEmployees.length} sample employees`);

  // 3. Create Induction Course
  const courseCode = 'IND-2026-01';
  let course = await prisma.course.findUnique({
    where: { code: courseCode },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Corporate Employee Induction & Onboarding 2026',
        description:
          'Comprehensive onboarding program covering organization culture, information security, workplace safety, and compliance standards.',
        code: courseCode,
        passingScore: 80.0,
        isPublished: true,
      },
    });
    console.log('✅ Created Course: Corporate Employee Induction 2026');
  }

  // 4. Create Modules and Lessons
  const modulesData = [
    {
      title: 'Module 1: Welcome & Corporate Culture',
      description: 'Introduction to our vision, mission, executive team, and workplace ethics.',
      sortOrder: 1,
      lessons: [
        {
          title: 'Lesson 1.1: Executive Welcome & Company Vision',
          description: 'A welcome address from the leadership team outlining our 2026 strategic vision.',
          contentType: 'VIDEO',
          videoUrl: 'https://www.youtube.com/watch?v=j4QivcD2EAQ',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 15,
        },
        {
          title: 'Lesson 1.2: Employee Handbook & Ethics Policy',
          description: 'Essential guidelines regarding workplace standards, ethics, and employee benefits.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 2,
          minDurationSeconds: 20,
        },
      ],
    },
    {
      title: 'Module 2: Information Security & Data Protection',
      description: 'Critical cybersecurity protocols, data privacy laws, and threat defense.',
      sortOrder: 2,
      lessons: [
        {
          title: 'Lesson 2.1: Cybersecurity Essentials & Phishing Defense',
          description: 'Learn how to identify phishing attempts, secure devices, and manage passwords.',
          contentType: 'VIDEO_PDF',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 1,
          minDurationSeconds: 30,
        },
        {
          title: 'Lesson 2.2: Data Privacy & Compliance (GDPR)',
          description: 'Overview of global privacy standards and strict corporate data handling policies.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 2,
          minDurationSeconds: 20,
        },
      ],
    },
    {
      title: 'Module 3: Workplace Safety & Operational Protocols',
      description: 'Physical security, emergency exit protocols, and incident reporting.',
      sortOrder: 3,
      lessons: [
        {
          title: 'Lesson 3.1: Emergency Response & Workplace Safety',
          description: 'Key procedures for fire drills, medical emergencies, and facility evacuation.',
          contentType: 'VIDEO',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 20,
        },
      ],
    },
  ];

  for (const modData of modulesData) {
    let existingMod = await prisma.module.findFirst({
      where: { courseId: course.id, title: modData.title },
    });

    if (!existingMod) {
      existingMod = await prisma.module.create({
        data: {
          courseId: course.id,
          title: modData.title,
          description: modData.description,
          sortOrder: modData.sortOrder,
        },
      });

      for (const lesData of modData.lessons) {
        await prisma.lesson.create({
          data: {
            moduleId: existingMod.id,
            title: lesData.title,
            description: lesData.description,
            contentType: lesData.contentType,
            videoUrl: lesData.videoUrl,
            pdfUrl: lesData.pdfUrl,
            sortOrder: lesData.sortOrder,
            minDurationSeconds: lesData.minDurationSeconds,
          },
        });
      }
    }
  }
  console.log('✅ Created Modules & Lessons with SharePoint sample links');

  // 5. Create Assessment Questions
  const questionsData = [
    {
      questionText: 'What is the primary core pillar of our corporate culture and operating principles?',
      optionsJSON: JSON.stringify([
        'Short-term profit maximization at all costs',
        'Customer Trust, Integrity, and Continuous Innovation',
        'Unregulated competitive isolation',
        'Minimal communication across departments',
      ]),
      correctOptionIndex: 1,
      explanation: 'Our corporate strategy is built on customer trust, integrity, and innovation.',
      points: 1.0,
      sortOrder: 1,
    },
    {
      questionText: 'What should an employee do immediately upon receiving a suspicious email asking for login credentials?',
      optionsJSON: JSON.stringify([
        'Reply with dummy password information',
        'Report to Security Operations (SOC) & do not click any links',
        'Forward the email to all department team members',
        'Delete the email without informing anyone',
      ]),
      correctOptionIndex: 1,
      explanation: 'Reporting suspicious emails to the Security team immediately prevents organization-wide phishing attacks.',
      points: 1.0,
      sortOrder: 2,
    },
    {
      questionText: 'Under corporate data security policy, how should sensitive company documents be shared externally?',
      optionsJSON: JSON.stringify([
        'Using unencrypted personal cloud drives',
        'Via password-protected SharePoint / OneDrive links with restricted permissions',
        'As raw attachments to external public email providers',
        'On public file sharing websites',
      ]),
      correctOptionIndex: 1,
      explanation: 'Sensitive documents must always be shared through secure SharePoint/OneDrive links with strict recipient access control.',
      points: 1.0,
      sortOrder: 3,
    },
    {
      questionText: 'Where can employees access official company announcements, HR policies, and benefits documents?',
      optionsJSON: JSON.stringify([
        'Public social media accounts',
        'Internal SharePoint Portal & LMS Hub',
        'Third-party forums',
        'Printed bulletin boards only',
      ]),
      correctOptionIndex: 1,
      explanation: 'The internal SharePoint portal and LMS are the authoritative sources for HR policies.',
      points: 1.0,
      sortOrder: 4,
    },
    {
      questionText: 'What is the mandatory procedure in the event of an emergency workplace evacuation alarm?',
      optionsJSON: JSON.stringify([
        'Remain at your desk until your supervisor visits',
        'Follow designated floor wardens and exit via nearest fire stairs immediately',
        'Use the building elevators for quick departure',
        'Wait in the cafeteria',
      ]),
      correctOptionIndex: 1,
      explanation: 'Always follow designated stairwells and floor wardens during emergency alarms.',
      points: 1.0,
      sortOrder: 5,
    },
  ];

  for (const q of questionsData) {
    const existingQ = await prisma.assessmentQuestion.findFirst({
      where: { courseId: course.id, questionText: q.questionText },
    });

    if (!existingQ) {
      await prisma.assessmentQuestion.create({
        data: {
          courseId: course.id,
          questionText: q.questionText,
          optionsJSON: q.optionsJSON,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          points: q.points,
          sortOrder: q.sortOrder,
        },
      });
    }
  }
  console.log('✅ Created Assessment Questions');

  console.log('🚀 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
