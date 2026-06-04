import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Heart,
  LayoutTemplate,
  LogOut,
  Monitor,
  PanelLeft,
  PanelRight,
  Plus,
  Save,
  Smartphone,
  Tablet,
  User,
  Users,
} from "lucide-react";
import { defaultSettings, templates } from "../data/catalogs";
import { supabase } from "../lib/supabase";
import { uploadWeddingImage } from "../lib/storage";
import type { WeddingPageRow, WeddingSettings } from "../types";
import { getDnsInstructions, isValidDomain } from "../utils/domain";
import {
  deleteLocalPage,
  normalizeSettings,
  readLocalPages,
  slugify,
  writeLocalPage,
} from "../utils/wedding";
import { EditorFields } from "./EditorFields";
import { GuestListManager } from "./GuestListManager";
import { ProfileDashboard } from "./ProfileDashboard";
import { RsvpControlPanel } from "./RsvpControlPanel";
import { WeddingPreview } from "./WeddingPreview";

type PreviewDevice = "desktop" | "tablet" | "mobile";
type EditorTab = "design" | "guests" | "rsvp";
type EditorSide = "left" | "right";

const previewDevices = [
  { value: "desktop", label: "Desktop", Icon: Monitor },
  { value: "tablet", label: "Tablet", Icon: Tablet },
  { value: "mobile", label: "Mobile", Icon: Smartphone },
] satisfies Array<{
  value: PreviewDevice;
  label: string;
  Icon: typeof Monitor;
}>;

function hydratePage(page: WeddingPageRow): WeddingPageRow {
  return {
    ...page,
    settings: normalizeSettings({
      ...page.settings,
      customDomain: page.custom_domain ?? page.settings.customDomain,
      domainStatus: page.domain_status ?? page.settings.domainStatus,
      dnsInstructions: page.dns_instructions ?? page.settings.dnsInstructions,
    }),
  };
}

export function Dashboard({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
  const [pages, setPages] = useState<WeddingPageRow[]>([]);
  const [settings, setSettings] = useState<WeddingSettings>(defaultSettings);
  const [pageId, setPageId] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saveNote, setSaveNote] = useState("");
  const [view, setView] = useState<"profile" | "editor">("profile");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [editorTab, setEditorTab] = useState<EditorTab>("design");
  const [editorSide, setEditorSide] = useState<EditorSide>("left");
  const [editorPanelWidth, setEditorPanelWidth] = useState(420);

  useEffect(() => {
    async function loadPages() {
      const { data } = await supabase
        .from("wedding_pages")
        .select("*")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      const remotePages =
        data?.map((page) =>
          hydratePage({
            ...page,
            settings: page.settings as WeddingSettings,
          } as WeddingPageRow),
        ) ?? [];
      const localPages = readLocalPages().filter(
        (page) => page.user_id === session.user.id,
      );
      const merged = remotePages.length ? remotePages : localPages;
      setPages(merged);

      if (merged[0]) {
        setPageId(merged[0].id);
        setStatus(merged[0].status);
        setSettings(normalizeSettings(merged[0].settings));
      }
    }

    loadPages();
  }, [session.user.id]);

  function startNew(templateKey = "quincy_romance") {
    const template =
      templates.find((item) => item.key === templateKey) ?? templates[0];
    const next = normalizeSettings({
      ...defaultSettings,
      templateKey: template.key,
      slug: slugify(
        `${defaultSettings.bride}-${defaultSettings.groom}-${Date.now().toString().slice(-4)}`,
      ),
    });
    setPageId("");
    setStatus("draft");
    setSettings(next);
    setSaveNote(`Nuevo template: ${template.name}`);
    setEditorTab("design");
    setView("editor");
  }

  function editPage(page: WeddingPageRow) {
    setPageId(page.id);
    setStatus(page.status);
    setSettings(normalizeSettings(page.settings));
    setSaveNote("");
    setEditorTab("design");
    setView("editor");
  }

  function updateSettings(partial: Partial<WeddingSettings>) {
    setSettings((current) => normalizeSettings({ ...current, ...partial }));
  }

  async function uploadPhoto(index: number, file: File) {
    setSaveNote("Subiendo imagen a Supabase...");
    const publicUrl = await uploadWeddingImage({
      file,
      userId: session.user.id,
      pageKey: pageId || settings.slug || "draft",
      index,
    });
    setSettings((current) => {
      const photos = [...current.photos];
      photos[index] = publicUrl;
      return normalizeSettings({ ...current, photos });
    });
    setSaveNote("Imagen guardada en Supabase Storage.");
  }

  async function savePage(nextStatus = status) {
    const normalized = normalizeSettings(settings);
    setSaveNote("Guardando...");

    if (normalized.customDomain) {
      if (!isValidDomain(normalized.customDomain)) {
        setSettings((current) =>
          normalizeSettings({
            ...current,
            domainStatus: "error",
            domainError: "El dominio no tiene un formato valido.",
          }),
        );
        setSaveNote("Revisa el dominio personalizado antes de guardar.");
        return;
      }

      const localDuplicate = readLocalPages().find(
        (page) =>
          page.settings.customDomain === normalized.customDomain &&
          page.id !== pageId,
      );
      if (localDuplicate) {
        setSettings((current) =>
          normalizeSettings({
            ...current,
            domainStatus: "error",
            domainError: "Este dominio ya esta usado en otra invitacion.",
          }),
        );
        setSaveNote("Ese dominio ya pertenece a otro evento.");
        return;
      }

      const duplicateQuery = await supabase
        .from("wedding_pages")
        .select("id")
        .eq("custom_domain", normalized.customDomain)
        .neq("id", pageId || "00000000-0000-0000-0000-000000000000")
        .maybeSingle();

      if (duplicateQuery.data) {
        setSettings((current) =>
          normalizeSettings({
            ...current,
            domainStatus: "error",
            domainError: "Este dominio ya esta usado en otra invitacion.",
          }),
        );
        setSaveNote("Ese dominio ya pertenece a otro evento.");
        return;
      }
    }

    const dnsInstructions = getDnsInstructions(normalized.customDomain);
    const domainStatus =
      normalized.customDomain &&
      normalized.domainStatus === "verified" &&
      nextStatus === "published"
        ? "active"
        : normalized.domainStatus;
    const settingsWithDomain = normalizeSettings({
      ...normalized,
      dnsInstructions,
      domainStatus: normalized.customDomain ? domainStatus : "pending",
      domainError: normalized.customDomain ? normalized.domainError : "",
    });

    const row = {
      user_id: session.user.id,
      slug: settingsWithDomain.slug,
      title: `${settingsWithDomain.bride} y ${settingsWithDomain.groom}`,
      template_key: settingsWithDomain.templateKey,
      status: nextStatus,
      custom_domain: settingsWithDomain.customDomain || null,
      domain_status: settingsWithDomain.customDomain
        ? settingsWithDomain.domainStatus
        : "pending",
      dns_instructions: dnsInstructions,
      settings: settingsWithDomain,
    };

    const result = pageId
      ? await supabase
          .from("wedding_pages")
          .update(row)
          .eq("id", pageId)
          .select("*")
          .single()
      : await supabase.from("wedding_pages").insert(row).select("*").single();

    if (result.data) {
      const saved = hydratePage({
        ...result.data,
        settings: result.data.settings as WeddingSettings,
      } as WeddingPageRow);
      setPageId(saved.id);
      setStatus(saved.status);
      setSettings(saved.settings);
      setPages((current) => [
        saved,
        ...current.filter((page) => page.id !== saved.id),
      ]);
      setSaveNote("Guardado en Supabase.");
      return;
    }

    const fallback: WeddingPageRow = {
      id: pageId || crypto.randomUUID(),
      user_id: session.user.id,
      slug: normalized.slug,
      title: row.title,
      template_key: row.template_key,
      status: nextStatus,
      custom_domain: settingsWithDomain.customDomain || null,
      domain_status: settingsWithDomain.customDomain
        ? settingsWithDomain.domainStatus
        : "pending",
      dns_instructions: dnsInstructions,
      settings: settingsWithDomain,
    };
    writeLocalPage(fallback);
    setPageId(fallback.id);
    setStatus(nextStatus);
    setPages((current) => [
      fallback,
      ...current.filter((page) => page.id !== fallback.id),
    ]);
    setSaveNote(
      "Guardado localmente. Crea las tablas de Supabase para activar guardado remoto.",
    );
  }

  async function deletePage(page: WeddingPageRow) {
    const confirmed = window.confirm(
      `Quieres borrar la invitacion "${page.title}"? Esta accion no se puede deshacer.`,
    );
    if (!confirmed) return;

    await supabase.from("wedding_pages").delete().eq("id", page.id);
    deleteLocalPage(page.id);
    setPages((current) =>
      current.filter((currentPage) => currentPage.id !== page.id),
    );

    if (pageId === page.id) {
      const nextPage = pages.find((currentPage) => currentPage.id !== page.id);
      setPageId(nextPage?.id ?? "");
      setStatus(nextPage?.status ?? "draft");
      setSettings(normalizeSettings(nextPage?.settings ?? defaultSettings));
      setView("profile");
    }
  }

  console.log("Render Dashboard", { pageId, status, settings, view });
  console.log("sidebar state", { editorTab, editorSide, editorPanelWidth });

  return (
    <main className="workspace">
      <header className="workspace-header">
        <a className="brand" href="#home">
          <Heart size={18} />
          Webding
        </a>
        <div className="workspace-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => setView("profile")}
          >
            <User size={16} />
            Perfil
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => startNew()}
          >
            <Plus size={16} />
            Nueva invitacion
          </button>
          <button className="ghost-button" type="button" onClick={onLogout}>
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>

      {view === "profile" ? (
        <ProfileDashboard
          email={session.user.email ?? "Sin email"}
          pages={pages}
          onCreate={startNew}
          onDelete={deletePage}
          onEdit={editPage}
        />
      ) : (
        <section
          className={`editor-layout editor-tab-${editorTab} editor-side-${editorSide}`}
          style={
            { "--editor-panel-width": `${editorPanelWidth}px` } as CSSProperties
          }
        >
          <aside className="editor-panel">
            <div className="panel-title flex items-center justify-between" aria-label="Titulo del panel del editor">
              <div className="flex items-center gap-2">
                {editorTab === "design" ? (
                  <LayoutTemplate size={18} />
                ) : editorTab === "guests" ? (
                  <Users size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <h1>Editor de boda</h1>
              </div>
              {/* Botones para mover de posicion el panel */}
              <div
                className="panel-position-controls"
                aria-label="Controles de posicion del panel"
              >
                {editorTab === "design" && (
                  <>
                    <button
                      className={editorSide === "left" ? "hidden" : "active"}
                      type="button"
                      onClick={() => setEditorSide("left")}
                    >
                      <PanelLeft size={15} />
                    </button>
                    <button
                      className={editorSide === "right" ? "hidden" : "active"}
                      type="button"
                      onClick={() => setEditorSide("right")}
                    >
                      <PanelRight size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="editor-tabs" aria-label="Pestanas del editor">
              <button
                className={editorTab === "design" ? "active" : ""}
                type="button"
                onClick={() => setEditorTab("design")}
              >
                <LayoutTemplate size={15} />
                Diseño
              </button>
              <button
                className={editorTab === "guests" ? "active" : ""}
                type="button"
                onClick={() => setEditorTab("guests")}
              >
                <Users size={15} />
                Invitados
              </button>
              <button
                className={editorTab === "rsvp" ? "active" : ""}
                type="button"
                onClick={() => setEditorTab("rsvp")}
              >
                <CheckCircle2 size={15} />
                Confirmaciones
              </button>
            </div>

            {editorTab === "design" ? (
              <>
                <div
                  className="editor-layout-controls"
                  aria-label="Configuracion del panel del editor"
                >
                  <label>
                    Tamano del editor
                    <input
                      max={620}
                      min={340}
                      step={20}
                      type="range"
                      value={editorPanelWidth}
                      onChange={(event) =>
                        setEditorPanelWidth(Number(event.target.value))
                      }
                    />
                    <span>{editorPanelWidth}px</span>
                  </label>
                </div>
                <EditorFields
                  settings={settings}
                  onChange={updateSettings}
                  onUploadPhoto={uploadPhoto}
                />
                <div className="save-row">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => savePage("published")}
                  >
                    <Save size={18} />
                    Guardar y publicar
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => savePage("draft")}
                  >
                    Guardar borrador
                  </button>
                </div>
                {saveNote && <p className="form-note">{saveNote}</p>}
              </>
            ) : (
              <div className="editor-admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <span>
                      {editorTab === "guests"
                        ? "Gestion de invitados"
                        : "Control RSVP"}
                    </span>
                    <h2>
                      {editorTab === "guests"
                        ? "Lista de invitados"
                        : "Confirmaciones"}
                    </h2>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => savePage(status)}
                  >
                    <Save size={16} />
                    Guardar evento
                  </button>
                </div>
                {saveNote && <p className="form-note">{saveNote}</p>}
                {editorTab === "guests" ? (
                  <GuestListManager eventId={pageId} settings={settings} />
                ) : (
                  <RsvpControlPanel eventId={pageId} settings={settings} />
                )}
              </div>
            )}
          </aside>

          {editorTab === "design" && (
            <section
              className="preview-area"
              aria-label="Preview de pagina de boda"
            >
              <div className="preview-toolbar">
                <span>Vista previa</span>
                <div
                  className="device-switch"
                  aria-label="Cambiar tamano de preview"
                >
                  {previewDevices.map(({ value, label, Icon }) => (
                    <button
                      className={previewDevice === value ? "active" : ""}
                      key={value}
                      type="button"
                      onClick={() => setPreviewDevice(value)}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`preview-device preview-${previewDevice}`}>
                <WeddingPreview settings={settings} />
              </div>
            </section>
          )}
        </section>
      )}
    </main>
  );
}
