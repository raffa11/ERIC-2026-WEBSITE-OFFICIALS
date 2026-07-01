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
    specHighlight: 'Micro Force & Tactical Grip',
    intensityScore: 89,
    glowColor: 'rgba(0, 255, 136, 0.4)',
    maxStaff: 1,
    hasSubCategory: true,
    subCategories: ['RC', 'Autonomous'],
    hasLevels: false,
    hasLecturer: false
  },
  {
    id: 'sumobot-3kg',
    title: 'Sumobot 3kg',
    indonesianTitle: 'Robot Sumo 3kg',
    description: 'High power magnetic tractive force and strategic programming. Heavier platforms commanding supreme steel armor, dual brushless drives, and autonomous ring displacement strategies.',
    indonesianDescription: 'Kekuatan medan magnet dan traksi ekstrem dengan pemrograman taktis. Robot sumo 3kg berlapis baja premium, sistem penggerak brushless ganda, dan strategi sensorik otonom.',
    icon: 'Terminal',
    specHighlight: 'Tractive Force & Dual Brushless',
    intensityScore: 96,
    glowColor: 'rgba(197, 160, 89, 0.4)',
    maxStaff: 1,
    hasSubCategory: true,
    subCategories: ['RC'],
    hasLevels: false,
    hasLecturer: false
  },
  {
    id: 'mini-soccer',
    title: 'Mini Soccer',
    indonesianTitle: 'Robot Sepak Bola Mini',
    description: 'Active teamwork, decentralized communication, dynamic AI decision-making controls, and real-time kinematic control. Perfect bipedal or wheeled athletics converging on the tactical ball.',
    indonesianDescription: 'Kerjasama tim aktif, komunikasi desentralisasi, kecerdasan buatan dinamis, dan kontrol pemosisian real-time. Atletik robotik roda atau berkaki bertarung merebut bola.',
    icon: 'Activity',
    specHighlight: 'Kinematics & Radio Command',
    intensityScore: 91,
    glowColor: 'rgba(0, 71, 171, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: false,
    hasLecturer: false
  },
  {
    id: 'line-follower',
    title: 'Line Follower',
    indonesianTitle: 'Robot Pengikut Garis',
    description: 'High speed tracking, razor sharp curves, and real-time math optimization. High-rate IR arrays translating continuous tracks securely under strict physical tolerances.',
    indonesianDescription: 'Navigasi lintasan super cepat dengan perhitungan kontrol PID instan. 16-channel array sensor inframerah presisi tinggi mendeteksi belokan secara mulus.',
    icon: 'Navigation',
    specHighlight: 'PID Control & 16-Array IR',
    intensityScore: 87,
    glowColor: 'rgba(77, 255, 184, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Mahasiswa', 'Pelajar'],
    hasLecturer: false
  },
  {
    id: 'plc-industrial',
    title: 'PLC Industrials',
    indonesianTitle: 'PLC Otomasi Industri',
    description: 'Smart automation control models, robust PLC logic integration, and Industry 4.0 production simulator. Direct deployment of hardware relays processing real manufacturing tasks.',
    indonesianDescription: 'Sistem pengkabelan modular, logika PLC industri, dan integrasi pabrik cerdas Industry 4.0. Pemrosesan relay waktu nyata untuk mensimulasikan pabrik otomatis murni.',
    icon: 'Layers',
    specHighlight: 'Liaison Relay & HMI Integration',
    intensityScore: 92,
    glowColor: 'rgba(0, 255, 136, 0.45)',
    maxStaff: 1,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Mahasiswa'],
    hasLecturer: true
  },
  {
    id: 'collaborative-robot',
    title: 'Collaborative Robot',
    indonesianTitle: 'Robot Kolaboratif (Cobot)',
    description: 'Advanced human-machine collaboration ecosystems, safety compliance sensors, and premium torque feedback calibration. Designing assistive arms that coordinate directly with human workspaces.',
    indonesianDescription: 'Integrasi hubungan aman antara robot dan manusia. Penyandian balik gaya presisi tinggi untuk memanipulasi obyek rapuh dengan algoritma keselamatan terintegrasi.',
    icon: 'Cpu',
    specHighlight: 'Active Feedback & Spatial Safety',
    intensityScore: 90,
    glowColor: 'rgba(197, 160, 89, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['SMK'],
    hasLecturer: false
  },
  {
    id: 'research-innovation',
    title: 'Research Innovation',
    indonesianTitle: 'Tantangan Riset Inovasi',
    description: 'Academic research breakthroughs, deep technical problem solving, and revolutionary concept abstracts. Judged by doctors, enterprise advisors, and global research lab managers.',
    indonesianDescription: 'Presentasi tulisan sains, formulasi masalah mekanis, dan penyelesaian berbasis teori cerdas. Menggabungkan kegunaan praktis dengan kontribusi riset mendalam.',
    icon: 'BookOpen',
    specHighlight: 'Applied Research & Science Papers',
    intensityScore: 85,
    glowColor: 'rgba(0, 71, 171, 0.35)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Mahasiswa'],
    hasLecturer: false
  },
  {
    id: 'creative-innovation',
    title: 'Creative Innovation',
    indonesianTitle: 'Karya Inovasi Kreatif',
    description: 'Engineering design concepts, modern technological solutions, and advanced mechatronics prototyping. Perfect integration of materials, industrial aesthetics, and real usability factors.',
    indonesianDescription: 'Rancangan desain mekanis yang berpusat pada kegunaan nyata dengan keindahan estetika sirkuit. Produk fungsional yang siap diproduksi massal untuk industri modern.',
    icon: 'Lightbulb',
    specHighlight: 'Rapid Prototyping & CAD Design',
    intensityScore: 88,
    glowColor: 'rgba(77, 255, 184, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: true,
    levels: ['Junior SD', 'Senior SMP Sederajat', 'SMA Sederajat'],
    hasLecturer: true
  },
  {
    id: 'drone-innovation',
    title: 'Drone Innovation',
    indonesianTitle: 'Inovasi Wahana Drone',
    description: 'Aerial navigation systems, real-time spatial positioning, and autonomous obstacle avoidance. Deploying highly agile multicopters capable of delivering parcels or mapping rugged arenas.',
    indonesianDescription: 'Pengembangan piranti drone otonom, sistem navigasi udara, dan penghindar rintangan dalam ruang dinamis. Dirancang untuk pemetaan taktis hingga logistik otonom.',
    icon: 'Compass',
    specHighlight: 'Lidar Distance & Optical Flow',
    intensityScore: 94,
    glowColor: 'rgba(0, 255, 136, 0.4)',
    maxStaff: 2,
    hasSubCategory: false,
    hasLevels: false,
    hasLecturer: false
  }
];

export const ROBOT_MACHINES: RobotMachine[] = [
  {
    id: 'm-01',
    name: 'Garuda Soccerbot v3',
    category: 'Mini Soccerbot',
    year: '2025 Winner',
    imageUrl: '/src/assets/images/humanoid_soccer_1780298617429.png',
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
    imageUrl: '/src/assets/images/cyber_sumobot_1780299691137.png',
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
    imageUrl: '/src/assets/images/championship_drone_1780299711288.png',
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
    imageUrl: '/src/assets/images/innovation_arm_1780298643999.png',
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
    imageUrl: '/src/assets/images/autonomous_robot_1780298580155.png',
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
    date: 'January - June 2026',
    description: 'Interactive info-sessions, campus tours, and rulebook socialization across leading institutions in Indonesia.',
    details: 'Kampanye sosialisasi regulasi kompetisi, buku panduan peserta, dan pengenalan divisi luring/daring ke kampus seluruh Indonesia.',
    status: 'completed'
  },
  {
    phase: 'JULY - AUGUST',
    title: 'Roster Registration',
    date: 'July 01 - August 31, 2026',
    description: 'Secure mekatronika slots, upload structural schematics, and lock in telemetry signals for processing.',
    details: 'Pendaftaran tim, pengisian administrasi, serta unggah cetak biru sirkuit dan abstrak proyek inovasi.',
    status: 'active'
  },
  {
    phase: 'SEPTEMBER',
    title: 'Technical Meeting',
    date: 'First Week of September 2026',
    description: 'Unveiling active arena dimensions, rules clarification, and code frequency locks with the engineering board.',
    details: 'Pemberian arahan teknis arena, pengundian nomor urut tanding, dan sinkronisasi frekuensi radio kendali.',
    status: 'upcoming'
  },
  {
    phase: '22–24 SEPTEMBER',
    title: 'Championship Matches',
    date: '22 - 24 September 2026',
    description: 'High stakes combat, real-time autonomous racing, and mechatonics pitching at the grand sports arena.',
    details: 'Pertarungan puncak tiga hari penuh aksi di bawah sorot lampu panggung bergengsi Universitas Negeri Jakarta.',
    status: 'upcoming'
  },
  {
    phase: 'SEPTEMBER GALA',
    title: 'Grand Victory Awards',
    date: 'September 24, 2026',
    description: 'Dispensing the Rp 250,000,000+ prize support pool, project scale-up funding, and corporate developer contracts.',
    details: 'Malam penganugerahan piala kejuaraan, penyaluran opsi inkubasi, dan kontrak kemitraan laboratorium nasional.',
    status: 'upcoming'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-01',
    title: 'Under the Hood Electronics Diagnostics',
    category: 'Diagnostics',
    imageUrl: '/src/assets/images/robotics_workbench_1780298686024.png',
    aspectClassName: 'col-span-12 md:col-span-6 lg:col-span-8'
  },
  {
    id: 'g-02',
    title: 'Championship Live Arena Spotlights',
    category: 'Arena Trials',
    imageUrl: '/src/assets/images/robot_arena_1780298668316.png',
    aspectClassName: 'col-span-12 md:col-span-6 lg:col-span-4'
  },
  {
    id: 'g-03',
    title: 'Heavy Sumobot Dynamic Collision Focus',
    category: 'Combat sumo',
    imageUrl: '/src/assets/images/cyber_sumobot_1780299691137.png',
    aspectClassName: 'col-span-12 md:col-span-6 lg:col-span-4'
  },
  {
    id: 'g-04',
    title: 'Aviation Flight-Dynamics Drone Calibrating',
    category: 'Aerospace',
    imageUrl: '/src/assets/images/championship_drone_1780299711288.png',
    aspectClassName: 'col-span-12 md:col-span-6 lg:col-span-8'
  }
];

export const CORE_VISION_MISSION = {
  aboutTitle: 'MORE THAN A COMPETITION.',
  latarBelakang: 'Organized by the Electronics Engineering Education Program, Faculty of Engineering, Universitas Negeri Jakarta, ERIC 2026 (Electronics and Robotics Innovation Competition) serves as the ultimate national stage. Designed as an elite platform for rapid mechanical prototyping, embedded software design, and high-impact micro-automation, ERIC coordinates the brightest minds to dictate Indonesia’s advanced engineering trajectory.',
  latarBelakangID: 'Diselenggarakan oleh Program Studi Pendidikan Teknik Elektronika, Fakultas Teknik, Universitas Negeri Jakarta, ERIC 2026 merupakan panggung nasional tertinggi. Didesain sebagai wadah elit untuk manufaktur mekatronika instan, desain mikrokontroler tertanam, dan otomatisasi mikro, ERIC mengoordinasikan talenta terbaik guna menggerakkan arah kemajuan teknologi nasional Indonesia.',
  tujuan: 'To stimulate industrial hardware breakthroughs, accelerate national artificial intelligence integration on physical nodes, and synthesize a high-octane engineering community matching F1 standards of mechanical discipline.',
  tujuanID: 'Menstimulasi terobosan perangkat keras industri, mempercepat integrasi kecerdasan buatan nasional pada node fisik, dan menyintesis komunitas teknik berkecepatan tinggi yang menyamai disiplin profesional khas arena balap F1.',
  vision: 'To build Indonesia’s ultimate engineering nursery, forging creators who don’t just use technology, but dictate the dynamic architecture of robotics worldwide.',
  visionID: 'Menjadi inkubator utama pembibitan teknik Indonesia, mencetak inovator yang tidak sekadar memanfaatkan teknologi, tetapi mendikte arah arsitektur robotika otonom di kancah dunia.',
  mission: [
    'Unify elite tech-focused universities and industrial developers under a single competitive framework.',
    'Expose contestants to strict telemetry audits, simulating high-pressure development sprints.',
    'Synthesize enterprise bridges ensuring winning architectural designs transition directly to funded startups.'
  ],
  missionID: [
    'Menyatukan universitas teknologi elit dan manufaktur elektronika dalam satu liga kompetisi terpusat.',
    'Menerapkan audit telemetri ketat, melatih ketahanan pengembang dalam tenggat waktu produksi.',
    'Menjembatani karya juara agar langsung bertransisi menjadi startup yang didukung pendanaan inkubasi.'
  ]
};

export const STATISTICS = [
  { value: 'Rp 250M+', label: 'Cash Prize & Incubation' },
  { value: '9 Arenas', label: 'Competition Divisions' },
  { value: '180+ Teams', label: 'Registered Elite Roster' },
  { value: '25+ Partners', label: 'Venture & Tech Networks' }
];

export const SPONSORS = [
  { name: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi', initials: 'KMD' },
  { name: 'Universitas Negeri Jakarta (Host & Organizer)', initials: 'UNJ' },
  { name: 'Indesian Robotics Association', initials: 'IRA' },
  { name: 'TV Edukasi Berita Nasional', initials: 'TVE' },
  { name: 'UNJ TV Media Group', initials: 'UTV' },
  { name: 'Teknologi Mechatronics.ID', initials: 'MID' }
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
      'GALA OPENING CEREMONY & NATION WIDE TEAM PARADE',
      'QUALIFICATION HEATS: SUMOBOT (500G & 3KG)',
      'QUALIFICATION ROUNDS: MINI SOCCERBOT TURF ACCELERATION',
      'PLC INDUSTRIAL LOGIC CHECKS & COBOT WORKSPACE CALIBRATIONS'
    ]
  },
  {
    dayNum: 'DAY 02',
    phaseName: 'VELOCITY & SCIENCE',
    indonesianPhase: 'KECEPATAN & SAINS',
    description: 'Pure high speed trajectory calculations. Line Followers race across complex layered track grids, while Research Challenge contenders present paper blueprints to our panel of judges.',
    indonesianDescription: 'Perhitungan kecepatan lintasan murni. Robot Line Follower berlomba menyusuri sirkuit berlapis, sementara finalis Research Challenge mempertahankan karya ilmiah di hadapan dewan penguji.',
    activities: [
      'LINE FOLLOWER SPEED RACING & TRACK HEATS',
      'RESEARCH CHALLENGE: SCIENTIFIC PRESENTATIONS & DEFENSE',
      'ADVANCED QUALIFICATIONS & ELITE BRACKET ASSEMBLY'
    ]
  },
  {
    dayNum: 'DAY 03',
    phaseName: 'AERIALS & VICTORY',
    indonesianPhase: 'DIRGANTARA & KEMENANGAN',
    description: 'Ecosystems move into the skies with Drone Obstacle flight runs. Inventions pitch in Creative Innovation, leading up to the final combat clashes and the prestigious Award Ceremony.',
    indonesianDescription: 'Ekosistem beralih ke ruang udara dengan uji halang rintang Drone Innovation. Pitching inovasi kreatif disusul babak final terpanas serta malam penganugerahan pemenang utama.',
    activities: [
      'DRONE INNOVATION: AUTONOMOUS AERIAL FLIGHT RUNS',
      'CREATIVE INNOVATION: PRESS SHOWCASE & VC PITCHING',
      'GRAND FINALS CLASHES Across sumobots AND soccerbots',
      'GRAND REVELATION AWARD GALA & TROPHY PRESENTATIONS'
    ]
  }
];
