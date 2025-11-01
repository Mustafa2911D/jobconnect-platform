import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'John Employer',
    email: 'employer@example.com',
    password: 'password123',
    role: 'employer',
    company: 'Tech Solutions SA',
    phone: '+27 11 123 4567',
    profile: {
      headline: 'HR Manager at Tech Solutions SA',
      bio: 'Connecting talented South Africans with amazing tech opportunities.',
      location: {
        province: 'Gauteng',
        city: 'Johannesburg',
        address: '123 Sandton City'
      },
      contact: {
        phone: '+27 11 123 4567',
        linkedin: 'linkedin.com/in/johnemployer',
        website: 'techsolutions-sa.co.za'
      },
      preferences: {
        jobAlerts: true,
        newsletter: true,
        privacy: 'public'
      }
    }
  },
  {
    name: 'Sarah Candidate',
    email: 'candidate@example.com',
    password: 'password123',
    role: 'candidate',
    phone: '+27 83 456 7890',
    profile: {
      headline: 'Senior Software Developer',
      bio: 'Passionate full-stack developer with 5+ years experience in JavaScript ecosystem.',
      location: {
        province: 'Western Cape',
        city: 'Cape Town',
        address: '45 Sea Point'
      },
      contact: {
        phone: '+27 83 456 7890',
        linkedin: 'linkedin.com/in/sarahdeveloper'
      },
      preferences: {
        jobAlerts: true,
        newsletter: false,
        privacy: 'public'
      }
    },
    saIdentity: {
      citizenship: 'South African',
      bbBee: 'Yes',
      disability: 'No'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
    experience: [
      {
        title: 'Senior Developer',
        company: 'Digital Innovations',
        location: 'Cape Town',
        startDate: new Date('2020-01-01'),
        current: true,
        description: 'Leading frontend development team and architecting scalable solutions.'
      }
    ],
    education: [
      {
        institution: 'University of Cape Town',
        qualification: 'BSc Computer Science',
        field: 'Computer Science',
        year: 2018,
        completed: true
      }
    ]
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    role: 'candidate',
    phone: '+27 82 111 2222',
    profile: {
      headline: 'Data Scientist & AI Engineer',
      bio: 'Machine learning specialist with focus on financial applications.',
      location: {
        province: 'Gauteng',
        city: 'Pretoria'
      }
    },
    saIdentity: {
      citizenship: 'Permanent Resident',
      bbBee: 'No',
      disability: 'Prefer not to say'
    },
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Analysis']
  },
  {
    name: 'Innovate Corp SA',
    email: 'innovate@example.com',
    password: 'password123',
    role: 'employer',
    company: 'Innovate Corporation South Africa',
    phone: '+27 21 987 6543',
    profile: {
      headline: 'Leading Innovation in South Africa',
      bio: 'We build the future with South African talent and global vision.',
      location: {
        province: 'Western Cape',
        city: 'Stellenbosch'
      }
    }
  }
];

const sampleJobs = [
  {
    title: 'Senior React Developer',
    company: 'Tech Solutions SA',
    location: {
      province: 'Gauteng',
      city: 'Johannesburg'
    },
    type: 'Full-time',
    category: 'IT & Tech',
    salary: {
      min: 600000,
      max: 900000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'We are looking for a skilled Senior React Developer to join our dynamic team in Sandton. You will be responsible for developing user interface components and implementing them following well-known React workflows. You will ensure that these components and the overall application are robust and easy to maintain.',
    requirements: [
      '5+ years of React experience',
      'Strong JavaScript (ES6+) knowledge',
      'Experience with Redux and state management',
      'Familiarity with RESTful APIs and GraphQL',
      'Knowledge of modern frontend build tools',
      'Experience with testing frameworks'
    ],
    skills: ['React', 'JavaScript', 'Redux', 'TypeScript', 'Jest'],
    benefits: [
      'Medical aid contribution',
      'Provident fund',
      'Flexible working hours',
      'Remote work options',
      'Professional development budget'
    ],
    saRequirements: {
      bbBee: true,
      saCitizen: false,
      driversLicense: false,
      clearCriminalRecord: true,
      languageRequirements: ['English']
    },
    application: {
      deadline: new Date('2024-12-31'),
      instructions: 'Please submit your CV and portfolio',
      questions: ['Why do you want to work at Tech Solutions SA?']
    },
    featured: true,
    urgent: false,
    status: 'active'
  },
  {
    title: 'Full Stack Developer (Remote)',
    company: 'Tech Solutions SA',
    location: {
      province: 'Remote',
      city: 'Remote'
    },
    type: 'Remote',
    category: 'IT & Tech',
    salary: {
      min: 500000,
      max: 800000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Join our remote team as a Full Stack Developer. You will work on both frontend and backend development, creating scalable web applications using modern technologies. This is a fully remote position open to candidates across South Africa.',
    requirements: [
      '3+ years of Node.js experience',
      'React or Vue.js knowledge',
      'Database design skills (MongoDB/PostgreSQL)',
      'API development experience',
      'DevOps knowledge is a plus'
    ],
    skills: ['Node.js', 'React', 'MongoDB', 'AWS', 'Docker'],
    benefits: [
      'Fully remote work',
      'Flexible schedule',
      'Equipment allowance',
      'Annual team retreat'
    ],
    saRequirements: {
      bbBee: false,
      saCitizen: true,
      driversLicense: false,
      clearCriminalRecord: false,
      languageRequirements: ['English']
    },
    featured: true,
    urgent: true,
    status: 'active'
  },
  {
    title: 'Data Scientist',
    company: 'Innovate Corporation South Africa',
    location: {
      province: 'Western Cape',
      city: 'Stellenbosch'
    },
    type: 'Full-time',
    category: 'IT & Tech',
    salary: {
      min: 700000,
      max: 1000000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Join our data science team to extract insights from complex datasets and build machine learning models that drive business decisions. Work on cutting-edge AI projects in the heart of the Cape Winelands.',
    requirements: [
      'Masters or PhD in Data Science, Statistics, or related field',
      'Python and R programming expertise',
      'Machine learning frameworks (TensorFlow, PyTorch)',
      'SQL and database knowledge',
      'Statistical analysis and data visualization skills'
    ],
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Visualization'],
    saRequirements: {
      bbBee: true,
      saCitizen: true,
      driversLicense: true,
      clearCriminalRecord: true,
      languageRequirements: ['English', 'Afrikaans']
    },
    featured: false,
    urgent: true,
    status: 'active'
  },
  {
    title: 'Financial Analyst',
    company: 'Innovate Corporation South Africa',
    location: {
      province: 'Gauteng',
      city: 'Johannesburg'
    },
    type: 'Full-time',
    category: 'Finance',
    salary: {
      min: 450000,
      max: 650000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'We are seeking a Financial Analyst to provide financial planning and analysis support for our growing operations. The ideal candidate will have strong analytical skills and experience in financial modeling.',
    requirements: [
      'BCom Finance or related degree',
      '3+ years financial analysis experience',
      'Advanced Excel skills',
      'Financial modeling experience',
      'Knowledge of SA financial regulations'
    ],
    skills: ['Financial Analysis', 'Excel', 'Financial Modeling', 'SA Taxation'],
    saRequirements: {
      bbBee: true,
      saCitizen: true,
      driversLicense: true,
      clearCriminalRecord: true,
      languageRequirements: ['English']
    },
    featured: false,
    urgent: false,
    status: 'active'
  },
  {
    title: 'Frontend Developer',
    company: 'Digital Creations SA',
    location: {
      province: 'Western Cape',
      city: 'Cape Town'
    },
    type: 'Full-time',
    category: 'IT & Tech',
    salary: {
      min: 400000,
      max: 650000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Join our creative team as a Frontend Developer. You will work on building beautiful, responsive web applications using modern JavaScript frameworks.',
    requirements: [
      '2+ years of React or Vue.js experience',
      'Strong CSS and HTML skills',
      'Experience with responsive design',
      'Knowledge of modern build tools'
    ],
    skills: ['React', 'Vue.js', 'CSS', 'JavaScript', 'Responsive Design'],
    saRequirements: {
      bbBee: false,
      saCitizen: false,
      driversLicense: false,
      clearCriminalRecord: false,
      languageRequirements: ['English']
    },
    featured: true,
    urgent: false,
    status: 'active'
  },
  {
    title: 'Backend Developer',
    company: 'ServerStack Solutions',
    location: {
      province: 'Gauteng',
      city: 'Johannesburg'
    },
    type: 'Full-time',
    category: 'IT & Tech',
    salary: {
      min: 550000,
      max: 850000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'We are looking for a Backend Developer to build scalable server-side applications. Experience with microservices architecture and cloud platforms is a plus.',
    requirements: [
      '3+ years of Node.js or Python experience',
      'Database design and optimization',
      'API development and documentation',
      'Experience with cloud platforms (AWS, Azure, GCP)'
    ],
    skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'AWS'],
    saRequirements: {
      bbBee: true,
      saCitizen: true,
      driversLicense: false,
      clearCriminalRecord: true,
      languageRequirements: ['English']
    },
    featured: false,
    urgent: true,
    status: 'active'
  },
  {
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    location: {
      province: 'Western Cape',
      city: 'Stellenbosch'
    },
    type: 'Full-time',
    category: 'Design',
    salary: {
      min: 350000,
      max: 550000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Create amazing user experiences for our clients digital products. You will work closely with developers and product managers to design intuitive interfaces.',
    requirements: [
      '3+ years of UI/UX design experience',
      'Proficiency in Figma or Sketch',
      'User research and testing experience',
      'Portfolio demonstrating design process'
    ],
    skills: ['Figma', 'UI/UX Design', 'User Research', 'Prototyping', 'Wireframing'],
    saRequirements: {
      bbBee: false,
      saCitizen: false,
      driversLicense: false,
      clearCriminalRecord: false,
      languageRequirements: ['English']
    },
    featured: false,
    urgent: false,
    status: 'active'
  },
  {
    title: 'DevOps Engineer',
    company: 'Cloud Systems SA',
    location: {
      province: 'Gauteng',
      city: 'Pretoria'
    },
    type: 'Full-time',
    category: 'IT & Tech',
    salary: {
      min: 650000,
      max: 950000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Join our infrastructure team to build and maintain scalable cloud systems. You will work with cutting-edge technologies to ensure our systems are reliable and efficient.',
    requirements: [
      '4+ years of DevOps experience',
      'Strong knowledge of AWS or Azure',
      'Experience with Docker and Kubernetes',
      'CI/CD pipeline setup and maintenance',
      'Infrastructure as Code (Terraform, CloudFormation)'
    ],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
    saRequirements: {
      bbBee: true,
      saCitizen: true,
      driversLicense: false,
      clearCriminalRecord: true,
      languageRequirements: ['English']
    },
    featured: true,
    urgent: false,
    status: 'active'
  },
  {
    title: 'Marketing Manager',
    company: 'Growth Hackers SA',
    location: {
      province: 'Western Cape',
      city: 'Cape Town'
    },
    type: 'Full-time',
    category: 'Sales & Marketing',
    salary: {
      min: 480000,
      max: 720000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Lead our marketing team to develop and execute innovative marketing strategies that drive business growth across South Africa.',
    requirements: [
      '5+ years of marketing experience',
      'Digital marketing expertise',
      'Team leadership experience',
      'Analytical and data-driven approach',
      'Knowledge of SA market trends'
    ],
    skills: ['Digital Marketing', 'Team Leadership', 'SEO', 'Social Media', 'Analytics'],
    saRequirements: {
      bbBee: true,
      saCitizen: true,
      driversLicense: true,
      clearCriminalRecord: true,
      languageRequirements: ['English']
    },
    featured: false,
    urgent: true,
    status: 'active'
  },
  {
    title: 'Civil Engineer',
    company: 'BuildRight Construction',
    location: {
      province: 'Gauteng',
      city: 'Pretoria'
    },
    type: 'Full-time',
    category: 'Engineering',
    salary: {
      min: 520000,
      max: 780000,
      currency: 'ZAR',
      period: 'annually'
    },
    description: 'Join our engineering team to work on major infrastructure projects across Gauteng. You will be involved in planning, design, and supervision of construction projects.',
    requirements: [
      'BEng Civil Engineering degree',
      'Professional registration with ECSA',
      '5+ years of construction experience',
      'Project management skills',
      'Knowledge of South African building codes'
    ],
    skills: ['Civil Engineering', 'Project Management', 'AutoCAD', 'Structural Design', 'ECSA'],
    saRequirements: {
      bbBee: true,
      saCitizen: true,
      driversLicense: true,
      clearCriminalRecord: true,
      languageRequirements: ['English', 'Afrikaans']
    },
    featured: false,
    urgent: false,
    status: 'active'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(sampleUsers);
    console.log('Created users');

    // Get employer and candidate users
    const employer1 = createdUsers.find(user => user.email === 'employer@example.com');
    const employer2 = createdUsers.find(user => user.email === 'innovate@example.com');
    const candidate1 = createdUsers.find(user => user.email === 'candidate@example.com');
    const candidate2 = createdUsers.find(user => user.email === 'mike@example.com');

    // Add employer references to jobs
    const jobsWithEmployers = sampleJobs.map(job => {
      if (job.company.includes('Tech Solutions') || job.company.includes('Digital Creations') || job.company.includes('ServerStack') || job.company.includes('Cloud Systems')) {
        return { ...job, employer: employer1._id };
      } else {
        return { ...job, employer: employer2._id };
      }
    });

    // Create jobs
    const createdJobs = await Job.insertMany(jobsWithEmployers);
    console.log(`Created ${createdJobs.length} jobs`);

    // Create some sample applications
    const sampleApplications = [
      {
        candidate: candidate1._id,
        job: createdJobs[0]._id,
        resume: 'resumes/sarah-cv.pdf',
        coverLetter: 'I am very interested in this Senior React Developer position and believe my 5+ years of React experience makes me a perfect fit for your team.',
        status: 'reviewed'
      },
      {
        candidate: candidate1._id,
        job: createdJobs[1]._id,
        resume: 'resumes/sarah-cv.pdf',
        coverLetter: 'I have extensive experience with both React and Node.js and would love to contribute to your remote development team.',
        status: 'pending'
      },
      {
        candidate: candidate2._id,
        job: createdJobs[2]._id,
        resume: 'resumes/mike-cv.pdf',
        coverLetter: 'My background in machine learning and data science makes me a perfect fit for this Data Scientist role.',
        status: 'accepted'
      },
      {
        candidate: candidate1._id,
        job: createdJobs[4]._id,
        resume: 'resumes/sarah-cv.pdf',
        coverLetter: 'I am excited about the Frontend Developer position and believe my skills align perfectly with your requirements.',
        status: 'pending'
      }
    ];

    await Application.insertMany(sampleApplications);
    console.log('Created applications');

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Employer: employer@example.com / password123');
    console.log('Candidate: candidate@example.com / password123');
    console.log('Candidate: mike@example.com / password123');
    console.log('Employer: innovate@example.com / password123');
    console.log(`\nTotal jobs created: ${createdJobs.length}`);
    console.log('Total applications created: 4');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();