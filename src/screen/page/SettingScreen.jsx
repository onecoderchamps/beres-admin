import React, { useEffect, useState } from 'react';
import { getData, postData, putData, deleteData } from '../../api/service';

const SettingScreen = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    key: '',
    value: '',
  });

  const fetchData = async () => {
    const res = await getData('setting');
    if (res?.data) setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        key: item.key || '',
        value: item.value || '',
      });
    } else {
      setEditingItem(null);
      setForm({
        key: '',
        value: '',
      });
    }
    setIsModalOpen(true);
  };

  const saveData = async () => {
    const payload = { ...form };

    try {
      if (editingItem) {
        await putData(`setting/${editingItem.id}`, payload);
      } else {
        await postData('setting', payload);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan data: ' + err.message);
    }
  };

  const handleDelete = (item) => {
    setConfirmDelete(item);
  };

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return;
    try {
      await deleteData(`setting/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  return (
    <main className="ml-64 mt-16 p-6 bg-gray-50 min-h-screen space-y-6">
      <section className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Data Setting</h2>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            + Tambah
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">No</th>
              <th className="p-2">Key</th>
              <th className="p-2">Value</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.key}</td>
                <td className="p-2">{item.value}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => openModal(item)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Setting' : 'Tambah Setting'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm block">Key</label>
                <input
                  type="text"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-sm block">Value</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={saveData}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6 text-gray-700">
              Yakin ingin menghapus setting <strong>{confirmDelete.key}</strong>?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SettingScreen;
