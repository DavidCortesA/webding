import { useEffect } from 'react'
import { ArrowLeft, Heart } from 'lucide-react'

type LegalPageProps = {
  type: 'terms' | 'privacy'
}

const updatedAt = '4 de junio de 2026'

const termsSections = [
  {
    title: '1. Uso de la plataforma',
    text: 'Webding permite crear, personalizar y publicar invitaciones digitales para bodas y eventos. Al usar la plataforma, aceptas proporcionar informacion veraz y utilizar el servicio de forma responsable.',
  },
  {
    title: '2. Cuentas y acceso',
    text: 'Para guardar invitaciones, administrar invitados, dominios o confirmaciones RSVP, necesitas iniciar sesion. Eres responsable de mantener la seguridad de tu cuenta y de cualquier actividad realizada desde ella.',
  },
  {
    title: '3. Contenido del usuario',
    text: 'Conservas los derechos sobre textos, fotos, musica, enlaces, datos de invitados y demas contenido que subas. Nos autorizas a procesarlo solo para operar, mostrar, guardar y mejorar tu invitacion dentro del servicio.',
  },
  {
    title: '4. Invitados y confirmaciones',
    text: 'La informacion de invitados, familias, telefonos, correos y confirmaciones RSVP debe ser cargada con autorizacion correspondiente. Webding funciona como herramienta de gestion, no como responsable del uso final de esos datos por parte del organizador.',
  },
  {
    title: '5. Dominios personalizados',
    text: 'Si conectas un dominio personalizado, eres responsable de tener derechos sobre el dominio y configurar correctamente sus registros DNS. La activacion puede depender de propagacion DNS y proveedores externos.',
  },
  {
    title: '6. Pagos, regalos y enlaces externos',
    text: 'Los enlaces de mesa de regalos, depositos, musica, mapas, WhatsApp u otros servicios externos son responsabilidad del usuario que los configura. Webding no procesa pagos ni garantiza servicios de terceros.',
  },
  {
    title: '7. Disponibilidad',
    text: 'Trabajamos para mantener la plataforma estable y disponible, pero pueden existir interrupciones por mantenimiento, proveedores externos, cambios tecnicos o causas fuera de nuestro control.',
  },
  {
    title: '8. Limitacion de responsabilidad',
    text: 'Webding se ofrece como herramienta SaaS para invitaciones digitales. No seremos responsables por perdidas indirectas, errores de configuracion, datos incorrectos cargados por usuarios o fallas de servicios externos.',
  },
  {
    title: '9. Cambios en los terminos',
    text: 'Podemos actualizar estos terminos para reflejar cambios legales, tecnicos o de producto. Cuando haya cambios relevantes, actualizaremos la fecha de vigencia en esta pagina.',
  },
]

const privacySections = [
  {
    title: '1. Informacion que recopilamos',
    text: 'Podemos recopilar datos de cuenta, nombre, correo, datos del evento, nombres de novios, fecha, ubicacion, fotos, musica, datos de invitados, telefonos, emails, respuestas RSVP y configuraciones de la invitacion.',
  },
  {
    title: '2. Como usamos la informacion',
    text: 'Usamos la informacion para crear y mostrar invitaciones, guardar cambios, administrar invitados, generar links de confirmacion, enviar o facilitar comunicaciones y mejorar la experiencia del producto.',
  },
  {
    title: '3. Datos de invitados',
    text: 'Los datos de invitados pertenecen al usuario organizador del evento. Webding los procesa para mostrar confirmaciones, controlar cupos, exportar reportes y generar enlaces RSVP por familia.',
  },
  {
    title: '4. Imagenes y archivos',
    text: 'Las fotos y recursos cargados pueden almacenarse en servicios cloud conectados a la plataforma para permitir su visualizacion publica en la invitacion y su administracion desde el panel.',
  },
  {
    title: '5. Proveedores externos',
    text: 'Podemos usar proveedores como Supabase, servicios de hosting, almacenamiento, mapas, musica, analitica o comunicacion. Estos servicios procesan datos conforme a sus propias politicas y contratos.',
  },
  {
    title: '6. Comparticion de informacion',
    text: 'No vendemos informacion personal. Compartimos datos solo cuando sea necesario para operar la plataforma, cumplir obligaciones legales, proteger el servicio o ejecutar funciones solicitadas por el usuario.',
  },
  {
    title: '7. Seguridad',
    text: 'Aplicamos medidas razonables para proteger la informacion, incluyendo autenticacion, reglas de acceso y almacenamiento seguro. Ningun sistema digital puede garantizar seguridad absoluta.',
  },
  {
    title: '8. Retencion y eliminacion',
    text: 'Conservamos datos mientras la cuenta o evento esten activos o mientras sea necesario para operar el servicio. Puedes solicitar eliminacion o actualizacion de datos escribiendo a contacto.',
  },
  {
    title: '9. Derechos del usuario',
    text: 'Puedes solicitar acceso, correccion, exportacion o eliminacion de tus datos personales, sujeto a requisitos legales aplicables y verificacion de identidad.',
  },
]

export function LegalPage({ type }: LegalPageProps) {
  const isTerms = type === 'terms'
  const title = isTerms ? 'Terminos de servicio' : 'Politica de privacidad'
  const description = isTerms
    ? 'Reglas de uso, responsabilidades y condiciones para utilizar Webding.'
    : 'Como Webding recopila, usa, protege y administra datos personales.'
  const sections = isTerms ? termsSections : privacySections

  useEffect(() => {
    document.title = `${title} | Webding`
    const meta = document.querySelector('meta[name="description"]')
    meta?.setAttribute('content', description)
  }, [description, title])

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1E1E1E]">
      <header className="border-b border-[#1E1E1E]/10 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a className="inline-flex items-center gap-2 text-lg font-bold" href="#home" aria-label="Volver al inicio">
            <span className="grid size-9 place-items-center rounded-full bg-[#1E1E1E] text-white">
              <Heart size={17} />
            </span>
            Webding
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E]/10 bg-white px-4 py-2 text-sm font-semibold transition hover:border-[#C89B5B] hover:text-[#C89B5B]"
            href="#home"
          >
            <ArrowLeft size={16} />
            Inicio
          </a>
        </div>
      </header>

      <section className="px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#C89B5B]">Legal Webding</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#1E1E1E]/70">{description}</p>
          <p className="mt-4 text-sm font-semibold text-[#1E1E1E]/55">Ultima actualizacion: {updatedAt}</p>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto grid max-w-5xl gap-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[28px] border border-[#1E1E1E]/10 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <p className="mt-3 leading-8 text-[#1E1E1E]/68">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#1E1E1E] px-4 py-12 text-white md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Contacto legal</h2>
            <p className="mt-2 text-white/65">Para dudas sobre estos documentos o tus datos, escribenos.</p>
          </div>
          <a
            className="inline-flex w-fit items-center justify-center rounded-full bg-[#C89B5B] px-6 py-3 text-sm font-bold text-[#1E1E1E] transition hover:bg-white"
            href="mailto:hola@webding.app"
          >
            hola@webding.app
          </a>
        </div>
      </section>
    </main>
  )
}
