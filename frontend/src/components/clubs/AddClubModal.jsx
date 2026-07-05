import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

const AddClubModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('technical');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#ab83c3');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim() || !type) {
      setError('Club name and type are required');
      return;
    }
    if (!logoFile) {
      setError('A club logo image is required');
      return;
    }
    if (!adminName.trim() || !adminUsername.trim() || !adminEmail.trim() || !adminPassword) {
      setError('All admin account fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('type', type);
    formData.append('description', description);
    formData.append('color', color);
    formData.append('logo', logoFile);
    formData.append('adminName', adminName.trim());
    formData.append('adminUsername', adminUsername.trim());
    formData.append('adminEmail', adminEmail.trim());
    formData.append('adminPassword', adminPassword);

    setLoading(true);
    const result = await onAdd(formData);
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to create club');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-cream-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-cream-dim sticky top-0 bg-cream-card rounded-t-2xl">
          <h3 className="text-xl font-display font-semibold text-ink">Add New Club</h3>
          <button onClick={onClose} className="p-2 hover:bg-cream-dim rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Logo upload */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-dashed border-cream-dim"
              style={{ background: logoPreview ? 'transparent' : `${color}20` }}
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-ink-faint" />
              )}
            </div>
            <label className="flex-1 cursor-pointer">
              <span className="block text-sm font-semibold text-ink-soft mb-1">Club Logo (image) *</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-sm text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-plum-50 file:text-plum-700 file:font-semibold hover:file:bg-plum-100"
              />
            </label>
          </div>

          <input
            type="text"
            placeholder="Club Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300 bg-white"
          >
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
          </select>

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300"
            rows="2"
          />

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-ink-soft">Club Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded-lg border cursor-pointer"
            />
            <span className="text-sm text-ink-muted">{color}</span>
          </div>

          <div className="pt-2 border-t border-cream-dim">
            <p className="text-sm font-semibold text-ink mb-3 mt-3">Admin Account for this Club</p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Admin Full Name *"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300"
              />
              <input
                type="text"
                placeholder="Admin Username *"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300"
              />
              <input
                type="email"
                placeholder="Admin Email (@iiitdwd.ac.in) *"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300"
              />
              <input
                type="password"
                placeholder="Admin Password (min 6 characters) *"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-plum-300"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition"
            style={{ background: '#6B4A63' }}
          >
            {loading ? 'Creating...' : 'Create Club'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClubModal;
