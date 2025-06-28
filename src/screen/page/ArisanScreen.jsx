import React, { useEffect, useState } from 'react';
import { getData, postData, putData, deleteData } from '../../api/service';
import ImageInputList from '../../component/ImageInputList';

const ArisanScreen = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMember, setaddMember] = useState(false);
  const [newMember, setNewMember] = useState(0);

  const [editingItem, setEditingItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(null);


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
    const res = await getData('Arisan');
    console.log('Data Arisan:', res);
    if (res?.data) setData(res.data);
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
  };

  const saveData = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      keterangan: form.description,
      banner: form.banner,
      document: form.document,
      location: form.location, // <--- Tambah location ke payload
      targetLot: Number(form.targetLot),
      targetAmount: Number(form.targetAmount),
      // penagihanDate: form.penagihanDate
    };

    try {
      if (editingItem) {
        await putData(`Arisan/${editingItem.id}`, payload);
      } else {
        await postData('Arisan', payload);
      }
      fetchData();
      setIsModalOpen(false);

    } catch (err) {
      alert('Gagal menyimpan data: ' + err);
    }
  };

  const handleDelete = (item) => {
    setConfirmDelete(item);
  };

  const formatPhoneNumber = (number) => {
    const cleaned = number.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('08')) return '+62' + cleaned.slice(1);
    if (cleaned.startsWith('62')) return '+62' + cleaned.slice(2);
    if (cleaned.startsWith('8')) return '+62' + cleaned;
    if (cleaned.startsWith('628')) return '+' + cleaned;
    if (cleaned.startsWith('+628')) return cleaned;
    return '+62' + cleaned;
  };

  const handleAddMember = () => {
    setaddMember(true);
  };
  const addNow = async () => {
    if (!newMember) {
      alert('Nomor ponsel tidak boleh kosong');
      return;
    }
    try {
      await postData(`Arisan/AddNewArisanMemberbyAdmin`, {
        phoneNumber: formatPhoneNumber(newMember),
        idUser: formatPhoneNumber(newMember),
        idArisan: editingItem.id,
        jumlahLot: 1,
        isActive: true,
        isPayed: false
      });
      setaddMember(false);
      setNewMember(0);
      refreshEditingItem(editingItem.id);
    } catch (err) {
      alert('Gagal menambahkan member: ' + err);
    }
  };

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return;
    try {
      await deleteData(`arisan/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  const handleApprove = async (idUser) => {
    try {
      await postData(`Arisan/PayCompleteArisan`, {
        idUser: idUser.idUser,
        idTransaksi: editingItem.id,
        id: idUser.id
      });
      refreshEditingItem(editingItem.id);
    } catch (err) {
      alert('Gagal mengkonfirmasi member: ' + err);
    }
  }

  const handleApproveHapus = async (idUser) => {
    try {
      await postData(`Arisan/DeleteArisanMemberbyAdmin`, {
        idUser: idUser.idUser,
        idArisan: editingItem.id,
        id: idUser.id
      });
      refreshEditingItem(editingItem.id);
    } catch (err) {
      alert('Gagal menghapus member: ' + err);
    }
  }

  const refreshEditingItem = async (id) => {
    const res = await getData('Arisan');
    if (res?.data) {
      setData(res.data);
      const updatedItem = res.data.find((item) => item.id === id);
      if (updatedItem) setEditingItem(updatedItem);
    }
  };

  return (
    <main className="ml-64 mt-16 p-6 bg-gray-50 min-h-screen space-y-6">
      <section className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Data Arisan</h2>
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
              <th className="p-2">Judul</th>
              <th className="p-2">Deskripsi</th>
              <th className="p-2">Penerima Sebelumnya</th> {/* <--- Tambah kolom Lokasi di tabel utama */}
              <th className="p-2">Status</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 ">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.keterangan}</td>
                <td className="p-2">{item.kenaikan || '-'}</td> {/* <--- Tampilkan data location */}
                <td className="p-2">{item.status ? 'Aktif' : 'Tidak Aktif'}</td>
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
                <td colSpan="6" className="p-4 text-center text-gray-500"> {/* <--- Ubah colspan menjadi 6 */}
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
          <div className={`bg-white p-6 rounded  max-w-7xl gap-6 max-h-[90vh] overflow-y-auto ${editingItem ? 'w-[95%] grid grid-cols-2' : 'w-[35%] grid-cols-1'}`}>

            {/* Form Section */}
            <div className="space-y-3 overflow-y-auto pr-2">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit Arisan' : 'Tambah Arisan'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['title', 'Judul'],
                  ['description', 'Deskripsi'],
                ].map(([key, label]) => (
                  <div key={key} className="col-span-1">
                    <label className="text-sm block">{label}</label>
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                ))}

                {/* --- Tambah Input Location di sini --- */}
                <div className="col-span-1">
                  <label className="text-sm block">Penerima Sebelumnya</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                </div>
                {/* --- End Tambah Input Location --- */}

                <div>
                  <label className="text-sm block">Target Member</label>
                  <input
                    type="number"
                    value={form.targetLot}
                    onChange={(e) => setForm({ ...form, targetLot: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div>
                  <label className="text-sm block">Target Bulanan</label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="col-span-2">
                  <ImageInputList
                    label="Banner"
                    values={form.banner || []}
                    onChange={(val) => setForm({ ...form, banner: val })}
                  />
                </div>

                <div className="col-span-2">
                  <ImageInputList
                    label="Document"
                    values={form.document || []}
                    onChange={(val) => setForm({ ...form, document: val })}
                  />
                </div>

                <div className="col-span-2 flex justify-end space-x-2 pt-2">
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

            {/* List Table Section */}
            {editingItem &&
              <div className="overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 items-center mb-4">
                  <h3 className="text-lg font-semibold">Daftar Member</h3>
                  <div className="text-right">
                    <button
                      onClick={() => handleAddMember()}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-32"
                    >
                      Add Member
                    </button>
                  </div>
                </div>

                <table className="w-full border text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="border px-2 py-1 text-left">Nama</th>
                      <th className="border px-2 py-1 text-left">No. HP</th>
                      <th className="border px-2 py-1 text-center">Jumlah Lot</th>
                      <th className="border px-2 py-1 text-center">Status Bulan Ini</th>
                      <th className="border px-2 py-1 text-center">Selesai</th>
                      <th className="border px-2 py-1 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingItem.memberArisan.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.name}</td>
                        <td className="border px-2 py-1">{item.phoneNumber}</td>
                        <td className="border px-2 py-1 text-center">{item.jumlahLot}</td>
                        <td className="border px-2 py-1 text-center">
                          {item.isMonthPayed ? 'Sudah Bayar' : 'Belum Bayar'}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {!item.isPayed &&
                            <button
                              onClick={() => handleApprove(item)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                          }
                          {item.isPayed &&
                            <div>Sudah Terima</div>
                          }
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <button
                              onClick={() => handleApproveHapus(item)}
                              className="bg-white-500 text-white px-2 py-1 rounded hover:bg-white-600"
                            >
                              🗑️
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }

          </div>
        </div>
      )}


      {/* Modal Konfirmasi Hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6 text-gray-700">
              Yakin ingin menghapus <strong>{confirmDelete.title}</strong>?
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
      {addMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-99990">
          <div className="bg-white p-6 rounded w-[90%] max-w-sm ">
            <h3 className="text-lg font-semibold mb-4">Konfirmasi Tambah</h3>
            <div>
              <label className="text-sm block">Nomor Ponsel</label>
              <input
                type="number"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div className="flex justify-center space-x-4 mt-10">
              <button
                onClick={() => setaddMember(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={addNow}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ArisanScreen;