import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Award, Globe, Medal, Ticket, Trophy } from 'lucide-react';

const BENEFITS = [
  {
    id: 'all-japan',
    icon: Trophy,
    titleEn: 'Opportunity to Compete in FSI All Japan Robot Sumo Tournament',
    titleId: 'Berkesempatan Bertanding di FSI All Japan Robot Sumo Tournament',
    descEn: 'Outstanding participants have the opportunity to undergo selection and represent the competition at the FSI All Japan Robot Sumo Tournament, one of the most prestigious sumo robot events in Japan, subject to applicable terms and conditions.',
    descId: 'Peserta berprestasi berkesempatan untuk mengikuti seleksi dan mewakili kompetisi pada FSI All Japan Robot Sumo Tournament, salah satu ajang robot sumo bergengsi di Jepang, sesuai dengan persyaratan dan ketentuan yang berlaku.'
  },
  {
    id: 'golden-ticket',
    icon: Ticket,
    titleEn: 'Chance to Get a Golden Ticket to Universitas Negeri Jakarta',
    titleId: 'Kesempatan Mendapatkan Golden Ticket Universitas Negeri Jakarta',
    descEn: 'Participants have the opportunity to obtain a Golden Ticket to continue their studies at Universitas Negeri Jakarta (UNJ), specifically in the Electronics Engineering Education Program, in accordance with university policies and selection mechanisms.',
    descId: 'Peserta berkesempatan memperoleh Golden Ticket untuk melanjutkan studi di Universitas Negeri Jakarta (UNJ), khususnya pada Program Studi Pendidikan Teknik Elektronika, sesuai dengan kebijakan dan mekanisme seleksi yang ditetapkan oleh universitas.'
  },
  {
    id: 'network',
    icon: Globe,
    titleEn: 'Expand International Relations',
    titleId: 'Memperluas Relasi Internasional',
    descEn: 'Build connections with participants, academics, practitioners, judges, and robotics communities from various countries, opening opportunities for collaboration and international experience.',
    descId: 'Bangun jaringan dengan peserta, akademisi, praktisi, juri, dan komunitas robotika dari berbagai negara, sehingga membuka peluang kolaborasi dan pengalaman di tingkat internasional.'
  },
  {
    id: 'certificate',
    icon: Medal,
    titleEn: 'Official Certificate for All Participants',
    titleId: 'Sertifikat Resmi untuk Seluruh Peserta',
    descEn: 'All participants will receive an official certificate from the organizing committee as a form of appreciation and recognition for participating in the International Electronics & Robotics Innovation Competition (ERIC) 2026.',
    descId: 'Seluruh peserta akan memperoleh sertifikat resmi dari panitia penyelenggara sebagai bentuk apresiasi dan pengakuan atas partisipasi dalam International Electronics & Robotics Innovation Competition (ERIC) 2026.'
  },
  {
    id: 'awards',
    icon: Award,
    titleEn: 'More Than 36 Awards Await',
    titleId: 'Lebih dari 36 Penghargaan Menanti',
    descEn: 'Grab the chance to win more than 36 awards across various competition categories, including grand champions, best innovation, best design, best performance, and other special awards.',
    descId: 'Raih kesempatan memenangkan lebih dari 36 penghargaan dari berbagai kategori kompetisi, termasuk juara utama, penghargaan inovasi terbaik, desain terbaik, performa terbaik, serta penghargaan khusus lainnya.'
  }
];

export default function BenefitsSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-28 bg-[#0D0D0D] border-t border-white/5 overflow-hidden">
      <div className="absolute left-[-10%] bottom-[10%] w-[450px] h-[450px] rounded-full bg-[#FFD700]/5 blur-[120px] pointer-events-none" />
      <div className="absolute right-[-5%] top-[5%] w-[350px] h-[350px] rounded-full bg-[#0047AB]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 select-none">
          <div className="flex items-center gap-3 text-xs font-mono text-[#FFD700] tracking-[0.4em] uppercase mb-4">
            <Award className="w-4 h-4 text-[#FFD700]" />
            <span>{t('WHY PARTICIPATE', 'MENGAPA BERPARTISIPASI')}</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-sans font-black tracking-tighter text-white uppercase leading-none">
            {t('BENEFITS OF', '')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFE44D]">{t('JOINING ERIC 2026', 'BERGABUNG ERIC 2026')}</span>
          </h2>
          <p className="text-[#B3B3B3] font-mono text-sm uppercase max-w-xl mt-4">
            {t('Exclusive opportunities and rewards for every participant.', 'Kesempatan dan penghargaan eksklusif bagi setiap peserta.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative p-6 md:p-8 bg-zinc-950 border border-white/5 hover:border-[#FFD700]/30 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,215,0,0.08)]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none rounded-2xl" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFD700] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-5 group-hover:border-[#FFD700]/30 group-hover:bg-[#FFD700]/5 transition-all duration-300">
                  <Icon className="w-6 h-6 text-[#FFD700]" />
                </div>

                <h3 className="text-base font-sans font-black text-white uppercase tracking-tight mb-3 group-hover:text-[#FFD700] transition-colors duration-300">
                  {t(benefit.titleEn, benefit.titleId)}
                </h3>

                <p className="text-zinc-400 text-xs leading-relaxed font-mono uppercase">
                  {t(benefit.descEn, benefit.descId)}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-[9px] font-mono text-[#C5A059] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                  <span>{t('BENEFIT', 'MANFAAT')} 0{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
