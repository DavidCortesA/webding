import type { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Crown,
  Gift,
  Globe2,
  Image,
  MapPin,
  MessageCircle,
  Music,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

type MarketingProps = {
  session: Session | null;
  onStart: () => void;
  onOpenDashboard: () => void;
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    y: 0,
  },
} satisfies Variants;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
} satisfies Variants;

const benefits = [
  {
    Icon: CheckCircle2,
    title: "RSVP automatico",
    text: "Cada familia confirma desde su propio link privado.",
  },
  {
    Icon: Users,
    title: "Invitados ilimitados",
    text: "Importa familias por Excel y controla cupos por invitacion.",
  },
  {
    Icon: MessageCircle,
    title: "Compartir por WhatsApp",
    text: "Envia enlaces personalizados listos para responder.",
  },
  {
    Icon: Globe2,
    title: "Dominio personalizado",
    text: "Publica tu evento con una URL memorable y elegante.",
  },
  {
    Icon: Clock3,
    title: "Confirmaciones en tiempo real",
    text: "Consulta pendientes, confirmados y rechazados al instante.",
  },
  {
    Icon: Crown,
    title: "Diseno elegante",
    text: "Templates premium inspirados en bodas editoriales.",
  },
];

const steps = [
  "Crear evento",
  "Personalizar diseno",
  "Subir invitados",
  "Compartir enlace",
  "Recibir confirmaciones",
];

const designs = [
  [
    "Clasico",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85",
  ],
  [
    "Moderno",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85",
  ],
  [
    "Floral",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=85",
  ],
  [
    "Minimalista",
    "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=900&q=85",
  ],
  [
    "Luxury Gold",
    "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=900&q=85",
  ],
  [
    "Vintage",
    "https://images.unsplash.com/photo-1494955870715-979ca4f13bf0?auto=format&fit=crop&w=900&q=85",
  ],
];

const premiumFeatures = [
  { Icon: Globe2, title: "Dominio personalizado" },
  { Icon: CheckCircle2, title: "Confirmaciones RSVP" },
  { Icon: Timer, title: "Conteo regresivo" },
  { Icon: MapPin, title: "Mapa del evento" },
  { Icon: Gift, title: "Mesa de regalos" },
  { Icon: Image, title: "Galeria de fotos" },
  { Icon: Music, title: "Musica personalizada" },
  { Icon: Users, title: "Confirmacion por familia" },
];

const stats = [
  ["+1000", "Invitaciones creadas"],
  ["+500", "Eventos celebrados"],
  ["98%", "Confirmaciones recibidas"],
  ["24/7", "Disponible"],
];

const testimonials = [
  [
    "Ana & David",
    "Webding hizo que nuestra invitacion se sintiera como parte de la boda. Elegante, facil y con confirmaciones claras.",
  ],
  [
    "Mariana & Luis",
    "Subimos invitados por Excel y todos confirmaron desde su link. Nos ahorro muchisimos mensajes.",
  ],
  [
    "Sofia & Mateo",
    "El dominio personalizado y la musica hicieron que la invitacion se sintiera premium desde el primer click.",
  ],
];

const faqs = [
  [
    "Necesito conocimientos tecnicos?",
    "No. Webding esta pensado para editar textos, fotos, colores e invitados desde un panel visual.",
  ],
  [
    "Puedo usar mi propio dominio?",
    "Si. Puedes conectar un dominio personalizado y ver su estado de verificacion DNS.",
  ],
  [
    "Como funcionan las confirmaciones?",
    "Cada familia recibe un link unico, confirma asistencia y el panel se actualiza en tiempo real.",
  ],
  [
    "Puedo editar despues de publicar?",
    "Si. Puedes cambiar contenido, invitados, fotos y detalles aun despues de publicar.",
  ],
  [
    "Funciona en celular?",
    "Si. Las invitaciones y el formulario RSVP son responsive y estan optimizados para mobile.",
  ],
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true, margin: "-80px" }}
      whileInView="show"
    >
      <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#C89B5B]">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-4xl font-semibold leading-[0.95] text-[#2E3A59] md:text-6xl">
        {title}
      </h2>
      {text && (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#2E3A59]/65 md:text-lg">
          {text}
        </p>
      )}
    </motion.div>
  );
}

function CtaButtons({ onPrimary }: { onPrimary: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E3A59] px-6 text-sm font-bold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#C89B5B]"
        type="button"
        onClick={onPrimary}
      >
        Crear invitacion
        <ArrowRight size={17} />
      </button>
      <a
        className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#2E3A59]/15 bg-white/80 px-6 text-sm font-bold text-[#2E3A59] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#C89B5B] focus:outline-none focus:ring-2 focus:ring-[#C89B5B]"
        href="#demo"
      >
        Ver demo
      </a>
    </div>
  );
}

export function Marketing({
  session,
  onStart,
  onOpenDashboard,
}: MarketingProps) {
  const primaryAction = session ? onOpenDashboard : onStart;

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF7F2] text-[#2E3A59]">
      <nav
        className="fixed inset-x-0 top-0 z-40 border-b border-white/20 bg-[#FAF7F2]/80 px-4 backdrop-blur-xl md:px-8"
        aria-label="Navegacion principal"
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between">
          <a
            className="inline-flex items-center gap-2 text-xl font-bold"
            href="#home"
            aria-label="Webding inicio"
          >
            <BrandLogo />
          </a>
          <div className="hidden items-center gap-7 text-sm font-semibold text-[#2E3A59]/70 md:flex">
            <a className="hover:text-[#2E3A59]" href="#beneficios">
              Beneficios
            </a>
            <a className="hover:text-[#2E3A59]" href="#templates">
              Templates
            </a>
            <a className="hover:text-[#2E3A59]" href="#faq">
              FAQ
            </a>
          </div>
          <button
            className="rounded-full border border-[#2E3A59]/15 bg-white px-4 py-2 text-sm font-bold transition hover:border-[#C89B5B]"
            type="button"
            onClick={primaryAction}
          >
            {session ? "Mi dashboard" : "Login"}
          </button>
        </div>
      </nav>

      <section
        className="relative grid min-h-screen items-end px-4 pb-10 pt-28 md:px-8 md:pb-16"
        id="home"
      >
        <img
          className="absolute inset-0 size-full object-cover"
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90"
          alt="Pareja en una boda elegante al aire libre"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.62fr)] lg:items-end">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-4xl text-white"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] backdrop-blur"
            >
              <Sparkles size={14} />
              Invitaciones digitales premium
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.9] md:text-7xl lg:text-8xl"
            >
              Tu invitacion de boda, tan especial como tu historia
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-8 text-white/82 md:text-xl"
            >
              Crea invitaciones digitales hermosas, comparte tu evento y recibe
              confirmaciones en tiempo real.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <CtaButtons onPrimary={primaryAction} />
            </motion.div>
          </motion.div>

          <motion.div
            className="hidden rounded-[2rem] border border-white/20 bg-white/12 p-3 shadow-2xl backdrop-blur-xl lg:block"
            initial={{ opacity: 0, scale: 0.94, y: 28 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { delay: 0.25, duration: 0.75 },
              y: 0,
            }}
            id="demo"
          >
            <div className="overflow-hidden rounded-[1.5rem] bg-[#FAF7F2]">
              <img
                className="h-72 w-full object-cover"
                src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=85"
                alt="Mockup de invitacion digital de boda"
              />
              <div className="p-7 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C89B5B]">
                  21 noviembre 2026
                </span>
                <h2 className="mt-3 text-5xl font-semibold leading-none">
                  Ana & David
                </h2>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#2E3A59]/65">
                  RSVP por familia, galeria, mapa, musica y mesa de regalos en
                  una experiencia movil.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2 text-xs font-bold">
                  {["RSVP", "Mapa", "Musica"].map((item) => (
                    <span
                      className="rounded-full bg-white px-3 py-2"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-28" id="beneficios">
        <SectionHeading
          eyebrow="Beneficios"
          title="Todo lo que una boda moderna necesita, en un solo enlace."
        />
        <motion.div
          className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          variants={stagger}
          viewport={{ once: true }}
          whileInView="show"
        >
          {benefits.map(({ Icon, title, text }) => (
            <motion.article
              className="rounded-3xl border border-[#2E3A59]/8 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              key={title}
              variants={fadeUp}
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-[#FAF7F2] text-[#C89B5B]">
                <Icon size={22} />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-[#2E3A59]/62">{text}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow="Como funciona"
          title="De una idea preciosa a una invitacion publicada."
        />
        <div className="mx-auto mt-14 grid max-w-6xl gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <motion.article
              className="relative rounded-3xl border border-[#2E3A59]/8 bg-[#FAF7F2] p-6"
              initial="hidden"
              key={step}
              variants={fadeUp}
              viewport={{ once: true }}
              whileInView="show"
            >
              <span className="text-sm font-bold text-[#C89B5B]">
                0{index + 1}
              </span>
              <h3 className="mt-8 text-lg font-semibold">{step}</h3>
              <div className="mt-6 h-1 rounded-full bg-[#C89B5B]" />
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-28" id="templates">
        <SectionHeading
          eyebrow="Galeria de disenos"
          title="Templates con presencia editorial para cada tipo de celebracion."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map(([name, src]) => (
            <motion.article
              className="group overflow-hidden rounded-3xl bg-white shadow-sm"
              initial="hidden"
              key={name}
              variants={fadeUp}
              viewport={{ once: true }}
              whileInView="show"
            >
              <img
                className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
                src={src}
                alt={`Template ${name} para boda`}
              />
              <div className="flex items-center justify-between p-5">
                <h3 className="text-xl font-semibold">{name}</h3>
                <span className="rounded-full bg-[#FAF7F2] px-3 py-1 text-xs font-bold text-[#C89B5B]">
                  Preview
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-[#2E3A59] px-4 py-20 text-white md:px-8 md:py-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          variants={fadeUp}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="show"
        >
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#C89B5B]">
            Premium
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-none md:text-6xl">
            Funciones para administrar una boda sin caos.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/82 md:text-lg">
            Invitados, dominios, RSVP, musica, mapas y regalos con una
            experiencia clara para novios e invitados.
          </p>
        </motion.div>
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {premiumFeatures.map(({ Icon, title }) => (
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur"
              initial="hidden"
              key={title}
              variants={fadeUp}
              viewport={{ once: true }}
              whileInView="show"
            >
              <Icon className="text-[#C89B5B]" size={24} />
              <h3 className="mt-8 text-lg font-semibold">{title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <motion.article
              className="rounded-3xl bg-[#FAF7F2] p-8 text-center"
              initial={{ opacity: 0, y: 18 }}
              key={label}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <strong className="text-5xl font-semibold text-[#C89B5B]">
                {value}
              </strong>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#2E3A59]/58">
                {label}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow="Testimonios"
          title="Historias reales, confirmaciones simples."
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
          {testimonials.map(([name, quote]) => (
            <motion.figure
              className="rounded-3xl bg-white p-7 shadow-sm"
              initial="hidden"
              key={name}
              variants={fadeUp}
              viewport={{ once: true }}
              whileInView="show"
            >
              <ShieldCheck className="text-[#C89B5B]" size={22} />
              <blockquote className="mt-6 leading-7 text-[#2E3A59]/70">
                "{quote}"
              </blockquote>
              <figcaption className="mt-6 font-semibold">{name}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28" id="faq">
        <SectionHeading
          eyebrow="FAQ"
          title="Preguntas frecuentes antes de publicar."
        />
        <div className="mx-auto mt-12 grid max-w-3xl gap-3">
          {faqs.map(([question, answer]) => (
            <details
              className="group rounded-2xl border border-[#2E3A59]/10 bg-[#FAF7F2] p-5"
              key={question}
            >
              <summary className="cursor-pointer list-none font-semibold outline-none focus:ring-2 focus:ring-[#C89B5B]">
                {question}
              </summary>
              <p className="mt-4 leading-7 text-[#2E3A59]/65">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 md:px-8 md:py-28">
        <motion.div
          className="mx-auto max-w-5xl rounded-[2rem] bg-[#2E3A59] p-8 text-center text-white md:p-16"
          initial="hidden"
          variants={fadeUp}
          viewport={{ once: true }}
          whileInView="show"
        >
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#C89B5B]">
            Empieza hoy
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-none md:text-6xl">
            Comienza a crear la invitacion de tus suenos
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#2E3A59]"
              type="button"
              onClick={primaryAction}
            >
              Crear mi invitacion
            </button>
            <a
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white"
              href="#templates"
            >
              Ver ejemplos
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-[#2E3A59]/10 bg-white px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <a
            className="brand"
            href="#home"
          >
            <BrandLogo />
          </a>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-[#2E3A59]/65">
            <a href="#terms">Terminos</a>
            <a href="#privacy">Privacidad</a>
            <a href="mailto:hola@webding.app">Contacto</a>
          </div>
          <div className="flex gap-3">
            <a
              aria-label="Instagram"
              className="grid size-10 place-items-center rounded-full bg-[#FAF7F2]"
              href="#instagram"
            >
              <Image size={17} />
            </a>
            <a
              aria-label="Facebook"
              className="grid size-10 place-items-center rounded-full bg-[#FAF7F2]"
              href="#facebook"
            >
              <Globe2 size={17} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
