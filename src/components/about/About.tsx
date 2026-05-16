import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MessageCircle, 
  ExternalLink,
  BookOpen,
  MapPin,
  GraduationCap,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function About() {
  const teacher = {
    name: 'Abdullah al Fahim',
    bio: 'Experienced private tutor dedicated to empowering students through personalized learning and modern teaching methodologies. Specialized in core science and mathematics with a focus on conceptual clarity.',
    education: 'Student of Zoology Department, Session 2020–2021, Gurudayal Government College',
    location: 'Kishoreganj, Bangladesh',
    experience: '4+ Years of Private Tutoring',
    email: 'abdullahalfahim247@gmail.com',
    whatsapp: '+8801764454377',
    fb: 'https://www.facebook.com/A.A.Fahim.me',
    ig: 'https://www.instagram.com/a.a.fahim.me'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Profile Header */}
      <div className="relative h-64 rounded-[40px] overflow-hidden bg-navy">
         <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold rounded-full blur-[120px]"></div>
         </div>
         <div className="absolute -bottom-16 left-12 flex items-end gap-8">
            <div className="w-48 h-48 rounded-[48px] bg-white p-2 shadow-2xl relative z-10">
               <img 
                 src="https://raw.githubusercontent.com/A-A-Fahim/A.A.Fahim/main/fahim.jpg" 
                 alt="Fahim" 
                 className="w-full h-full rounded-[40px] object-cover"
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = 'https://graph.facebook.com/A.A.Fahim.me/picture?type=large';
                 }}
               />
               <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-navy shadow-lg border-4 border-white">
                  <Award size={24} />
               </div>
            </div>
            <div className="mb-20">
               <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{teacher.name}</h1>
               <div className="flex items-center gap-4 mt-2">
                  <span className="px-3 py-1 bg-gold text-navy rounded-full text-[10px] font-black uppercase tracking-widest">Master Tutor</span>
                  <span className="flex items-center gap-1 text-white/60 text-xs font-bold uppercase tracking-wider">
                    <MapPin size={12} className="text-gold" />
                    {teacher.location}
                  </span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
         {/* Bio & Education */}
         <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
               <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Professional Bio</h3>
               <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{teacher.bio}</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InfoCard 
                 icon={<GraduationCap className="text-gold" />} 
                 title="Education" 
                 content={teacher.education} 
               />
               <InfoCard 
                 icon={<BookOpen className="text-blue-500" />} 
                 title="Specialization" 
                 content="Science, Mathematics & Zoology Specialization for SSC/HSC Levels." 
               />
            </div>
         </div>

         {/* Contact & Socials */}
         <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Connect Directly</h3>
            <div className="space-y-3">
               <SocialLink 
                 icon={<Facebook />} 
                 label="Facebook" 
                 value="@A.A.Fahim.me" 
                 href={teacher.fb}
                 color="bg-blue-600"
               />
               <SocialLink 
                 icon={<Instagram />} 
                 label="Instagram" 
                 value="@a.a.fahim.me" 
                 href={teacher.ig}
                 color="bg-pink-600"
               />
               <SocialLink 
                 icon={<MessageCircle />} 
                 label="WhatsApp" 
                 value={teacher.whatsapp} 
                 href={`https://wa.me/${teacher.whatsapp}`}
                 color="bg-emerald-600"
               />
               <SocialLink 
                 icon={<Mail />} 
                 label="Email" 
                 value="Contact Me" 
                 href={`mailto:${teacher.email}`}
                 color="bg-navy"
               />
            </div>

            <div className="card bg-gold/10 border-gold/20 p-6 rounded-3xl">
               <p className="text-xs font-bold text-navy uppercase tracking-widest mb-2">Office Hours</p>
               <p className="text-sm text-navy/70 leading-relaxed font-semibold">Available for consultations between 4:00 PM - 9:00 PM (Everyday)</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, content }: any) {
  return (
    <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-8 rounded-[32px]">
       <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          {icon}
       </div>
       <h4 className="font-black uppercase tracking-tighter text-navy dark:text-gold mb-2">{title}</h4>
       <p className="text-sm text-slate-500 font-medium leading-relaxed">{content}</p>
    </div>
  );
}

function SocialLink({ icon, label, value, href, color }: any) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl transition-all group active:scale-95"
    >
       <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
             {React.cloneElement(icon, { size: 18 })}
          </div>
          <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
             <p className="text-xs font-bold text-navy dark:text-white">{value}</p>
          </div>
       </div>
       <ExternalLink size={14} className="text-slate-300 group-hover:text-gold transition-colors" />
    </a>
  );
}
