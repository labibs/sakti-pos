import { useState } from 'react';
import { Save } from 'lucide-react';
import { useStoreSettings } from '@/lib/store-settings';
import { LogoUploader } from './LogoUploader';

export function StoreProfileForm() {
  const {
    storeName,
    logoUrl,
    isLoading,
    updateSettings,
    resetSettings,
  } = useStoreSettings();

  const [pendingName, setPendingName] = useState(storeName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!pendingName.trim()) {
      setError('Nama toko tidak boleh kosong');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      updateSettings({ storeName: pendingName.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Gagal menyimpan pengaturan');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      updateSettings({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleLogoClear = () => {
    updateSettings({ logoUrl: null });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-line flex flex-col items-center">
        <LogoUploader
          logoUrl={logoUrl}
          onUpload={handleLogoUpload}
          onClear={handleLogoClear}
        />
        <div className="mt-4 text-center">
          <h2 className="text-lg font-semibold text-sage-900">{pendingName || 'Toko Anda'}</h2>
          <p className="text-xs text-sage-500 uppercase tracking-wider font-medium">
            Store Owner
          </p>
        </div>
      </section>

      <div className="bg-white rounded-2xl shadow-sm border border-line divide-y divide-line overflow-hidden">
        <div className="p-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-sage-700">Nama Toko</span>
            <input
              type="text"
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-sage-50 border border-line rounded-xl text-sage-900 focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-none transition-all"
              placeholder="Masukkan nama toko"
              disabled={isSaving}
            />
          </label>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
              Pengaturan berhasil disimpan
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isSaving
                ? 'bg-sage-400 text-sage-200 cursor-not-allowed'
                : 'bg-sage-700 text-white hover:bg-sage-800 active:scale-95 shadow-sage-700/20'
            }`}
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
