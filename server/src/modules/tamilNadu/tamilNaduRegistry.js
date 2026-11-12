/**
 * Master Registry of Software & IT Companies in Tamil Nadu.
 * Reflects industry market reports and official IT directory data:
 * - Total Registered IT/Software Companies: 7,525
 * - Single-owner / Small operations: 6,870 (91.3%)
 * - Enterprise & Large Brands: 655 (8.7%)
 * - Statewide Coverage: Chennai (~1,770), Coimbatore (~829), Madurai (~446),
 *   Trichy, Salem, Tirunelveli, Erode, Hosur, Vellore, Thanjavur, and across all 38 districts.
 */

export const TAMIL_NADU_STATS = {
  totalRegisteredCompanies: 7525,
  smallAndSingleOwnerOperations: 6870,
  enterpriseAndLargeBrands: 655,
  topHubs: [
    { city: 'Chennai', district: 'Chennai', companyCount: 1770, description: 'Primary tech engine & 2nd largest IT/ITeS exporter in India (OMR, Siruseri SIPCOT, Tidel Park, Guindy)' },
    { city: 'Coimbatore', district: 'Coimbatore', companyCount: 829, description: 'Hardware-software corridor, SaaS & product engineering hub (Saravanampatti, Peelamedu, Tidel Park)' },
    { city: 'Madurai', district: 'Madurai', companyCount: 446, description: 'Emerging tech SEZ hub (Vadapalanji IT Park & Ilandhaikulam ELCOT SEZ)' },
    { city: 'Trichy', district: 'Tiruchirappalli', companyCount: 320, description: 'Navalpattu ELCOT IT Park and growing software solutions corridor' },
    { city: 'Salem', district: 'Salem', companyCount: 210, description: 'Steel Plant Road ELCOT IT Park, enterprise software and web solutions' },
    { city: 'Tirunelveli', district: 'Tirunelveli', companyCount: 180, description: 'Gangaikondan ELCOT IT SEZ (major rural IT development corridor)' },
    { city: 'Hosur', district: 'Krishnagiri', companyCount: 140, description: 'Automotive electronics, tech engineering & border IT corridor' },
    { city: 'Erode', district: 'Erode', companyCount: 160, description: 'Industrial software, IIoT, and enterprise web solutions' },
    { city: 'Vellore', district: 'Vellore', companyCount: 130, description: 'Software consulting, healthtech IT, and academic tech corridor' },
    { city: 'Thanjavur', district: 'Thanjavur', companyCount: 110, description: 'Delta tech solutions and agriculture tech software' }
  ]
};

export const TAMIL_NADU_COMPANIES = [
  // Category 1: Homegrown Tamil Nadu SaaS & Technology Giants
  {
    id: 'tn-zoho',
    name: 'Zoho Corporation',
    category: 'Homegrown SaaS Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Tenkasi', 'Coimbatore', 'Tirunelveli', 'Madurai'],
    specialization: 'Cloud Office Suite, CRM, Enterprise SaaS Applications',
    careersUrl: 'https://careers.zohocorp.com/jobs/Careers',
    atsType: 'ZohoRecruit',
    activelyMonitored: true,
    fresherRecruitment: 'Continuous national & Tamil Nadu off-campus recruitment (0 yrs exp welcome)'
  },
  {
    id: 'tn-freshworks',
    name: 'Freshworks',
    category: 'Homegrown SaaS Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'CRM, Customer Experience & IT Service Management (ITSM)',
    careersUrl: 'https://jobs.smartrecruiters.com/freshworks',
    atsType: 'SmartRecruiters',
    atsCompanyId: 'freshworks',
    activelyMonitored: true,
    fresherRecruitment: 'Direct early career & entry level positions via SmartRecruiters'
  },
  {
    id: 'tn-chargebee',
    name: 'Chargebee',
    category: 'Homegrown SaaS Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Subscription Billing, Payment Invoicing & SaaS FinTech',
    careersUrl: 'https://www.chargebee.com/careers/',
    atsType: 'SmartRecruiters',
    atsCompanyId: 'chargebee',
    activelyMonitored: true,
    fresherRecruitment: 'Associate software engineering & operations squads'
  },
  {
    id: 'tn-kissflow',
    name: 'Kissflow',
    category: 'Homegrown SaaS Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Digital Workplace, Low-Code / No-Code Workflow Platform',
    careersUrl: 'https://kissflow.com/careers/',
    atsType: 'SmartRecruiters',
    atsCompanyId: 'kissflow',
    activelyMonitored: true,
    fresherRecruitment: 'Fresher engineering & product analyst positions'
  },
  {
    id: 'tn-ramco',
    name: 'Ramco Systems',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Enterprise Cloud ERP, Global Payroll, Aviation Maintenance Tech',
    careersUrl: 'https://www.ramco.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Graduate Engineer Trainee (GET) programs'
  },
  {
    id: 'tn-intellect',
    name: 'Intellect Design Arena',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Fintech, Core Banking Platforms & Enterprise Insurance Tech',
    careersUrl: 'https://www.intellectdesign.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'FinTech associate developer & analyst roles'
  },
  {
    id: 'tn-prodapt',
    name: 'Prodapt',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Connected Telecom, 5G Infrastructure & Cloud Networking',
    careersUrl: 'https://www.prodapt.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Telecom IT graduate trainee intake'
  },
  {
    id: 'tn-kovaico',
    name: 'Kovai.co',
    category: 'Homegrown SaaS Giant',
    city: 'Coimbatore',
    district: 'Coimbatore',
    secondaryCities: [],
    specialization: 'Enterprise Cloud Management, Document360, Azure Serverless Tools',
    careersUrl: 'https://www.kovai.co/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Coimbatore tech campus software engineer hiring'
  },
  {
    id: 'tn-kaar',
    name: 'Kaar Technologies',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Enterprise SAP Consulting, Digital ERP Transformation',
    careersUrl: 'https://kaartech.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Associate SAP Consultant & Developer recruitment'
  },
  {
    id: 'tn-aspiresys',
    name: 'Aspire Systems',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Kanchipuram (Siruseri)'],
    specialization: 'Software Product Engineering, Digital Services & Cloud',
    careersUrl: 'https://www.aspiresys.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Trainee Software Engineer annual batches'
  },
  {
    id: 'tn-indium',
    name: 'Indium Software',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Digital Engineering, Applied AI, Data Analytics & Quality Engineering',
    careersUrl: 'https://www.indiumsoftware.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Junior QA & Full-Stack developer hiring'
  },
  {
    id: 'tn-ideas2it',
    name: 'Ideas2IT',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'High-end Product Engineering, AI/ML, Cloud Infrastructure',
    careersUrl: 'https://www.ideas2it.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Product engineering entry roles with high compensation'
  },
  {
    id: 'tn-maveric',
    name: 'Maveric Systems',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Banking Tech Transformation, Digital Assurance & Core Banking',
    careersUrl: 'https://maveric-systems.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Associate Banking Systems Engineer intake'
  },
  {
    id: 'tn-soliton',
    name: 'Soliton Technologies',
    category: 'Large Indian IT',
    city: 'Coimbatore',
    district: 'Coimbatore',
    secondaryCities: ['Chennai'],
    specialization: 'Semiconductor Automation Software, Test Automation, LabVIEW & Python',
    careersUrl: 'https://www.solitontech.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Project Trainee and Junior Software Engineer recruitment'
  },
  {
    id: 'tn-gofrugal',
    name: 'Gofrugal Technologies',
    category: 'Homegrown SaaS Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Madurai'],
    specialization: 'Omnichannel Retail ERP, POS, Supply Chain SaaS',
    careersUrl: 'https://www.gofrugal.com/careers',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Direct fresher developer & technical support hiring'
  },
  {
    id: 'tn-contus',
    name: 'Contus Tech',
    category: 'Homegrown SaaS Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Enterprise Video Solutions (VPlayed), Messaging API & SaaS',
    careersUrl: 'https://www.contus.com/careers.php',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Early career mobile and cloud engineers'
  },
  {
    id: 'tn-sify',
    name: 'Sify Technologies',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Cloud Infrastructure, Data Center Services, Telecom & Enterprise Networks',
    careersUrl: 'https://www.sifytechnologies.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Network Operations Trainee (NOC) and Cloud Trainees'
  },
  {
    id: 'tn-kgisl',
    name: 'KGiSL Technologies',
    category: 'Large Indian IT',
    city: 'Coimbatore',
    district: 'Coimbatore',
    secondaryCities: [],
    specialization: 'Insurance IT, Banking Automation & Enterprise Software',
    careersUrl: 'https://www.kgisl.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Graduate recruitment from Coimbatore and Western TN'
  },

  // Category 2: Major MNC Tech Centers Operating in Tamil Nadu
  {
    id: 'tn-cognizant',
    name: 'Cognizant',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Coimbatore'],
    specialization: 'Global IT Services, Cloud, AI & Digital Transformation (Chennai Global HQ)',
    careersUrl: 'https://careers.cognizant.com/global/en',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Massive GenC & GenC Next annual campus/off-campus hiring'
  },
  {
    id: 'tn-paypal',
    name: 'PayPal India Technology Center',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Fintech Payments, Risk Engineering, Cloud Microservices',
    careersUrl: 'https://careers.pypl.com/',
    atsType: 'Workday',
    activelyMonitored: true,
    fresherRecruitment: 'University Graduate Software Engineer & Intern programs'
  },
  {
    id: 'tn-ford',
    name: 'Ford Technology Services India',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Automotive Software, Connected Vehicle Platforms & Enterprise IT',
    careersUrl: 'https://corporate.ford.com/careers.html',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Graduate Engineer Trainee (GET) programs'
  },
  {
    id: 'tn-rntbci',
    name: 'Renault Nissan Technology & Business Centre (RNTBCI)',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chengalpattu',
    secondaryCities: ['Chennai'],
    specialization: 'Automotive Software, Embedded Systems, Autonomous & Connected Tech',
    careersUrl: 'https://rntbci.in/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Software & embedded engineer trainee intake'
  },
  {
    id: 'tn-walmart',
    name: 'Walmart Global Tech',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Retail Tech Cloud, Distributed Systems, Logistics & Supply Chain AI',
    careersUrl: 'https://careers.walmart.com/technology',
    atsType: 'Workday',
    activelyMonitored: true,
    fresherRecruitment: 'Campus & early-career Software Engineer I'
  },
  {
    id: 'tn-tcs',
    name: 'Tata Consultancy Services (TCS)',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Coimbatore'],
    specialization: 'Global IT Services, Cloud, Digital Engineering & Cyber Defense',
    careersUrl: 'https://www.tcs.com/careers',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'TCS NQT (Ninja & Digital fresher hiring)'
  },
  {
    id: 'tn-infosys',
    name: 'Infosys',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Coimbatore'],
    specialization: 'Digital Services, Cloud & AI Consulting (Sholinganallur & Mahindra World City)',
    careersUrl: 'https://www.infosys.com/careers.html',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'System Engineer & Specialist Programmer hiring'
  },
  {
    id: 'tn-wipro',
    name: 'Wipro',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Coimbatore'],
    specialization: 'Cognitive Computing, Cloud Architecture & Enterprise IT',
    careersUrl: 'https://careers.wipro.com/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Wipro Elite National Talent Hunt'
  },
  {
    id: 'tn-hcl',
    name: 'HCLTech',
    category: 'MNC Tech Giant',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Madurai'],
    specialization: 'Engineering R&D, Hybrid Cloud, Digital Operations & Cybersecurity',
    careersUrl: 'https://www.hcltech.com/careers',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'First Careers & TechBee entry-level recruitment'
  },

  // Category 3: Mid-Sized & Digital Engineering Companies
  {
    id: 'tn-doodleblue',
    name: 'Doodleblue Innovations',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Mobile Engineering, UI/UX, Cloud & Digital Transformation',
    careersUrl: 'https://www.doodleblue.com/careers',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Junior full stack developers & UI engineers'
  },
  {
    id: 'tn-sedin',
    name: 'Sedin Technologies',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Full Stack Web, Ruby on Rails, Cloud & Data Engineering',
    careersUrl: 'https://sedintechnologies.com/careers',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Entry level software developers'
  },
  {
    id: 'tn-kanini',
    name: 'KANINI Software Solutions',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Coimbatore'],
    specialization: 'Cloud Transformation, Data & AI, App Modernization',
    careersUrl: 'https://kanini.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Trainee Software Engineer intake'
  },
  {
    id: 'tn-calibraint',
    name: 'Calibraint Technologies',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Blockchain, Web3, Mobile App & Full-Stack Cloud Solutions',
    careersUrl: 'https://www.calibraint.com/careers',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Junior web and blockchain developers'
  },
  {
    id: 'tn-zuci',
    name: 'Zuci Systems',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Digital Engineering, Applied AI, Automation & Testing',
    careersUrl: 'https://www.zucisystems.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Junior software and quality engineers'
  },
  {
    id: 'tn-payoda',
    name: 'Payoda Technologies',
    category: 'Mid-Sized Product & Digital',
    city: 'Coimbatore',
    district: 'Coimbatore',
    secondaryCities: ['Chennai'],
    specialization: 'Healthcare IT, Cloud Infrastructure & Digital Engineering',
    careersUrl: 'https://payoda.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Western Tamil Nadu early career engineer intake'
  },
  {
    id: 'tn-movate',
    name: 'Movate (formerly CSS Corp)',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: [],
    specialization: 'Digital Customer Experience, Cloud Operations & Tech Support',
    careersUrl: 'https://www.movate.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Technical support and cloud associate hiring'
  },
  {
    id: 'tn-vuram',
    name: 'Vuram (now part of WNS)',
    category: 'Mid-Sized Product & Digital',
    city: 'Chennai',
    district: 'Chennai',
    secondaryCities: ['Trichy', 'Tirunelveli'],
    specialization: 'Hyperautomation, Low-Code Solutions (Appian), Enterprise Workflow',
    careersUrl: 'https://www.vuram.com/careers/',
    atsType: 'DirectPortal',
    activelyMonitored: true,
    fresherRecruitment: 'Tier-2 and rural Tamil Nadu low-code consultant hiring'
  },

  // Category 4: Startups & Regional Innovation Hubs
  {
    id: 'tn-aganam',
    name: 'Aganam Integrated Solutions',
    category: 'Emerging Startup',
    city: 'Chennai',
    district: 'Chennai',
    specialization: 'Cybersecurity and Applied AI Solutions',
    activelyMonitored: true
  },
  {
    id: 'tn-aracreate',
    name: 'araCreate',
    category: 'Emerging Startup',
    city: 'Erode',
    district: 'Erode',
    specialization: 'Industrial IoT and Custom Software Solutions',
    activelyMonitored: true
  },
  {
    id: 'tn-avitla',
    name: 'Avitla Tech',
    category: 'Emerging Startup',
    city: 'Coimbatore',
    district: 'Coimbatore',
    specialization: 'AI Automation & Customer Experience Platforms',
    activelyMonitored: true
  },
  {
    id: 'tn-builtrix',
    name: 'Builtrix Labs',
    category: 'Emerging Startup',
    city: 'Chennai',
    district: 'Chennai',
    specialization: 'AI Automated Code & Enterprise Workflow',
    activelyMonitored: true
  },
  {
    id: 'tn-ceiyone',
    name: 'Ceiyone Tech Works',
    category: 'Emerging Startup',
    city: 'Karur',
    district: 'Karur',
    specialization: 'Textile IT & Enterprise Digital Transformation',
    activelyMonitored: true
  },
  {
    id: 'tn-dataspire',
    name: 'Dataspire Technologies',
    category: 'Emerging Startup',
    city: 'Coimbatore',
    district: 'Coimbatore',
    specialization: 'Big Data Processing and Business Analytics',
    activelyMonitored: true
  },
  {
    id: 'tn-elshaddai',
    name: 'El Shaddai Global Solutions',
    category: 'Emerging Startup',
    city: 'Trichy',
    district: 'Tiruchirappalli',
    specialization: 'Enterprise Software & Digital Web Applications',
    activelyMonitored: true
  },
  {
    id: 'tn-fabrainz',
    name: 'Fabrainz India',
    category: 'Emerging Startup',
    city: 'Coimbatore',
    district: 'Coimbatore',
    specialization: 'AI-Powered SaaS Applications',
    activelyMonitored: true
  },
  {
    id: 'tn-geeplex',
    name: 'Geeplex Tech Solutions',
    category: 'Emerging Startup',
    city: 'Dindigul',
    district: 'Dindigul',
    specialization: 'Industrial IIoT & Endpoint Security',
    activelyMonitored: true
  },
  {
    id: 'tn-lansub',
    name: 'Lansub Technologies',
    category: 'Emerging Startup',
    city: 'Tiruvannamalai',
    district: 'Tiruvannamalai',
    specialization: 'Industrial Automation & Deep AI',
    activelyMonitored: true
  },
  {
    id: 'tn-nammaoffice',
    name: 'Namma Office',
    category: 'Emerging Startup',
    city: 'Salem',
    district: 'Salem',
    specialization: 'Regional Business Automation & Cloud Software',
    activelyMonitored: true
  },
  {
    id: 'tn-qube',
    name: 'Qube Cinema Technologies',
    category: 'Large Indian IT',
    city: 'Chennai',
    district: 'Chennai',
    specialization: 'Digital Cinema Software, Media Streaming & Compression Servers',
    activelyMonitored: true
  },

  // Category 5: District IT & Software Solution Providers
  {
    id: 'tn-techform',
    name: 'Techform IT Solutions',
    category: 'Regional IT Firm',
    city: 'Salem',
    district: 'Salem',
    specialization: 'Enterprise Web & Custom Management Software',
    activelyMonitored: true
  },
  {
    id: 'tn-stsoftware',
    name: 'ST Software Solution',
    category: 'Regional IT Firm',
    city: 'Tiruppur',
    district: 'Tiruppur',
    specialization: 'Garment ERP & Supply Chain Tracking Systems',
    activelyMonitored: true
  },
  {
    id: 'tn-uisort',
    name: 'UiSort Technologies',
    category: 'Regional IT Firm',
    city: 'Trichy',
    district: 'Tiruchirappalli',
    specialization: 'Web Applications, Mobile Apps & Cloud ERP',
    activelyMonitored: true
  },
  {
    id: 'tn-we4you',
    name: 'We4You Tech Solutions',
    category: 'Regional IT Firm',
    city: 'Trichy',
    district: 'Tiruchirappalli',
    specialization: 'Full Stack Development & Cloud Deployments',
    activelyMonitored: true
  },
  {
    id: 'tn-redpulse',
    name: 'Redpulse Software',
    category: 'Regional IT Firm',
    city: 'Karur',
    district: 'Karur',
    specialization: 'Custom Business Software & Cloud Portals',
    activelyMonitored: true
  },
  {
    id: 'tn-woodpecker',
    name: 'Woodpecker IT Solutions',
    category: 'Regional IT Firm',
    city: 'Kumbakonam',
    district: 'Thanjavur',
    specialization: 'Web Development & Academic Software Platforms',
    activelyMonitored: true
  },
  {
    id: 'tn-tutytech',
    name: 'Tutytech Software Solutions',
    category: 'Regional IT Firm',
    city: 'Thoothukudi',
    district: 'Thoothukudi',
    specialization: 'Logistics IT, Port Shipping Software & Web Apps',
    activelyMonitored: true
  },
  {
    id: 'tn-nija',
    name: 'NIJA Technologies',
    category: 'Regional IT Firm',
    city: 'Kovilpatti',
    district: 'Thoothukudi',
    specialization: 'Custom Web Apps, ERP Systems & Mobile Development',
    activelyMonitored: true
  },
  {
    id: 'tn-innocraft',
    name: 'Innocraft Technologies',
    category: 'Regional IT Firm',
    city: 'Vellore',
    district: 'Vellore',
    specialization: 'Educational Tech, Cloud Portals & Mobile Apps',
    activelyMonitored: true
  }
];

export const getTamilNaduDirectory = (filters = {}) => {
  let list = [...TAMIL_NADU_COMPANIES];

  if (filters.city) {
    const q = filters.city.toLowerCase();
    list = list.filter(c =>
      c.city.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      (c.secondaryCities || []).some(sc => sc.toLowerCase().includes(q))
    );
  }

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    list = list.filter(c => c.category.toLowerCase().includes(cat));
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.specialization.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s) ||
      c.district.toLowerCase().includes(s)
    );
  }

  return list;
};
