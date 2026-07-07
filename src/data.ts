/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Division, RobotMachine, TimelineEvent, GalleryItem } from './types';

export const COMPETITION_DIVISIONS: Division[] = [
  {
    id: 'sumobot-500g',
    title: 'Sumobot 500g',
    description: 'A lightweight sumo robot competition featuring two categories: Remote Control (RC) and Autonomous. Participants are challenged to design strong, resilient, and strategic robots to dominate the arena and push opponents out of the ring. The RC category tests operator control skills and strategy, while the Autonomous category tests the robots ability to detect its environment, make decisions, and compete independently.',
    indonesianDescription: 'Kompetisi robot sumo ringan yang menghadirkan dua kategori, yaitu Remote Control (RC) dan Autonomous. Peserta ditantang untuk merancang robot yang kuat, tangguh, dan strategis guna menguasai arena serta mendorong lawan keluar dari ring. Kategori RC menguji keterampilan pengendalian dan strategi operator, sedangkan kategori Autonomous menguji kemampuan robot dalam mendeteksi lingkungan, mengambil keputusan, dan bertanding secara mandiri.',
    icon: 'Shield',
    image: '/images/divisions/sumobot-500g.jpg',
    specHighlight: 'Strength & Strategy',
    intensityScore: 89,
    glowColor: 'rgba(0, 255, 136, 0.4)',
    maxStaff: 1,
    hasSubCategory: true,
    subCategories: ['RC', 'Autonomous'],
    hasLevels: false,
    hasLecturer: false,
    price: 'Rp. 225,000',
    priceUSD: '$14.00',
    whatsappGroup: 'https://chat.whatsapp.com/HSFpgkTQjbJKNbmyzXeefT',
    contactPersons: [
      { name: 'Ade', waNumber: '6283143705558', label: 'National' },
      { name: 'Nabil', waNumber: '6282258640813', label: 'International' }
    ]
  },
  {
    id: 'sumobot-3kg',
    title: 'Sumobot 3kg',
    description: 'A heavyweight sumo robot competition that challenges participants to design strong, sturdy robots with high traction and precise control. Teams compete using Remote Control (RC), relying on driving skills, strategy, and mechanical performance to push opponents out of the arena.',
    indonesianDescription: 'Kompetisi robot sumo kelas berat yang menantang peserta untuk merancang robot yang kuat, kokoh, dan memiliki traksi tinggi dengan kendali yang presisi. Tim bertanding menggunakan Remote Control (RC), mengandalkan keterampilan mengemudi, strategi, dan performa mekanik untuk mendorong lawan keluar dari arena.',
    icon: 'Terminal',
    image: '/images/divisions/sumobot-3kg.jpg',
    specHighlight: 'Strength & Strategy',
    intensityScore: 96,
    glowColor: 'rgba(197, 160, 89, 0.4)',
    maxStaff: 1,
    hasSubCategory: true,
    subCategories: ['RC'],
    hasLevels: false,
    hasLecturer: false,
    price: 'Rp. 250,000',
    priceUSD: '$20.00',
    whatsappGroup: 'https://chat.whatsapp.com/GX3rv5PKbbp3fKB66FlwnJ',
    contactPersons: [
      { name: 'Ryan', waNumber: '6285711011898', label: 'National' },
      { name: 'Theo', waNumber: '6282111490515', label: 'International' }
    ]
  },
  {
    id: 'mini-soccer',
    title: 'Mini Soccer',
    description: 'A dynamic soccer robot competition where teams control robots using Remote Control (RC) to demonstrate teamwork, agility, and game strategy. Success is determined by ball control ability, fast movement, team coordination, and effective attacking and defensive strategies.',
    indonesianDescription: 'Kompetisi robot sepak bola yang dinamis, di mana tim mengendalikan robot menggunakan Remote Control (RC) untuk menunjukkan kerja sama, kelincahan, dan strategi permainan. Keberhasilan ditentukan oleh kemampuan mengendalikan bola, pergerakan yang cepat, koordinasi tim, serta strategi menyerang dan bertahan yang efektif.',
    icon: 'Activity',
    image: '/images/divisions/mini-soccer.jpg',
    specHighlight: 'Teamwork & Strategy',
    intensityScore: 91,
    glowColor: 'rgba(0, 71, 171, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: false,
    hasLecturer: false,
    price: 'Rp. 250,000',
    priceUSD: '$20.00',
    whatsappGroup: 'https://chat.whatsapp.com/K1oLVvfu38NHNV41KjqaZA',
    contactPersons: [
      { name: 'Dimas', waNumber: '6285715139655', label: 'National' },
      { name: 'Noufal', waNumber: '6281317811877', label: 'International' }
    ]
  },
  {
    id: 'line-follower',
    title: 'Line Follower',
    description: 'The Line Follower division challenges participants to design autonomous robots capable of following tracks with high speed and accuracy. Participants are required to optimize sensor performance, control algorithms, and robot stability to complete the track in the fastest time with precise navigation.',
    indonesianDescription: 'Divisi Line Follower menantang peserta untuk merancang robot otonom yang mampu mengikuti lintasan dengan kecepatan dan akurasi tinggi. Peserta dituntut mengoptimalkan kinerja sensor, algoritma kendali, dan stabilitas robot agar dapat menyelesaikan lintasan dalam waktu tercepat dengan navigasi yang presisi.',
    icon: 'Navigation',
    image: '/images/divisions/line-follower.jpg',
    specHighlight: 'Speed & Precision',
    intensityScore: 87,
    glowColor: 'rgba(77, 255, 184, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['University Student', 'High School Student'],
    hasLecturer: false,
    price: 'Rp. 250,000',
    priceUSD: '$20.00',
    whatsappGroup: 'https://chat.whatsapp.com/HNXtjsKC5g50PZzuPt7NOq',
    contactPersons: [
      { name: 'Rizqba', waNumber: '6289637788569', label: 'National' },
      { name: 'Raihan R', waNumber: '62895332277723', label: 'International' }
    ]
  },
  {
    id: 'plc-industrial',
    title: 'PLC Industrials',
    description: 'The PLC Industrials division challenges participants to design, program, and implement industrial automation systems using Programmable Logic Controllers (PLC). Participants demonstrate their ability to develop reliable control systems, integrate various industrial components, and solve automation challenges through efficient and innovative engineering solutions.',
    indonesianDescription: 'Divisi PLC Industrials menantang peserta untuk merancang, memprogram, dan mengimplementasikan sistem otomasi industri menggunakan Programmable Logic Controller (PLC). Peserta menunjukkan kemampuan dalam mengembangkan sistem kontrol yang andal, mengintegrasikan berbagai komponen industri, serta menyelesaikan tantangan otomasi melalui solusi rekayasa yang efisien dan inovatif.',
    icon: 'Layers',
    image: '/images/divisions/plc-industrial.jpg',
    specHighlight: 'Industrial Automation',
    intensityScore: 92,
    glowColor: 'rgba(0, 255, 136, 0.45)',
    maxStaff: 1,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['University Student'],
    hasLecturer: true,
    price: 'Rp. 280,000',
    priceUSD: '$26.00',
    whatsappGroup: 'https://chat.whatsapp.com/B8RMDu9uJ3tIQBgcbcx4NL',
    contactPersons: [
      { name: 'Randy', waNumber: '6287824300637', label: 'National' },
      { name: 'Iqbal', waNumber: '6285283476045', label: 'International' }
    ]
  },
  {
    id: 'collaborative-robot',
    title: 'Collaborative Robot',
    description: 'This competition division will be opening soon. Stay tuned for updates!',
    indonesianDescription: 'Mata lomba ini akan segera dibuka. Nantikan informasi selanjutnya!',
    icon: 'Cpu',
    image: '/images/divisions/collaborative-robot.jpg',
    specHighlight: 'Coming Soon',
    intensityScore: 0,
    glowColor: 'rgba(197, 160, 89, 0.4)',
    maxStaff: 1,
    hasSubCategory: false,
    hasLevels: false,
    hasLecturer: true,
    comingSoon: true,
    price: 'Rp. 500,000',
    priceUSD: '$30.00',
    whatsappGroup: '',
    contactPersons: []
  },
  {
    id: 'research-innovation',
    title: 'Research Innovation',
    description: 'The Research Innovation division is a competition that encourages participants to produce scientific papers and innovative research in science, technology, electronics, robotics, and other related fields. Participants are challenged to present creative, applicable research-based solutions that contribute to the advancement of science and technology.',
    indonesianDescription: 'Divisi Research Innovation merupakan kompetisi yang mendorong peserta untuk menghasilkan karya tulis ilmiah dan penelitian inovatif dalam bidang sains, teknologi, elektronika, robotika, maupun bidang terkait lainnya. Peserta ditantang menyajikan solusi berbasis riset yang kreatif, aplikatif, dan memberikan kontribusi terhadap perkembangan ilmu pengetahuan dan teknologi.',
    icon: 'BookOpen',
    image: '/images/divisions/research-innovation.jpg',
    specHighlight: 'Research & Innovation',
    intensityScore: 85,
    glowColor: 'rgba(0, 71, 171, 0.35)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['University Student'],
    hasLecturer: false,
    price: 'Rp. 120,000',
    priceUSD: '$7.50',
    whatsappGroup: 'https://chat.whatsapp.com/Jp5VNTCxXgGFP3RNZCLI6z',
    contactPersons: [
      { name: 'Intan', waNumber: '6285780247605', label: 'National' },
      { name: 'Adiba', waNumber: '6285893177023', label: 'International' }
    ]
  },
  {
    id: 'creative-innovation',
    title: 'Creative Innovation',
    description: 'The Creative Innovation division is a competition focused on developing innovative products, prototypes, or technologies that provide solutions to various problems in society and industry. Participants are encouraged to combine creativity, engineering, and innovation into functional, useful, and valuable works.',
    indonesianDescription: 'Divisi Creative Innovation merupakan kompetisi yang berfokus pada pengembangan produk, prototipe, atau teknologi inovatif yang memberikan solusi terhadap berbagai permasalahan di masyarakat maupun industri. Peserta didorong untuk menggabungkan kreativitas, rekayasa, dan inovasi menjadi karya yang fungsional, bermanfaat, dan bernilai.',
    icon: 'Lightbulb',
    image: '/images/divisions/creative-innovation.jpg',
    specHighlight: 'Creativity & Innovation',
    intensityScore: 88,
    glowColor: 'rgba(77, 255, 184, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Elementary (SD)', 'SMP/Junior High School', 'Senior High / Vocational (SMA / SMK)'],
    hasLecturer: false,
    price: 'Rp. 120,000',
    priceUSD: '$7.50',
    whatsappGroup: 'https://chat.whatsapp.com/LwWIV0GAElF1DbT2nmn6Ug',
    contactPersons: [
      { name: 'Joan', waNumber: '6285716476747', label: 'National' },
      { name: 'Barnett', waNumber: '6289506359322', label: 'International' }
    ]
  },
  {
    id: 'drone-innovation',
    title: 'Drone Innovation',
    description: 'The Drone Innovation division challenges participants to design, develop, and operate drone-based systems to solve various challenges effectively and efficiently. This competition emphasizes the ability to integrate flight technology, control systems, and innovation to produce reliable solutions.',
    indonesianDescription: 'Divisi Drone Innovation menantang peserta untuk merancang, mengembangkan, dan mengoperasikan sistem berbasis drone guna menyelesaikan berbagai tantangan secara efektif dan efisien. Kompetisi ini mengedepankan kemampuan dalam mengintegrasikan teknologi penerbangan, sistem kendali, dan inovasi untuk menghasilkan solusi yang andal.',
    icon: 'Compass',
    image: '/images/divisions/drone-innovation.jpg',
    specHighlight: 'Technology & Navigation',
    intensityScore: 94,
    glowColor: 'rgba(0, 255, 136, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: false,
    hasLecturer: false,
    price: 'Rp. 120,000',
    priceUSD: '$7.50',
    whatsappGroup: 'https://chat.whatsapp.com/D4Gr6PaoSzI2ZI4gTiRYnZ',
    contactPersons: [
      { name: 'David Alberto', waNumber: '6282124347415', label: 'National' },
      { name: 'Angela Eva', waNumber: '628567915845', label: 'International' }
    ]
  }
];

export const ROBOT_MACHINES: RobotMachine[] = [
  {
    id: 'm-01',
    name: 'Garuda Soccerbot v3',
    category: 'Mini Soccerbot',
    year: '2025 Winner',
    imageUrl: '/images/humanoid_soccer_1780298617429.png',
    batteryLife: '2.5 Hours',
    weight: '5.2 kg',
    maxSpeed: '2.1 m/s',
    processingPower: 'Raspberry Pi 4 + Coral Edge TPU',
    specifications: {
      'Origin Institution': 'Jakarta State University (UNJ)',
      'Development Team': 'Batavia Robotics Lab',
      'Chassis System': 'CNC Milled Aluminum Alloy duralumin',
      'Sensors & Camera': 'Omnidirectional Camera with OpenCV ball tracking'
    },
    achievements: [
      'Championship Gold Medal - ERIC soccerbot Division 2025',
      'Best Autonomous AI Coordination Award'
    ]
  },
  {
    id: 'm-02',
    name: 'Suro-3K Heavy Sumo',
    category: 'Sumobot 3kg',
    year: '2025 Runner-up',
    imageUrl: '/images/cyber_sumobot_1780299691137.png',
    batteryLife: '1.2 Hours',
    weight: '3.0 kg',
    maxSpeed: '3.8 m/s',
    processingPower: 'Teensy 4.1 Microcontroller @ 600MHz',
    specifications: {
      'Origin Institution': 'Institut Teknologi Sepuluh Nopember (ITS)',
      'Development Team': 'Suro-Bot Surabaya Team',
      'Actuator Motors': 'Dual Maxon Coreless DC Motors 150W',
      'Traction System': 'High-Grip Neodymium Magnetic Array Underbelly'
    },
    achievements: [
      'Silver Medal - Sumobot Elite Tournament 2025',
      'Most Durable Steel Frame Construction Award'
    ]
  },
  {
    id: 'm-03',
    name: 'Cakrawala AgroDrone',
    category: 'Drone Innovation',
    year: '2025 Top Innovation',
    imageUrl: '/images/championship_drone_1780299711288.png',
    batteryLife: '35 Minutes',
    weight: '2.4 kg',
    maxSpeed: '12.0 m/s',
    processingPower: 'Pixhawk 6X Flight Controller + Jetson Nano',
    specifications: {
      'Origin Institution': 'Institut Teknologi Bandung (ITB)',
      'Development Team': 'Cakrawala Aerospace Unit',
      'Avoidance System': 'Solid-State LiDAR + Optical Flow Sensor Array',
      'Main Payload': 'Autonomous Fertilizer Spraying & Multispectral Camera'
    },
    achievements: [
      'Best Academic Research Paper - ERIC 2025',
      'First Place - Autonomous Agricultural Mapping'
    ]
  },
  {
    id: 'm-04',
    name: 'Sakura Cobot Arm',
    category: 'Collaborative Robot',
    year: '2024 Tech Favorite',
    imageUrl: '/images/innovation_arm_1780298643999.png',
    batteryLife: 'Wall Plugged / AC Adapter',
    weight: '12.5 kg',
    maxSpeed: '0.05mm Repeatability',
    processingPower: 'Arduino Giga R1 + Dual STM32 Core',
    specifications: {
      'Origin Institution': 'Universitas Indonesia (UI)',
      'Development Team': 'Sakura Makers Collective',
      'Kinematics': '5-DOF Inverse Kinematics with Active Torque Feedback',
      'Safety Index': 'Direct Contact Current sensing auto-stop'
    },
    achievements: [
      'Most Cost-Efficient Industrial Automator Innovation 2024',
      'Certified Open-Source Hardware Design Registry'
    ]
  },
  {
    id: 'm-05',
    name: 'Vanguard Tracker',
    category: 'Line Follower',
    year: '2025 Speed Record',
    imageUrl: '/images/autonomous_robot_1780298580155.png',
    batteryLife: '3.0 Hours',
    weight: '0.8 kg',
    maxSpeed: '5.5 m/s',
    processingPower: 'STM32F407 High-Performance Controller',
    specifications: {
      'Origin Institution': 'Universitas Negeri Yogyakarta (UNY)',
      'Development Team': 'Vanguard Electro Mechanics',
      'Sensor Plate': '16-Channel Differential Photodiode Infrared Array',
      'Steering Law': 'Closed-loop PID with Adaptive Speed Profile Calculation'
    },
    achievements: [
      'Gold Medal - Fast Tracking Class 2025',
      'All-Time Record-Breaking Speed Lap (12.2 seconds)'
    ]
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    phase: 'JANUARY - JUNE',
    title: 'Socialization Campaign',
    date: '1 January-30 June 2026',
    description: 'Interactive info-sessions, campus tours, and rulebook socialization across leading institutions in Indonesia.',
    details: 'Competition regulation socialization campaign, participant guidebook distribution, and introduction of offline/online divisions across universities throughout Indonesia.',
    status: 'completed'
  },
  {
    phase: 'JULY - AUGUST',
    title: 'Roster Registration',
    date: 'July 01 - August 31, 2026',
    description: 'Secure mekatronika slots, upload structural schematics, and lock in telemetry signals for processing.',
    details: 'Team registration, administrative filling, and submission of circuit blueprints and innovation project abstracts.',
    status: 'active'
  },
  {
    phase: 'SEPTEMBER',
    title: 'Technical Meeting',
    date: '15 September 2026',
    description: 'Unveiling active arena dimensions, rules clarification, and code frequency locks with the engineering board.',
    details: 'Technical arena directives, match order drawing, and control radio frequency synchronization.',
    status: 'upcoming'
  },
  {
    phase: 'SEPTEMBER',
    title: 'Championship Matches',
    date: '22-24 September 2026',
    description: 'High stakes combat, real-time autonomous racing, and mechatonics pitching at the grand sports arena.',
    details: 'Three days of peak action-packed competition under the spotlight of the prestigious Jakarta State University stage.',
    status: 'upcoming'
  },
  {
    phase: 'SEPTEMBER GALA',
    title: 'Grand Victory Awards',
    date: 'September 24, 2026',
    description: 'Dispensing the Rp 60,000,000+ prize support pool, project scale-up funding, and corporate developer contracts.',
    details: 'Championship trophy award night, incubation option distribution, and national laboratory partnership contracts.',
    status: 'upcoming'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-01',
    title: 'ERIC Robotics Competition Atmosphere',
    category: 'Competition',
    imageUrl: '/images/gallery/DSC01430.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-02',
    title: 'Robot Team Competing in the Sumobot Arena',
    category: 'Arena',
    imageUrl: '/images/gallery/DSC01530.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-03',
    title: 'Participating Teams and Their Robot Creations',
    category: 'Participants',
    imageUrl: '/images/gallery/DSC01947.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-04',
    title: 'ERIC Event Documentation',
    category: 'Documentation',
    imageUrl: '/images/gallery/IMG_8032.JPG',
    aspectClassName: ''
  },
  {
    id: 'g-05',
    title: 'Robot Creations by ERIC Participants',
    category: 'Competition',
    imageUrl: '/images/gallery/DSC00719.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-06',
    title: 'Excitement at ERIC 2026 Event',
    category: 'Arena',
    imageUrl: '/images/gallery/DSC01115.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-07',
    title: 'Group Photo with ERIC Participants',
    category: 'Participants',
    imageUrl: '/images/gallery/DSC_0812.JPG',
    aspectClassName: ''
  },
  {
    id: 'g-08',
    title: 'Robot Preparation Moments',
    category: 'Competition',
    imageUrl: '/images/gallery/DSC_0545.JPG',
    aspectClassName: ''
  }
];

export const CORE_VISION_MISSION = {
  aboutTitle: 'Beyond the Horizon, Be the Best Beat the Rest',
  latarBelakang: 'Electronics & Robotics Innovation Competition (ERIC) 2026 is a global competition that brings together students, researchers, and innovators from diverse backgrounds. This event serves as a platform for exchanging ideas, fostering creativity, and developing innovations in the fields of electronics and robotics. Through this competition, participants are expected to develop critical thinking and problem-solving skills that are essential in the Society 5.0 era.',
  latarBelakangID: 'Electronics & Robotics Innovation Competition (ERIC) 2026 adalah kompetisi global yang mempertemukan mahasiswa, peneliti, dan inovator dari berbagai latar belakang. Kegiatan ini menjadi wadah untuk bertukar ide, mendorong kreativitas, dan mengembangkan inovasi di bidang elektronika serta robotika. Melalui kompetisi ini, peserta diharapkan mengembangkan kemampuan berpikir kritis dan pemecahan masalah yang sangat dibutuhkan pada era Society 5.0.',
  tujuan: [
    'Organize a competitive and challenging electronics and robotics competition to drive innovation and provide solutions for real-world technology challenges in the Industry 4.0 and Society 5.0 era.',
    'Encourage participants to develop creativity, innovation, and critical thinking skills through a fair, professional, and structured competitive environment.',
    'Provide a collaborative platform for students and young innovators to compete, exchange ideas, and showcase their best potential in electronics and robotics at national and international levels.',
    'Encourage the creation of practical, solution-oriented technology projects that have a positive impact on industry, education, and community needs.',
    'Instill values of sportsmanship, integrity, teamwork, and excellence throughout the entire competition process, from preparation to final evaluation.'
  ],
  tujuanID: [
    'Menyelenggarakan kompetisi elektronika dan robotika yang kompetitif dan menantang untuk mendorong inovasi serta memberikan solusi atas tantangan teknologi nyata di era Industri 4.0 dan Society 5.0.',
    'Mendorong peserta mengembangkan kreativitas, inovasi, dan kemampuan berpikir kritis melalui lingkungan kompetisi yang adil, profesional, dan terstruktur.',
    'Menyediakan wadah kolaboratif bagi mahasiswa dan inovator muda untuk berkompetisi, bertukar ide, dan menampilkan potensi terbaik di bidang elektronika dan robotika pada tingkat nasional maupun internasional.',
    'Mendorong lahirnya proyek teknologi yang praktis dan berorientasi solusi, yang memberi dampak positif bagi kebutuhan industri, pendidikan, dan masyarakat.',
    'Menanamkan nilai sportivitas, integritas, kerja sama tim, dan keunggulan selama seluruh proses kompetisi, mulai dari persiapan hingga penilaian akhir.'
  ]
};

export const STATISTICS = [
  { value: 'Rp 62M+', label: 'Cash Prize & Incubation' },
  { value: '12 Arenas', label: 'Competition Divisions' },
  { value: '900+ People', label: 'Registered' },
  { value: '25+ Partners', label: 'Venture & Tech Networks' }
];

export const MAIN_WHATSAPP_GROUP = 'https://chat.whatsapp.com/GZEO4EwvIcaBxVqFUy4tBU?s=cl&p=a&ilr=0';

export const SUPPORTED_BY = [
  {
    name: 'Ministry of Education',
    logo: '/images/supported-by/kemendikbud.png',
    initials: 'KEMENDIKBUD'
  },
  {
    name: 'Jakarta State University (UNJ)',
    logo: '/images/supported-by/unj.png',
    initials: 'UNJ'
  },
  {
    name: 'Kampus Berdampak',
    logo: '/images/supported-by/kampus-berdampak.png',
    initials: 'KB'
  },
  {
    name: 'FSI UNJ',
    logo: '/images/supported-by/fsi.png',
    initials: 'FSI'
  },
  {
    name: 'BEMELKA',
    logo: '/images/supported-by/bemelka.png',
    initials: 'BMK'
  }
];

export const COUNTRY_CODES = [
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
  { code: '+856', country: 'Laos', flag: '🇱🇦' },
  { code: '+673', country: 'Brunei', flag: '🇧🇳' },
  { code: '+670', country: 'Timor-Leste', flag: '🇹🇱' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+853', country: 'Macau', flag: '🇲🇴' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
  { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
];

export const SPONSORS = [
  { name: 'iSee Electronic and Robotics Store', initials: 'iSee', logo: '/images/sponsors/isee.png', tier: 'silver' },
  { name: 'Cytron Technologies', initials: 'CT', logo: '/images/sponsors/ct-cytron.png', tier: 'gold' },
  { name: 'PDP Common Rail & Fuel Injection Pump', initials: 'PDP', logo: '/images/sponsors/pdp.png', tier: 'platinum' },
  { name: 'Alpha Mechatronics', initials: 'AM', logo: '/images/sponsors/ap-alpha.png', tier: 'titanium' }
];

// 3-Day Journey Blueprint Details
export const EVENT_DAY_JOURNEY = [
  {
    dayNum: 'DAY 01',
    phaseName: 'LAUNCH & COMBAT',
    indonesianPhase: 'PEMBUKAAN & KOMBAT',
    description: 'Immersive Opening Ceremony followed by the historic Team Parade. Active robot telemetry logs initialize as Sumobots battle and Soccerbots take the turf under high-frequency radio control.',
    indonesianDescription: 'Upacara pembukaan memukau didampingi Parade Tim. Telemetri aktif mulai berjalan untuk mengawali perebutan divisi Sumobot, Mini Soccerbot, serta penyelarasan PLC & Robot Kolaboratif.',
    activities: [
      'OPENING CEREMONY',
      'PLC INDUSTRY',
      'COLLABORATIVE ROBOT',
      'MINI SOCCER BOT',
      'SUMOBOT 3KG'
    ]
  },
  {
    dayNum: 'DAY 02',
    phaseName: 'VELOCITY & SCIENCE',
    indonesianPhase: 'KECEPATAN & SAINS',
    description: 'Pure high speed trajectory calculations. Line Followers race across complex layered track grids, while Research Challenge contenders present paper blueprints to our panel of judges.',
    indonesianDescription: 'Perhitungan kecepatan lintasan murni. Robot Line Follower berlomba menyusuri sirkuit berlapis, sementara finalis Research Challenge mempertahankan karya ilmiah di hadapan dewan penguji.',
    activities: [
      'PLC INDUSTRI',
      'COLLABORATIVE ROBOT',
      'LINE FOLLOWER',
      'RESEARCH INNOVATION CHALLENGE'
    ]
  },
  {
    dayNum: 'DAY 03',
    phaseName: 'AERIALS & VICTORY',
    indonesianPhase: 'DIRGANTARA & KEMENANGAN',
    description: 'Ecosystems move into the skies with Drone Obstacle flight runs. Inventions pitch in Creative Innovation, leading up to the final combat clashes and the prestigious Award Ceremony.',
    indonesianDescription: 'Ekosistem beralih ke ruang udara dengan uji halang rintang Drone Innovation. Pitching inovasi kreatif disusul babak final terpanas serta malam penganugerahan pemenang utama.',
    activities: [
      'PLC INDUSTRI',
      'COLLABORATIVE ROBOT',
      'DRONE INNOVATION',
      'SUMOBOT 500GR RC DAN AUTONOMUS',
      'CLOSING CEREMONY'
    ]
  }
];
