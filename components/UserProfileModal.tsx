import React, { useState, useRef } from 'react';
import { User } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  initialUser: User | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onSave, initialUser }) => {
  const [name, setName] = useState(initialUser?.name || '');
  const [avatar, setAvatar] = useState<string | null>(initialUser?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name, avatar });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[2000] flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-[fadeIn_0.3s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
        
        <h2 className="text-2xl font-bold text-center text-primary mb-6 font-bungee">
          Hồ Sơ Của Bạn
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-primary/20 cursor-pointer hover:border-primary transition-all relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user text-4xl text-gray-400"></i>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-camera text-white"></i>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <span className="text-sm text-gray-500">Nhấn vào ảnh để thay đổi</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            Lưu Thông Tin
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
