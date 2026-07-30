import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Modular Employee Induction LMS...');

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

  // 2. Create Standard Departments
  const departmentsData = [
    { name: 'IT Department', code: 'IT', description: 'Software engineering, Git workflow, coding standards & cloud deployments.' },
    { name: 'HR Department', code: 'HR', description: 'Recruitment, employee onboarding, talent management & HRMS systems.' },
    { name: 'Finance Department', code: 'FINANCE', description: 'Financial planning, accounting policies, audits & expense management.' },
    { name: 'Survey Department', code: 'SURVEY', description: 'GIS mapping, spatial analysis, land surveys & field operations.' },
    { name: 'Property Tax Department', code: 'PROPERTY_TAX', description: 'Property assessments, tax workflows, revenue audits & municipal applications.' },
    { name: 'MIS Department', code: 'MIS', description: 'Management reporting standards, Power BI dashboards & executive data analytics.' },
  ];

  const deptMap = new Map<string, string>(); // Code -> Department ID

  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, description: dept.description },
      create: { name: dept.name, code: dept.code, description: dept.description },
    });
    deptMap.set(dept.code, d.id);
  }
  console.log(`✅ Upserted ${departmentsData.length} core departments`);

  // 3. Create Sample Employees assigned to Departments
  const sampleEmployees = [
    {
      employeeId: 'EMP7777',
      firstName: 'Kaustubh',
      middleName: null,
      lastName: 'Bhatlawande',
      email: 'kaustubh@company.local',
      department: 'IT Department',
      departmentId: deptMap.get('IT'),
      designation: 'Software Engineer',
      office: 'Head Office',
      joiningDate: new Date('2026-01-01'),
      status: 'ACTIVE',
      isMasterTester: true,
    },
    {
      employeeId: 'EMP1001',
      firstName: 'Alex',
      middleName: 'R.',
      lastName: 'Morgan',
      email: 'alex.morgan@corporate.com',
      department: 'IT Department',
      departmentId: deptMap.get('IT'),
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
      department: 'HR Department',
      departmentId: deptMap.get('HR'),
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
      department: 'Finance Department',
      departmentId: deptMap.get('FINANCE'),
      designation: 'Senior Financial Analyst',
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
      department: 'Survey Department',
      departmentId: deptMap.get('SURVEY'),
      designation: 'GIS Lead Surveyor',
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
      department: 'Property Tax Department',
      departmentId: deptMap.get('PROPERTY_TAX'),
      designation: 'Property Tax Specialist',
      office: 'San Francisco HQ',
      joiningDate: new Date('2026-03-15'),
      status: 'ACTIVE',
    },
    {
      employeeId: 'EMP1006',
      firstName: 'Priya',
      middleName: 'S.',
      lastName: 'Sharma',
      email: 'priya.sharma@corporate.com',
      department: 'MIS Department',
      departmentId: deptMap.get('MIS'),
      designation: 'Data Analyst & Power BI Lead',
      office: 'Mumbai Hub',
      joiningDate: new Date('2026-04-01'),
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
  console.log(`✅ Upserted ${sampleEmployees.length} sample employees with department links`);

  // 4. Create Single Employee Induction Course
  const courseCode = 'IND-2026-01';
  let course = await prisma.course.findUnique({
    where: { code: courseCode },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Employee Induction Program 2026',
        description:
          'Unified corporate onboarding curriculum covering common organizational standards followed by specialized department training.',
        code: courseCode,
        passingScore: 80.0,
        isPublished: true,
      },
    });
    console.log('✅ Created Course: Employee Induction Program 2026');
  }

  // Clear old modules/lessons if re-running seed to ensure clean setup
  // 5. Create COMMON Modules & Lessons
  const commonModules = [
    {
      title: 'Common Module 1: Company Introduction, Vision & Mission',
      description: 'Introduction to organizational history, executive leadership, and strategic 2026 vision.',
      moduleType: 'COMMON',
      departmentId: null,
      sortOrder: 1,
      lessons: [
        {
          title: 'Lesson 1.1: Executive Welcome & Strategic Vision',
          description: 'A welcome address from our leadership team detailing company milestones and mission.',
          contentType: 'VIDEO',
          videoUrl: 'https://www.youtube.com/watch?v=j4QivcD2EAQ',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 15,
        },
        {
          title: 'Lesson 1.2: Core Values & Corporate Governance',
          description: 'Overview of fundamental corporate principles, integrity standards, and ethics.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 2,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What is the primary core pillar of our corporate culture and operating principles?',
          options: [
            'Short-term profit maximization at all costs',
            'Customer Trust, Integrity, and Continuous Innovation',
            'Unregulated competitive isolation',
            'Minimal communication across departments',
          ],
          correctOptionIndex: 1,
          explanation: 'Our corporate strategy is built on customer trust, integrity, and innovation.',
          points: 1.0,
        },
      ],
    },
    {
      title: 'Common Module 2: HR Policies & Code of Conduct',
      description: 'Workplace behavior, attendance policies, leave management, and employee handbook.',
      moduleType: 'COMMON',
      departmentId: null,
      sortOrder: 2,
      lessons: [
        {
          title: 'Lesson 2.1: Code of Conduct & Workplace Ethics',
          description: 'Essential rules regarding professionalism, diversity, and non-discrimination.',
          contentType: 'VIDEO_PDF',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 1,
          minDurationSeconds: 30,
        },
      ],
      questions: [
        {
          questionText: 'Where can employees access official company announcements, HR policies, and benefits documents?',
          options: [
            'Public social media accounts',
            'Internal SharePoint Portal & LMS Hub',
            'Third-party public forums',
            'Printed bulletin boards only',
          ],
          correctOptionIndex: 1,
          explanation: 'The internal SharePoint portal and LMS are authoritative sources for HR policies.',
          points: 1.0,
        },
      ],
    },
    {
      title: 'Common Module 3: Information Security & IT Policies',
      description: 'Cybersecurity protocols, data privacy laws, password management, and threat defense.',
      moduleType: 'COMMON',
      departmentId: null,
      sortOrder: 3,
      lessons: [
        {
          title: 'Lesson 3.1: Cybersecurity Essentials & Phishing Defense',
          description: 'Identify phishing attempts, secure work devices, and maintain password hygiene.',
          contentType: 'VIDEO',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What should an employee do immediately upon receiving a suspicious email asking for login credentials?',
          options: [
            'Reply with dummy password information',
            'Report to Security Operations (SOC) & do not click any links',
            'Forward the email to all department team members',
            'Delete the email without informing anyone',
          ],
          correctOptionIndex: 1,
          explanation: 'Reporting suspicious emails to Security immediately prevents phishing attacks.',
          points: 1.0,
        },
        {
          questionText: 'Under corporate data security policy, how should sensitive company documents be shared externally?',
          options: [
            'Using unencrypted personal cloud drives',
            'Via password-protected SharePoint / OneDrive links with restricted permissions',
            'As raw attachments to external public email providers',
            'On public file sharing websites',
          ],
          correctOptionIndex: 1,
          explanation: 'Sensitive documents must always be shared through secure SharePoint links.',
          points: 1.0,
        },
      ],
    },
    {
      title: 'Common Module 4: Workplace Safety & Operational Protocols',
      description: 'Physical security, emergency response, fire safety, and incident reporting.',
      moduleType: 'COMMON',
      departmentId: null,
      sortOrder: 4,
      lessons: [
        {
          title: 'Lesson 4.1: Emergency Response & Facility Safety',
          description: 'Key procedures for fire drills, medical emergencies, and facility evacuation.',
          contentType: 'VIDEO',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What is the mandatory procedure in the event of an emergency workplace evacuation alarm?',
          options: [
            'Remain at your desk until your supervisor visits',
            'Follow designated floor wardens and exit via nearest fire stairs immediately',
            'Use building elevators for quick departure',
            'Wait in the cafeteria',
          ],
          correctOptionIndex: 1,
          explanation: 'Always follow designated stairwells and floor wardens during emergency alarms.',
          points: 1.0,
        },
      ],
    },
  ];

  // 6. Create DEPARTMENT-SPECIFIC Modules & Lessons
  const departmentModules = [
    // IT Department Module
    {
      title: 'IT Department: Development Standards & Git Workflow',
      description: 'Coding guidelines, Git branching strategy, code reviews, and CI/CD deployment process.',
      moduleType: 'DEPARTMENT',
      departmentId: deptMap.get('IT'),
      sortOrder: 10,
      lessons: [
        {
          title: 'IT Lesson 1: Development Standards & Git Workflow',
          description: 'Master git feature branching, pull request reviews, and commit naming standards.',
          contentType: 'VIDEO_PDF',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 1,
          minDurationSeconds: 25,
        },
        {
          title: 'IT Lesson 2: Coding Guidelines & Deployment Pipeline',
          description: 'Learn automated testing requirements, linting rules, and production deployment steps.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 2,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'According to IT development standards, what branch should be created for developing a new feature?',
          options: [
            'Push code directly to main/production branch',
            'Create a dedicated feature branch from main/dev branch (e.g., feature/feature-name)',
            'Develop on a local untracked temporary folder without Git',
            'Commit directly to hotfix branch',
          ],
          correctOptionIndex: 1,
          explanation: 'All new feature development must take place on dedicated feature branches via Pull Requests.',
          points: 1.0,
        },
      ],
    },

    // HR Department Module
    {
      title: 'HR Department: Recruitment Process & HRMS Usage',
      description: 'End-to-end recruitment workflow, applicant tracking, employee onboarding, and HRMS portal operations.',
      moduleType: 'DEPARTMENT',
      departmentId: deptMap.get('HR'),
      sortOrder: 11,
      lessons: [
        {
          title: 'HR Lesson 1: Recruitment Process & Employee Onboarding',
          description: 'Overview of sourcing candidates, conducting interviews, and issuing offer letters.',
          contentType: 'VIDEO',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 20,
        },
        {
          title: 'HR Lesson 2: HRMS Portal Management',
          description: 'How to manage employee records, leave approvals, and payroll processing in HRMS.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 2,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What is the mandatory first step when onboarding a newly hired employee into the HRMS portal?',
          options: [
            'Issue payroll check before document verification',
            'Verify identity documents and create unique Employee ID profile in HRMS',
            'Assign manager permissions before profile creation',
            'Skip background checks for internal referrals',
          ],
          correctOptionIndex: 1,
          explanation: 'Document verification and profile registration in HRMS are mandatory steps.',
          points: 1.0,
        },
      ],
    },

    // Finance Department Module
    {
      title: 'Finance Department: Financial Policies & Expense Management',
      description: 'Corporate accounting standards, purchase order approvals, travel reimbursement, and budget controls.',
      moduleType: 'DEPARTMENT',
      departmentId: deptMap.get('FINANCE'),
      sortOrder: 12,
      lessons: [
        {
          title: 'Finance Lesson 1: Financial Policies & Audit Standards',
          description: 'Understanding GAAP standards, internal controls, and financial compliance auditing.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 1,
          minDurationSeconds: 20,
        },
        {
          title: 'Finance Lesson 2: Expense Management & Invoice Submission',
          description: 'Step-by-step guide for submitting corporate expense receipts and vendor invoices.',
          contentType: 'VIDEO_PDF',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 2,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'Within how many business days must business expense claims be submitted following business travel?',
          options: [
            '90 days after travel',
            'Within 15 business days with itemized receipts attached',
            'At the end of the calendar year',
            'No receipts are required for travel expenses under $5000',
          ],
          correctOptionIndex: 1,
          explanation: 'Expense claims must be submitted within 15 business days accompanied by itemized tax receipts.',
          points: 1.0,
        },
      ],
    },

    // Survey Department Module
    {
      title: 'Survey Department: Survey Workflow & GIS Tools',
      description: 'Field survey methodology, GPS mapping tools, GIS spatial data modeling, and site safety.',
      moduleType: 'DEPARTMENT',
      departmentId: deptMap.get('SURVEY'),
      sortOrder: 13,
      lessons: [
        {
          title: 'Survey Lesson 1: GIS Mapping & Field Operations',
          description: 'Calibrating GPS surveying equipment and executing field boundary measurements.',
          contentType: 'VIDEO',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoo.mp4',
          pdfUrl: null,
          sortOrder: 1,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What is the required accuracy check before starting high-precision field boundary surveying?',
          options: [
            'Visual estimation without instrument calibration',
            'Calibrate DGPS against known benchmark monument points',
            'Use standard smartphone compass only',
            'Skip calibration on sunny days',
          ],
          correctOptionIndex: 1,
          explanation: 'High-precision DGPS equipment must be benchmarked against known survey control monuments.',
          points: 1.0,
        },
      ],
    },

    // Property Tax Department Module
    {
      title: 'Property Tax Department: Property Tax Workflow & Municipal Apps',
      description: 'Property assessment rules, tax calculation algorithms, field audit procedures, and municipal web applications.',
      moduleType: 'DEPARTMENT',
      departmentId: deptMap.get('PROPERTY_TAX'),
      sortOrder: 14,
      lessons: [
        {
          title: 'Property Tax Lesson 1: Assessment Standards & Municipal Apps',
          description: 'Navigating municipal assessment software and calculating property tax classifications.',
          contentType: 'PDF',
          videoUrl: null,
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 1,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What factors determine the base property tax rate calculation in municipal applications?',
          options: [
            'Arbitrary annual estimation',
            'Property classification (Residential/Commercial), Built-up area, and Location Zone factor',
            'Number of occupants living in the premises',
            'Color of the building exterior',
          ],
          correctOptionIndex: 1,
          explanation: 'Property tax is computed using property classification, built-up area, and geographic zone multipliers.',
          points: 1.0,
        },
      ],
    },

    // MIS Department Module
    {
      title: 'MIS Department: Reporting Standards & Power BI Guidelines',
      description: 'Data reporting frameworks, dashboard publishing, SQL queries, Excel advanced modeling, and Power BI guidelines.',
      moduleType: 'DEPARTMENT',
      departmentId: deptMap.get('MIS'),
      sortOrder: 15,
      lessons: [
        {
          title: 'MIS Lesson 1: Dashboard Usage & Power BI Guidelines',
          description: 'Designing interactive executive dashboards and building automated data pipelines.',
          contentType: 'VIDEO_PDF',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarIsThat.mp4',
          pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
          sortOrder: 1,
          minDurationSeconds: 20,
        },
      ],
      questions: [
        {
          questionText: 'What is the corporate MIS standard frequency for refreshing executive KPI dashboards?',
          options: [
            'Once every quarter manually',
            'Automated daily scheduled refresh during off-peak hours',
            'Whenever requested by email',
            'No automated refresh is supported',
          ],
          correctOptionIndex: 1,
          explanation: 'MIS guidelines mandate automated daily scheduled data syncs during off-peak windows.',
          points: 1.0,
        },
      ],
    },
  ];

  const allModulesToSeed = [...commonModules, ...departmentModules];

  let qSortOrder = 1;

  for (const modData of allModulesToSeed) {
    let existingMod = await prisma.module.findFirst({
      where: { courseId: course.id, title: modData.title },
    });

    if (!existingMod) {
      existingMod = await prisma.module.create({
        data: {
          courseId: course.id,
          title: modData.title,
          description: modData.description,
          moduleType: modData.moduleType,
          departmentId: modData.departmentId || null,
          sortOrder: modData.sortOrder,
        },
      });
    } else {
      // Ensure moduleType and departmentId are updated
      await prisma.module.update({
        where: { id: existingMod.id },
        data: {
          moduleType: modData.moduleType,
          departmentId: modData.departmentId || null,
        },
      });
    }

    // Upsert lessons
    for (const lesData of modData.lessons) {
      const existingLes = await prisma.lesson.findFirst({
        where: { moduleId: existingMod.id, title: lesData.title },
      });

      if (!existingLes) {
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

    // Upsert module-linked assessment questions
    if (modData.questions) {
      for (const q of modData.questions) {
        const existingQ = await prisma.assessmentQuestion.findFirst({
          where: { courseId: course.id, questionText: q.questionText },
        });

        if (!existingQ) {
          await prisma.assessmentQuestion.create({
            data: {
              courseId: course.id,
              moduleId: existingMod.id,
              questionText: q.questionText,
              optionsJSON: JSON.stringify(q.options),
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation,
              points: q.points,
              sortOrder: qSortOrder++,
            },
          });
        } else {
          // Update moduleId link
          await prisma.assessmentQuestion.update({
            where: { id: existingQ.id },
            data: { moduleId: existingMod.id },
          });
        }
      }
    }
  }

  console.log('✅ Created Common & Department-Specific Modules, Lessons & Questions');
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
