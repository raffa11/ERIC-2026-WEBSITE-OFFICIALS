/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Division, RobotMachine, TimelineEvent, GalleryItem } from './types';

export const COMPETITION_DIVISIONS: Division[] = [
  {
    id: 'sumobot-500g',
    title: 'Sumobot 500g',
    indonesianTitle: 'Robot Sumo 500g',
    description: 'Autonomous combat maneuvers and precision engineering design. Teams deploy lightweight tactical sumobots optimized for high response speeds and active domain domination under 500g weight tolerances.',
    indonesianDescription: 'Pertarungan robot otonom dengan rekayasa tingkat mikro. Tim merancang robot sumo taktis ringan di bawah 500g yang dioptimalkan untuk reaksi instan dan dominasi arena.',
    icon: 'Shield',
    specHighlight: 'Tactical Grip',
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
      { name: 'Ade', waNumber: '6283143705558', label: 'Nasional' },
      { name: 'Nabil', waNumber: '6282258640813', label: 'Internasional' }
    ]
  },
  {
    id: 'sumobot-3kg',
    title: 'Sumobot 3kg',
    indonesianTitle: 'Robot Sumo 3kg',
    description: 'High power magnetic tractive force and strategic programming. Heavier platforms commanding supreme steel armor, dual brushless drives, and autonomous ring displacement strategies.',
    indonesianDescription: 'Kekuatan medan magnet dan traksi ekstrem dengan pemrograman taktis. Robot sumo 3kg berlapis baja premium, sistem penggerak brushless ganda, dan strategi sensorik otonom.',
    icon: 'Terminal',
    specHighlight: 'Steel Armor',
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
      { name: 'Ryan', waNumber: '6285711011898', label: 'Nasional' },
      { name: 'Theo', waNumber: '6282111490515', label: 'Internasional' }
    ]
  },
  {
    id: 'mini-soccer',
    title: 'Mini Soccer',
    indonesianTitle: 'Robot Sepak Bola Mini',
    description: 'Active teamwork, decentralized communication, dynamic AI decision-making controls, and real-time kinematic control. Perfect bipedal or wheeled athletics converging on the tactical ball.',
    indonesianDescription: 'Kerjasama tim aktif, komunikasi desentralisasi, kecerdasan buatan dinamis, dan kontrol pemosisian real-time. Atletik robotik roda atau berkaki bertarung merebut bola.',
    icon: 'Activity',
    specHighlight: 'Active Teamwork',
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
      { name: 'Dimas', waNumber: '6285715139655', label: 'Nasional' },
      { name: 'Noufal', waNumber: '6281317811877', label: 'Internasional' }
    ]
  },
  {
    id: 'line-follower',
    title: 'Line Follower',
    indonesianTitle: 'Robot Pengikut Garis',
    description: 'High speed tracking, razor sharp curves, and real-time math optimization. High-rate IR arrays translating continuous tracks securely under strict physical tolerances.',
    indonesianDescription: 'Navigasi lintasan super cepat dengan perhitungan kontrol PID instan. 16-channel array sensor inframerah presisi tinggi mendeteksi belokan secara mulus.',
    icon: 'Navigation',
    specHighlight: 'High-Speed Tracking',
    intensityScore: 87,
    glowColor: 'rgba(77, 255, 184, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Mahasiswa', 'Pelajar'],
    hasLecturer: false,
    price: 'Rp. 250,000',
    priceUSD: '$20.00',
    whatsappGroup: 'https://chat.whatsapp.com/HNXtjsKC5g50PZzuPt7NOq',
    contactPersons: [
      { name: 'Rizqba', waNumber: '6289637788569', label: 'Nasional' },
      { name: 'Raihan R', waNumber: '62895332277723', label: 'Internasional' }
    ]
  },
  {
    id: 'plc-industrial',
    title: 'PLC Industrials',
    indonesianTitle: 'PLC Otomasi Industri',
    description: 'Smart automation control models, robust PLC logic integration, and Industry 4.0 production simulator. Direct deployment of hardware relays processing real manufacturing tasks.',
    indonesianDescription: 'Sistem pengkabelan modular, logika PLC industri, dan integrasi pabrik cerdas Industry 4.0. Pemrosesan relay waktu nyata untuk mensimulasikan pabrik otomatis murni.',
    icon: 'Layers',
    specHighlight: 'HMI Integration',
    intensityScore: 92,
    glowColor: 'rgba(0, 255, 136, 0.45)',
    maxStaff: 1,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Mahasiswa'],
    hasLecturer: true,
    price: 'Rp. 280,000',
    priceUSD: '$26.00',
    whatsappGroup: 'https://chat.whatsapp.com/B8RMDu9uJ3tIQBgcbcx4NL',
    contactPersons: [
      { name: 'Randy', waNumber: '6287824300637', label: 'Nasional' },
      { name: 'Iqbal', waNumber: '6285283476045', label: 'Internasional' }
    ]
  },
  {
    id: 'collaborative-robot',
    title: 'Collaborative Robot',
    indonesianTitle: 'Robot Kolaboratif (Cobot)',
    description: 'Advanced human-machine collaboration ecosystems, safety compliance sensors, and premium torque feedback calibration. Designing assistive arms that coordinate directly with human workspaces.',
    indonesianDescription: 'Integrasi hubungan aman antara robot dan manusia. Penyandian balik gaya presisi tinggi untuk memanipulasi obyek rapuh dengan algoritma keselamatan terintegrasi.',
    icon: 'Cpu',
    specHighlight: 'Spatial Safety',
    intensityScore: 90,
    glowColor: 'rgba(197, 160, 89, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['SMK'],
    hasLecturer: false,
    price: 'Rp. 500,000',
    priceUSD: '$30.00',
    whatsappGroup: 'https://chat.whatsapp.com/HHKWkVk3oA8DwMNBTE2LpU',
    contactPersons: [
      { name: 'Wijaya', waNumber: '62881010963051', label: 'Nasional' },
      { name: 'Athallah', waNumber: '6287782491551', label: 'Internasional' }
    ]
  },
  {
    id: 'research-innovation',
    title: 'Research Innovation',
    indonesianTitle: 'Tantangan Riset Inovasi',
    description: 'Academic research breakthroughs, deep technical problem solving, and revolutionary concept abstracts. Judged by doctors, enterprise advisors, and global research lab managers.',
    indonesianDescription: 'Presentasi tulisan sains, formulasi masalah mekanis, dan penyelesaian berbasis teori cerdas. Menggabungkan kegunaan praktis dengan kontribusi riset mendalam.',
    icon: 'BookOpen',
    specHighlight: 'Science Papers',
    intensityScore: 85,
    glowColor: 'rgba(0, 71, 171, 0.35)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Mahasiswa'],
    hasLecturer: false,
    price: 'Rp. 120,000',
    priceUSD: '$7.50',
    whatsappGroup: 'https://chat.whatsapp.com/Jp5VNTCxXgGFP3RNZCLI6z',
    contactPersons: [
      { name: 'Intan', waNumber: '6285780247605', label: 'Nasional' },
      { name: 'Adiba', waNumber: '6285893177023', label: 'Internasional' }
    ]
  },
  {
    id: 'creative-innovation',
    title: 'Creative Innovation',
    indonesianTitle: 'Karya Inovasi Kreatif',
    description: 'Engineering design concepts, modern technological solutions, and advanced mechatronics prototyping. Perfect integration of materials, industrial aesthetics, and real usability factors.',
    indonesianDescription: 'Rancangan desain mekanis yang berpusat pada kegunaan nyata dengan keindahan estetika sirkuit. Produk fungsional yang siap diproduksi massal untuk industri modern.',
    icon: 'Lightbulb',
    specHighlight: 'CAD Design',
    intensityScore: 88,
    glowColor: 'rgba(77, 255, 184, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Junior SD', 'Senior SMP Sederajat', 'SMA Sederajat'],
    hasLecturer: true,
    price: 'Rp. 120,000',
    priceUSD: '$7.50',
    whatsappGroup: 'https://chat.whatsapp.com/LwWIV0GAElF1DbT2nmn6Ug',
    contactPersons: [
      { name: 'Joan', waNumber: '6285716476747', label: 'Nasional' },
      { name: 'Barnett', waNumber: '6289506359322', label: 'Internasional' }
    ]
  },
  {
    id: 'drone-innovation',
    title: 'Drone Innovation',
    indonesianTitle: 'Inovasi Wahana Drone',
    description: 'Aerial navigation systems, real-time spatial positioning, and autonomous obstacle avoidance. Deploying highly agile multicopters capable of delivering parcels or mapping rugged arenas.',
    indonesianDescription: 'Pengembangan piranti drone otonom, sistem navigasi udara, dan penghindar rintangan dalam ruang dinamis. Dirancang untuk pemetaan taktis hingga logistik otonom.',
    icon: 'Compass',
    specHighlight: 'Optical Flow',
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
      { name: 'David Alberto', waNumber: '6282124347415', label: 'Nasional' },
      { name: 'Angela Eva', waNumber: '628567915845', label: 'Internasional' }
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
      'Origin Institution': 'Universitas Negeri Jakarta (UNJ)',
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
    title: 'Tim Robot Berlaga di Arena Sumobot',
    category: 'Competition',
    imageUrl: '/images/gallery/DSC01430.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-02',
    title: 'Suasana Lomba Robotik ERIC',
    category: 'Arena',
    imageUrl: '/images/gallery/DSC01530.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-03',
    title: 'Tim Peserta dan Karya Robot Mereka',
    category: 'Participants',
    imageUrl: '/images/gallery/DSC01947.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-04',
    title: 'Dokumentasi Kegiatan ERIC',
    category: 'Documentation',
    imageUrl: '/images/gallery/IMG_8032.JPG',
    aspectClassName: ''
  },
  {
    id: 'g-05',
    title: 'Robot Karya Peserta ERIC',
    category: 'Competition',
    imageUrl: '/images/gallery/DSC00719.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-06',
    title: 'Keseruan Acara ERIC 2026',
    category: 'Arena',
    imageUrl: '/images/gallery/DSC01115.jpg',
    aspectClassName: ''
  },
  {
    id: 'g-07',
    title: 'Foto Bersama Peserta ERIC',
    category: 'Participants',
    imageUrl: '/images/gallery/DSC_0812.JPG',
    aspectClassName: ''
  },
  {
    id: 'g-08',
    title: 'Momen Persiapan Robot',
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
    name: 'Universitas Negeri Jakarta',
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

export const SPONSORS = [
  { name: 'ALPHA MECHATRONICS', initials: 'AP', logo: '/images/sponsors/ap-alpha.png' },
  { name: 'CYTRON TECHNOLOGIES', initials: 'CT', logo: '/images/sponsors/ct-cytron.png' },
  { name: 'PDP Comon & fuel injection Pump', initials: 'PDP', logo: '/images/sponsors/pdp.png' },
  { name: 'iSee Electronic and robotics store', initials: 'iSee', logo: '/images/sponsors/isee.png' }
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
