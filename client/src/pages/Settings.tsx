import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { useCurrentUser, useUpdateProfile } from "../hooks/useAuth";

const imageStorageKey = "workspace-background-image";
const overlayStorageKey = "workspace-background-overlay";

function notifyAppearanceChanged() {
  window.dispatchEvent(new Event("workspace-appearance-changed"));
}

export default function Settings() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [backgroundImage, setBackgroundImage] = useState(() => window.localStorage.getItem(imageStorageKey) ?? "");
  const [overlay, setOverlay] = useState(() => window.localStorage.getItem(overlayStorageKey) !== "false");
  const [appearanceMessage, setAppearanceMessage] = useState("");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile.mutate({ name: name.trim() });
  }

  function saveAppearance(image: string, nextOverlay = overlay) {
    setBackgroundImage(image);
    setOverlay(nextOverlay);
    if (image) window.localStorage.setItem(imageStorageKey, image);
    else window.localStorage.removeItem(imageStorageKey);
    window.localStorage.setItem(overlayStorageKey, String(nextOverlay));
    notifyAppearanceChanged();
    setAppearanceMessage("Appearance saved.");
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAppearanceMessage("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAppearanceMessage("Please choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") saveAppearance(reader.result);
    };
    reader.onerror = () => setAppearanceMessage("Could not read that image.");
    reader.readAsDataURL(file);
  }

  function resetAppearance() {
    setBackgroundImage("");
    setOverlay(true);
    window.localStorage.removeItem(imageStorageKey);
    window.localStorage.setItem(overlayStorageKey, "true");
    notifyAppearanceChanged();
    setAppearanceMessage("Default appearance restored.");
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
      <AppHeader />
      <section className="surface p-5 sm:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Personalize your profile and workspace.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            X
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-2xl border border-brand-100 bg-brand-50/30 p-5">
            <h2 className="font-bold text-slate-900">Profile details</h2>
            <p className="mt-1 text-sm text-slate-500">Update how your name appears around DevFlow.</p>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Display name
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required className="field mt-1 w-full px-3 py-2.5 text-sm" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Email address
              <input value={user?.email ?? ""} readOnly className="field mt-1 w-full cursor-default bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
            </label>
            {updateProfile.isError && <p role="alert" className="mt-3 text-sm text-rose-600">Could not update your profile.</p>}
            {updateProfile.isSuccess && <p className="mt-3 text-sm text-emerald-600">Profile updated.</p>}
            <button type="submit" disabled={updateProfile.isPending} className="button-primary mt-5 px-4 py-2 text-sm disabled:cursor-not-allowed">
              {updateProfile.isPending ? "Saving…" : "Save profile"}
            </button>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <h2 className="font-bold text-slate-900">Workspace appearance</h2>
            <p className="mt-1 text-sm text-slate-500">Add an image behind your workspace. Click Reset appearance to remove the image.</p>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Background image URL
              <input value={backgroundImage.startsWith("data:") ? "" : backgroundImage} onChange={(event) => saveAppearance(event.target.value)} placeholder="https://example.com/image.jpg" className="field mt-1 w-full px-3 py-2.5 text-sm" />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Or upload an image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-2 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
            </label>
            <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={overlay} onChange={(event) => saveAppearance(backgroundImage, event.target.checked)} className="h-4 w-4 accent-brand-600" />
              Light overlay 
            </label>
            {appearanceMessage && <p className="mt-3 text-sm text-slate-500">{appearanceMessage}</p>}
            <button type="button" onClick={resetAppearance} className="mt-5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
              Reset appearance
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
