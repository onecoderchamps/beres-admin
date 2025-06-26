import { useState } from "react";
import { getData } from "../api/service";

const ImageInputList = ({ label, values, onChange }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const openGallery = async (index) => {
    const res = await getData('file/images');
    if (res?.data) {
      setGalleryImages(res.data);
      setSelectedIndex(index);
      setGalleryOpen(true);
    }
  };

  const handleSelectImage = (url) => {
    const updated = [...values];
    updated[selectedIndex] = url;
    onChange(updated);
    setGalleryOpen(false);
  };

  const addInput = () => onChange([...values, ""]);

  const updateInput = (index, val) => {
    const updated = [...values];
    updated[index] = val;
    onChange(updated);
  };

  const removeInput = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated.length === 0 ? [""] : updated); // minimal satu input kosong
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {values.map((val, idx) => (
        <div key={idx} className="flex items-center space-x-2 mb-2">
          <input
            value={val}
            onChange={(e) => updateInput(idx, e.target.value)}
            placeholder="Image URL"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => openGallery(idx)}
            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
            title="Pilih dari galeri"
          >
            📷
          </button>
          <button
            type="button"
            onClick={() => removeInput(idx)}
            className="bg-red-200 px-2 py-1 rounded hover:bg-red-300"
            title="Hapus"
          >
            🗑
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addInput}
        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
      >
        ➕ Tambah Gambar
      </button>

      {galleryOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-3xl max-h-[80vh] overflow-y-auto grid grid-cols-3 gap-4">
            {galleryImages.map((img) => (
              <img
                key={img.fileId}
                src={img.previewUrl}
                alt=""
                className="cursor-pointer rounded w-full h-32 object-cover hover:opacity-80"
                onClick={() => handleSelectImage(img.previewUrl)}
              />
            ))}
            <button
              className="col-span-3 mt-2 text-center text-red-600"
              onClick={() => setGalleryOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageInputList;