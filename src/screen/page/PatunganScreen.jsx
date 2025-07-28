import React, { useEffect, useState } from 'react';
import { getData, postData, putData, deleteData } from '../../api/service';
import ImageInputList from '../../component/ImageInputList'; // Pastikan path ini benar

const PatunganScreen = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMember, setAddMember] = useState(false);
  const [newMemberPhoneNumber, setNewMemberPhoneNumber] = useState('');
  const [newMemberLot, setNewMemberLot] = useState(1);

  const [editingItem, setEditingItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  // const [confirmDeleteMember, setConfirmDeleteMember] = useState(null); // Dihapus karena tidak digunakan

  const [form, setForm] = useState({
    title: '',
    description: '',
    keterangan: '',
    banner: [''],
    document: [''],
    location: '', // <--- Tambah field location di state form
    targetLot: 0,
    targetAmount: 0,
    penagihanDate: '',
    isAvailable: true,
  });

  const fetchData = async () => {
    try {
      const res = await getData('Patungan');
      console.log('Data Patungan:', res);
      if (res?.data) setData(res.data);
    } catch (err) {
      console.error('Error fetching Patungan data:', err);
      alert('Gagal mengambil data Patungan.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        description: item.keterangan || '',
        keterangan: item.keterangan || '',
        banner: item.banner || [''],
        document: item.doc || [''],
        location: item.location || '', // <--- Ambil location dari item yang diedit
        targetLot: item.totalSlot ?? 0,
        targetAmount: item.targetPay ?? 0,
        penagihanDate: item.penagihanDate || '',
        isAvailable: item.isAvailable ?? true,
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        description: '',
        keterangan: '',
        banner: [''],
        document: [''],
        location: '', // <--- Inisialisasi location untuk form baru
        targetLot: 0,
        targetAmount: 0,
        penagihanDate: '',
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
    console.log(item.memberPatungan.reduce((total, member) => {
  return total + member.jumlahLot;
}, 0))
  };

  const saveData = async () => {
    if (!form.title || !form.description || form.targetLot <= 0 || form.targetAmount <= 0) {
      alert('Judul, Deskripsi, Target Member, dan Target Bulanan tidak boleh kosong dan harus lebih dari 0.');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      keterangan: form.description,
      banner: form.banner,
      document: form.document,
      location: form.location, // <--- Tambah location ke payload
      targetLot: Number(form.targetLot),
      targetAmount: Number(form.targetAmount),
    };

    try {
      if (editingItem) {
        await putData(`Patungan/${editingItem.id}`, payload);
      } else {
        await postData('Patungan', payload);
      }
      fetchData();
      setIsModalOpen(false);
      alert('Data berhasil disimpan!');
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Gagal menyimpan data: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan tidak dikenal.'));
    }
  };

  const handleDelete = (item) => {
    setConfirmDelete(item);
  };

  const formatPhoneNumber = (number) => {
    const cleaned = String(number).replace(/[^0-9]/g, '');
    if (!cleaned) return '';

    if (cleaned.startsWith('08')) return '+62' + cleaned.slice(1);
    if (cleaned.startsWith('62')) return '+62' + cleaned.slice(2);
    if (cleaned.startsWith('8')) return '+62' + cleaned;
    if (cleaned.startsWith('628')) return '+' + cleaned;
    if (cleaned.startsWith('+628')) return cleaned;
    return '+62' + cleaned;
  };

  const handleAddMemberClick = () => {
    setAddMember(true);
    setNewMemberPhoneNumber('');
    setNewMemberLot(1);
  };

  const addNow = async () => {
    if (!newMemberPhoneNumber) {
      alert('Nomor ponsel tidak boleh kosong');
      return;
    }
    if (newMemberLot <= 0) {
      alert('Jumlah lot harus lebih dari 0');
      return;
    }

    try {
      const formattedPhone = formatPhoneNumber(newMemberPhoneNumber);
      await postData(`Patungan/AddNewPatunganMemberbyAdmin`, {
        phoneNumber: formattedPhone,
        idUser: formattedPhone,
        idPatungan: editingItem.id,
        jumlahLot: newMemberLot,
        isActive: true,
        isPayed: false
      });
      setAddMember(false);
      setNewMemberPhoneNumber('');
      setNewMemberLot(1);
      refreshEditingItem(editingItem.id);
      
      alert('Member berhasil ditambahkan!');
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Gagal menambahkan member: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan tidak dikenal.'));
    }
  };

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return;
    try {
      await deleteData(`Patungan/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchData();
      alert('Data berhasil dihapus!');
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Gagal menghapus data: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan tidak dikenal.'));
    }
  };

  const handleApprove = async (memberItem) => {
    // Display a confirmation dialog
    const isConfirmed = confirm('Apakah Anda yakin ingin refund dana pembayaran member ini?');

    // If the user clicks "No" or cancels, stop the function execution
    if (!isConfirmed) {
      return;
    }

    try {
      await postData(`Patungan/RefundPatunganMemberbyAdmin`, {
        idUser: memberItem.idUser,
        idPatungan: editingItem.id,
        id: memberItem.id
      });
      refreshEditingItem(editingItem.id);
      alert('Status pembayaran member berhasil dikonfirmasi!');
    } catch (err) {
      console.error('Error approving member:', err);
      alert('Gagal mengkonfirmasi pembayaran member: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan tidak dikenal.'));
    }
  }

  const handleApproveHapus = async (memberItem) => {
    try {
      await postData(`Patungan/DeletePatunganMemberbyAdmin`, {
        idUser: memberItem.idUser,
        idPatungan: editingItem.id,
        id: memberItem.id
      });
      refreshEditingItem(editingItem.id);
      alert('Member berhasil dihapus dari patungan!');
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Gagal menghapus member: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan tidak dikenal.'));
    }
  }

  const refreshEditingItem = async (id) => {
    try {
      const res = await getData('Patungan');
      if (res?.data) {
        setData(res.data);
        const updatedItem = res.data.find((item) => item.id === id);
        if (updatedItem) setEditingItem(updatedItem);
      }
    } catch (err) {
      console.error('Error refreshing editing item:', err);
      alert('Gagal memperbarui data item yang sedang diedit.');
    }
  };

  return (
    <main className="ml-64 mt-16 p-6 bg-gray-100 min-h-screen">
      {/* Section Data Patungan */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Data Patungan</h2>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-purple-700 transition duration-300 ease-in-out"
          >
            + Tambah Patungan Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 rounded-tl-lg">No</th>
                <th scope="col" className="px-6 py-3">Judul</th>
                <th scope="col" className="px-6 py-3">Deskripsi</th>
                <th scope="col" className="px-6 py-3">Kenaikan Saham</th> {/* <--- Tambah kolom Lokasi di tabel utama */}
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 rounded-tr-lg text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4">{item.title}</td>
                    <td className="px-6 py-4">{item.keterangan}</td>
                    <td className="px-6 py-4">{item.kenaikan || '-'} %</td> {/* <--- Tampilkan data location */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openModal(item)}
                        className="font-medium text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out mr-3"
                        title="Edit Patungan"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="font-medium text-red-600 hover:text-red-800 transition duration-200 ease-in-out"
                        title="Hapus Patungan"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500"> {/* <--- Ubah colspan menjadi 6 */}
                    Tidak ada data patungan yang tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Tambah/Edit Patungan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white p-8 rounded-xl shadow-2xl max-w-7xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in transition-all duration-300 ease-out
            ${editingItem ? 'w-full grid md:grid-cols-2 gap-8' : 'w-full md:w-1/2 lg:w-1/3 grid-cols-1'}`}>

            {/* Form Section */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {editingItem ? 'Edit Detail Patungan' : 'Tambah Patungan Baru'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Judul & Deskripsi (kolom tunggal jika diperlukan ruang lebih) */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Patungan</label>
                  <input
                    type="text"
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Masukkan judul patungan"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Keterangan</label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Jelaskan detail patungan"
                  ></textarea>
                </div>

                {/* --- Tambah Input Location di sini --- */}
                <div className="md:col-span-2"> {/* Menggunakan col-span-2 agar lebar penuh */}
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Kenaikan Saham</label>
                  <input
                    type="text"
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Masukkan 1% atau 2% atau 3%"
                  />
                </div>
                {/* --- End Tambah Input Location --- */}

                {/* Target Member & Target Bulanan */}
                <div>
                  <label htmlFor="targetLot" className="block text-sm font-medium text-gray-700 mb-1">Target Member (Lot)</label>
                  <input
                    type="number"
                    id="targetLot"
                    value={form.targetLot}
                    onChange={(e) => setForm({ ...form, targetLot: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">Target Bayar Bulanan</label>
                  <input
                    type="number"
                    id="targetAmount"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    min="0"
                  />
                </div>

                {/* Image Input Lists */}
                <div className="md:col-span-2">
                  <ImageInputList
                    label="Banner (URL)"
                    values={form.banner || []}
                    onChange={(val) => setForm({ ...form, banner: val })}
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageInputList
                    label="Dokumen Pendukung (URL)"
                    values={form.document || []}
                    onChange={(val) => setForm({ ...form, document: val })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition duration-200 ease-in-out"
                >
                  Batal
                </button>
                <button
                  onClick={saveData}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-md hover:bg-purple-700 transition duration-200 ease-in-out"
                >
                  {editingItem ? 'Update Patungan' : 'Simpan Patungan'}
                </button>
              </div>
            </div>

            {/* Member List Section (Hanya muncul jika editingItem) */}
            {editingItem && editingItem.memberPatungan && (
              <div className="border-l border-gray-200 pl-8 md:pl-6 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Daftar Member Patungan</h3>
                  <button
                    onClick={handleAddMemberClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-green-700 transition duration-300 ease-in-out"
                  >
                    + Tambah Member
                  </button>
                </div>

                <div className="overflow-x-auto max-h-[calc(90vh-180px)]"> {/* Mengatur tinggi maksimum tabel member */}
                  <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-4 py-2 border-b border-gray-200">Nama</th>
                        <th scope="col" className="px-4 py-2 border-b border-gray-200">No. HP</th>
                        <th scope="col" className="px-4 py-2 border-b border-gray-200 text-center">Lot</th>
                        <th scope="col" className="px-4 py-2 border-b border-gray-200 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingItem.memberPatungan.length > 0 ? (
                        editingItem.memberPatungan.map((item, idx) => (
                          <tr key={item.id || idx} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{item.name || 'N/A'}</td>
                            <td className="px-4 py-3">{item.phoneNumber || 'N/A'}</td>
                            <td className="px-4 py-3 text-center">{item.jumlahLot}</td>
                            <td className="px-4 py-3 text-center flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleApprove(item)}
                                className="text-green-400 hover:text-green-800 text-sm font-bold leading-none"
                                title="Konfirmasi Pembayaran"
                              >
                                Fund
                              </button>
                              <button
                                onClick={() => handleApproveHapus(item)}
                                className="text-red-600 hover:text-red-800 text-xl leading-none"
                                title="Hapus Member"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                            Belum ada member yang terdaftar untuk patungan ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Patungan */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Konfirmasi Hapus Data</h3>
            <p className="text-gray-700 mb-8">
              Apakah Anda yakin ingin menghapus patungan: <br />
              <strong className="text-purple-600">"{confirmDelete.title}"</strong>?
              Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium shadow-md hover:bg-red-700 transition duration-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Member Baru */}
      {addMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform scale-95 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Tambah Member Patungan</h3>
            <div className="space-y-5">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Nomor Ponsel</label>
                <input
                  type="text" // Menggunakan type="text" agar format +62 tidak hilang
                  id="phoneNumber"
                  value={newMemberPhoneNumber}
                  onChange={(e) => setNewMemberPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="jumlahLot" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Lot</label>
                <div className="flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setNewMemberLot(prev => Math.max(1, prev - 1))}
                    className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    title="Kurangi Lot"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                  </button>
                  <input
                    type="number"
                    id="jumlahLot"
                    value={newMemberLot}
                    onChange={(e) => setNewMemberLot(Number(e.target.value))}
                    min="1"
                    className="w-24 text-center border border-gray-300 rounded-lg p-3 text-lg font-semibold focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setNewMemberLot(prev => prev + 1)}
                    className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    title="Tambah Lot"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={() => setAddMember(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
              >
                Batal
              </button>
              <button
                onClick={addNow}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-md hover:bg-purple-700 transition duration-200"
              >
                Simpan Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind CSS Animations (Tambahkan di file CSS global jika perlu, atau tetap di sini) */}
      <style jsx>{`
        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </main>
  );
};

export default PatunganScreen;