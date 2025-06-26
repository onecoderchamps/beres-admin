import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { deleteData, getData, postData } from '../../api/service';
import { Copy, CheckCircle, XCircle } from 'lucide-react'; // Make sure lucide-react is installed: npm install lucide-react

const GaleriScreen = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true); // New loading state for fetching images
  const [errorFetching, setErrorFetching] = useState(null); // New error state for fetching images

  const [selectedImage, setSelectedImage] = useState(null); // For modal preview
  const [selectedIds, setSelectedIds] = useState([]); // For bulk selection
  const [deletingBulk, setDeletingBulk] = useState(false); // For bulk delete loading

  const fetchImages = useCallback(async () => { // Wrapped in useCallback
    setLoadingImages(true);
    setErrorFetching(null);
    try {
      const res = await getData('file/images');
      if (res?.data) {
        setImages(res.data);
      } else {
        setErrorFetching(res?.Error || 'Gagal memuat gambar.');
      }
    } catch (err) {
      console.error('Error fetching images:', err);
      setErrorFetching('Terjadi kesalahan saat memuat gambar.');
    } finally {
      setLoadingImages(false);
    }
  }, []); // Empty dependency array means this function is memoized once

  useEffect(() => {
    fetchImages();
  }, [fetchImages]); // Depend on fetchImages callback

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) { // Max 5MB
      alert('Ukuran file terlalu besar! Maksimal 5MB.');
      setFile(null);
      e.target.value = null; // Clear input
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Silakan pilih file untuk diunggah.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file); // 'file' should match your backend's expected field name

      const res = await postData('file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.code === 200) { // Assuming your API returns a 'code' for success
        alert('Gambar berhasil diunggah!');
        setFile(null);
        // Reset file input visually
        document.getElementById('file-upload-input').value = '';
        fetchImages(); // Refresh image list
      } else {
        alert('Upload gagal: ' + (res.Error || 'Terjadi kesalahan server.'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload gagal: ' + (error.message || 'Koneksi terputus.'));
    } finally {
      setUploading(false);
    }
  };

  const deleteSingleImage = async (fileId, callback) => {
    try {
      const res = await deleteData(`file/delete/${fileId}`);
      if (res.code === 200) { // Assuming your API returns a 'code' for success
        alert('Gambar berhasil dihapus!');
        if (callback) callback(); // Run callback if provided (e.g., close modal)
        fetchImages(); // Refresh images after deletion
      } else {
        alert(`Gagal menghapus gambar: ${res.Error || 'Terjadi kesalahan.'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Gagal menghapus gambar: ${err.message || 'Koneksi terputus.'}`);
    }
  };

  const deleteSelectedImages = async () => {
    if (selectedIds.length === 0) {
      alert('Tidak ada gambar yang dipilih untuk dihapus.');
      return;
    }
    if (!window.confirm(`Anda yakin ingin menghapus ${selectedIds.length} gambar yang dipilih?`)) {
      return;
    }

    setDeletingBulk(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await deleteData(`file/delete/${id}`);
        if (res.code === 200) {
          successCount++;
        } else {
          console.error(`Failed to delete ${id}:`, res.Error);
          failCount++;
        }
      } catch (err) {
        console.error(`Error deleting ${id}:`, err);
        failCount++;
      }
    }
    alert(`Penghapusan selesai: ${successCount} berhasil, ${failCount} gagal.`);
    setSelectedIds([]); // Clear selection
    await fetchImages(); // Refresh the list
    setDeletingBulk(false);
  };

  const toggleSelect = (fileId) => {
    setSelectedIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === images.length && images.length > 0) { // Only unselect all if all are selected AND there are images
      setSelectedIds([]);
    } else {
      setSelectedIds(images.map((img) => img.fileId));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URL gambar berhasil disalin!');
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      alert('Gagal menyalin URL. Silakan coba secara manual.');
    }
  };

  return (
    <main className="ml-64 mt-20 p-8 bg-gray-100 min-h-screen">
      <section className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900">Galeri Gambar</h2>
          <button
            onClick={deleteSelectedImages}
            disabled={selectedIds.length === 0 || deletingBulk || images.length === 0}
            className={`px-6 py-3 rounded-xl shadow-md transition duration-300 font-semibold flex items-center gap-2
              ${selectedIds.length === 0 || images.length === 0
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'
              }`}
          >
            {deletingBulk ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <XCircle size={20} /> Hapus ({selectedIds.length})
              </>
            )}
          </button>
        </div>

        {/* Upload Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label htmlFor="file-upload-input" className="block text-sm font-medium text-gray-700 flex-shrink-0">
            Pilih Gambar:
          </label>
          <input
            id="file-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-grow border border-gray-300 p-2 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-6 py-2 rounded-lg shadow-md transition duration-300 font-semibold flex items-center gap-2 flex-shrink-0
              ${!file || uploading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengunggah...
              </>
            ) : (
              'Upload Gambar'
            )}
          </button>
        </div>

        {/* Image Grid Section */}
        <div className="mb-6 flex justify-end">
            <button
                onClick={selectAll}
                disabled={images.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-200
                    ${images.length === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
                {selectedIds.length === images.length && images.length > 0 ? 'Batalkan Semua Pilihan' : 'Pilih Semua'}
            </button>
        </div>

        {loadingImages ? (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 text-lg">Memuat gambar...</p>
          </div>
        ) : errorFetching ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorFetching}</span>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">Tidak ada gambar dalam galeri ini. Silakan unggah yang baru!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {images.map((img) => (
              <div
                key={img.fileId}
                className={`relative group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer
                  ${selectedIds.includes(img.fileId) ? 'ring-4 ring-purple-500 ring-offset-2 border-transparent' : 'border border-gray-200'}`}
              >
                {/* Checkbox for selection */}
                <input
                  type="checkbox"
                  checked={selectedIds.includes(img.fileId)}
                  onChange={() => toggleSelect(img.fileId)}
                  className="absolute top-3 left-3 z-20 w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking checkbox
                />
                {selectedIds.includes(img.fileId) && (
                    <CheckCircle className="absolute top-3 right-3 z-20 text-purple-600 bg-white rounded-full p-0.5" size={24} />
                )}

                <div
                  className="w-full h-48 sm:h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img.previewUrl}
                    alt={img.fileName || 'Gambar Galeri'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x200?text=Error'; }}
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-800 truncate">{img.fileName}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {img.fileId.substring(0, 8)}...</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Preview Gambar */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl relative transform scale-95 animate-scale-in">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-3xl leading-none transition-colors duration-200"
              aria-label="Tutup"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">{selectedImage.fileName}</h3>

            <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={selectedImage.previewUrl}
                alt={selectedImage.fileName || 'Preview Gambar'}
                className="max-h-96 object-contain w-full"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image'; }}
              />
            </div>

            <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
              <input
                type="text"
                value={selectedImage.previewUrl}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 font-mono pr-2"
              />
              <button
                onClick={() => copyToClipboard(selectedImage.previewUrl)}
                className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200 p-1 rounded hover:bg-purple-50"
                title="Salin URL"
              >
                <Copy size={20} />
              </button>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => deleteSingleImage(selectedImage.fileId, () => setSelectedImage(null))}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-semibold"
              >
                Hapus Gambar Ini
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Animations - consider moving to a global CSS file */}
      <style jsx>{`
          @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
          }
          .animate-scale-in {
              animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
      `}</style>
    </main>
  );
};

export default GaleriScreen;