import React, { useEffect, useState, useCallback } from 'react';
import { getData, postData, putData, deleteData } from '../../api/service';
import ImageInputSingle from '../../component/ImageInputListSingle';

// Helper function for currency formatting
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Helper function for date formatting
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return 'Invalid Date';
    }
};

const EventScreen = () => {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [eventParticipants, setEventParticipants] = useState([]); // State baru untuk daftar pendaftar
    const [loadingParticipants, setLoadingParticipants] = useState(false); // Loading state untuk pendaftar
    const [participantsError, setParticipantsError] = useState(null); // Error state untuk pendaftar

    const [form, setForm] = useState({
        name: '',
        image: '',
        dueDate: '',
        price: '',
        desc: '',
        location: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getData('event');
            if (res?.data) {
                setData(res.data);
            } else {
                setError(res?.Error || 'Failed to fetch events.');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('An error occurred while fetching events.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to fetch participants for a specific event
    const fetchParticipants = useCallback(async (eventId) => {
        setLoadingParticipants(true);
        setParticipantsError(null);
        try {
            const res = await getData(`Event/List/${eventId}`);
            if (res?.data) {
                setEventParticipants(res.data);
            } else {
                setParticipantsError(res?.Error || 'Failed to fetch participants.');
                setEventParticipants([]); // Clear previous participants on error
            }
        } catch (err) {
            console.error('Error fetching participants:', err);
            setParticipantsError('An error occurred while fetching participants.');
            setEventParticipants([]);
        } finally {
            setLoadingParticipants(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setForm({
                name: item.name || '',
                image: item.image || '',
                dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
                price: item.price !== undefined ? item.price : '',
                desc: item.desc || '',
                location: item.location || '',
            });
            // Fetch participants only if editing an existing item
            fetchParticipants(item.id);
        } else {
            setEditingItem(null);
            setForm({
                name: '',
                image: '',
                dueDate: '',
                price: '',
                desc: '',
                location: '',
            });
            setEventParticipants([]); // Clear participants when adding a new event
        }
        setIsModalOpen(true);
    };

    const saveData = async () => {
        if (!form.name || !form.dueDate || !form.price || !form.desc || !form.location) {
            alert('Semua kolom harus diisi!');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                image: form.image || '',
                dueDate: form.dueDate,
                price: Number(form.price),
                desc: form.desc,
                location: form.location,
            };

            if (editingItem) {
                await putData(`event/${editingItem.id}`, payload);
                alert('Data event berhasil diperbarui!');
            } else {
                await postData('event', payload);
                alert('Data event berhasil ditambahkan!');
            }
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving data:', err);
            alert('Gagal menyimpan data: ' + (err.message || 'Terjadi kesalahan tidak dikenal.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (item) => {
        setConfirmDelete(item);
    };

    const confirmDeleteItem = async () => {
        if (!confirmDelete) return;
        setSaving(true);
        try {
            await deleteData(`event/${confirmDelete.id}`);
            alert('Data event berhasil dihapus!');
            setConfirmDelete(null);
            fetchData();
        } catch (err) {
            console.error('Error deleting data:', err);
            alert('Gagal menghapus data: ' + (err.message || 'Terjadi kesalahan tidak dikenal.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="ml-64 mt-20 p-8 bg-gray-100 min-h-screen">
            <section className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
                    <h2 className="text-3xl font-extrabold text-gray-900">Manajemen Event</h2>
                    <button
                        onClick={() => openModal()}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition duration-300 transform hover:scale-105 font-semibold"
                    >
                        + Tambah Event Baru
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 flex flex-col items-center justify-center">
                        <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 text-lg">Memuat data event...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">Belum ada data event. Silakan tambahkan yang baru!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal table-auto">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Event</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gambar</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800">{index + 1}</td>
                                        <td className="px-5 py-4 whitespace-normal text-sm text-gray-900 font-medium">{item.name}</td>
                                        <td className="px-5 py-4">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(item.dueDate)}</td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatCurrency(item.price)}</td>
                                        <td className="px-5 py-4 whitespace-normal text-sm text-gray-700">{item.location}</td>
                                        <td className="px-5 py-4 whitespace-nowrap text-sm space-x-3">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-red-600 hover:text-red-800 font-medium transition duration-150 ease-in-out"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
                    <div className={`bg-white p-8 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in
                        ${editingItem ? 'max-w-4xl grid md:grid-cols-2 gap-8' : 'max-w-lg grid-cols-1'}`}>

                        {/* Form Section */}
                        <div className="space-y-5">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                                {editingItem ? 'Edit Event' : 'Tambah Event Baru'}
                            </h3>
                            <div>
                                <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1">Nama Event</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Nama Event"
                                />
                            </div>

                            <ImageInputSingle
                                label="Gambar Event"
                                value={form.image}
                                onChange={(val) => setForm({ ...form, image: val })}
                            />

                            <div>
                                <label htmlFor="dueDate" className="text-sm font-medium text-gray-700 block mb-1">Tanggal Event</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    value={form.dueDate}
                                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="text-sm font-medium text-gray-700 block mb-1">Harga Tiket</label>
                                <input
                                    type="number"
                                    id="price"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Contoh: 150000"
                                />
                            </div>

                            <div>
                                <label htmlFor="desc" className="text-sm font-medium text-gray-700 block mb-1">Deskripsi Event</label>
                                <textarea
                                    id="desc"
                                    value={form.desc}
                                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 min-h-[100px]"
                                    placeholder="Tulis deskripsi lengkap event di sini..."
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="location" className="text-sm font-medium text-gray-700 block mb-1">Lokasi Event</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                    placeholder="Lokasi event, contoh: Jakarta Convention Center"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={saveData}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan Data'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* List Pendaftar Section (Hanya tampil saat mode edit) */}
                        {editingItem && (
                            <div className="md:border-l md:pl-8 md:ml-8 pt-8 md:pt-0 border-gray-200">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Daftar Pendaftar</h3>
                                {loadingParticipants ? (
                                    <div className="text-center py-10 flex flex-col items-center justify-center">
                                        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-gray-600">Memuat pendaftar...</p>
                                    </div>
                                ) : participantsError ? (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                                        <strong className="font-bold">Error!</strong>
                                        <span className="block sm:inline"> {participantsError}</span>
                                    </div>
                                ) : eventParticipants.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>Belum ada pendaftar untuk event ini.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-y-auto max-h-[calc(90vh-180px)] border rounded-lg shadow-sm">
                                        <table className="min-w-full text-sm text-left text-gray-600">
                                            <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold text-gray-700 uppercase">No</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-700 uppercase">Nama Lengkap</th>
                                                    <th className="px-4 py-2 font-semibold text-gray-700 uppercase">No. Telepon</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eventParticipants.map((participant, pIdx) => (
                                                    <tr key={participant.id} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap">{pIdx + 1}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{participant.fullName}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">{participant.phone}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center transform scale-95 animate-scale-in">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Konfirmasi Hapus</h3>
                        <p className="mb-8 text-gray-700 text-lg">
                            Anda yakin ingin menghapus event **"{confirmDelete.name}"**? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDeleteItem}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menghapus...
                                    </>
                                ) : (
                                    'Hapus Sekarang'
                                )}
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

export default EventScreen;