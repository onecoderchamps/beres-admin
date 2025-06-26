import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getData, postData } from '../../api/service';

const UserScreen = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorFetching, setErrorFetching] = useState(null);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState({ key: 'fullName', order: 'asc' });

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
  });

  // --- State untuk Fitur Kirim Saldo ---
  const [isSendBalanceModalOpen, setIsSendBalanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [displayAmount, setDisplayAmount] = useState('');
  const [rawAmount, setRawAmount] = useState(0);
  const [sendingBalance, setSendingBalance] = useState(false);

  // --- State Baru untuk Riwayat Transaksi ---
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorFetchingHistory, setErrorFetchingHistory] = useState(null);

  // Helper function for currency formatting (improved)
  const formatBalance = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format number with dots for display
  const formatNumberWithDots = (num) => {
    if (!num) return '';
    const cleaned = String(num).replace(/[^\d]/g, '');
    if (!cleaned) return '';
    return new Intl.NumberFormat('id-ID').format(Number(cleaned));
  };

  // Helper function to parse number from formatted string (removes dots)
  const parseFormattedNumber = (formattedNum) => {
    if (!formattedNum) return 0;
    const cleaned = String(formattedNum).replace(/\./g, '');
    return parseFloat(cleaned);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorFetching(null);
    try {
      const res = await getData('user');
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else if (res?.data?.id) {
        setData([res.data]);
      } else {
        setData([]);
        if (res?.Error) {
          setErrorFetching(res.Error);
        } else if (res && !res.data) {
          setErrorFetching('No data found or unexpected data format.');
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setErrorFetching('An error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = () => {
    setForm({ fullName: '', phone: '' });
    setIsModalOpen(true);
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

  const saveData = async () => {
    if (!form.fullName || !form.phone) {
      alert('Nama Lengkap dan Telepon tidak boleh kosong.');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        fullName: form.fullName,
        phone: formatPhoneNumber(form.phone),
      };

      const res = await postData('user/AddUser', formData);
      if (res && (res.code === 200 || res.status === 'success')) {
        alert('User berhasil ditambahkan!');
        await fetchData();
        setIsModalOpen(false);
      } else {
        alert('Gagal menambahkan user: ' + (res?.Error || 'Terjadi kesalahan tidak dikenal.'));
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Gagal menyimpan user: ' + (error.message || 'Koneksi terputus.'));
    } finally {
      setSaving(false);
    }
  };

  // --- Handlers untuk Kirim Saldo ---
  const handleOpenSendBalanceModal = (user) => {
    setSelectedUser(user);
    setDisplayAmount('');
    setRawAmount(0);
    setIsSendBalanceModalOpen(true);
  };

  const handleCloseSendBalanceModal = () => {
    setIsSendBalanceModalOpen(false);
    setSelectedUser(null);
    setDisplayAmount('');
    setRawAmount(0);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const rawValue = value.replace(/\D/g, '');
    setRawAmount(parseFloat(rawValue || 0));
    setDisplayAmount(formatNumberWithDots(rawValue));
  };

  const handleSendBalance = async () => {
    if (!selectedUser || rawAmount <= 0) {
      alert('Jumlah saldo harus angka positif.');
      return;
    }

    setSendingBalance(true);
    try {
      const res = await postData('User/Transfer', {
        phone: selectedUser.phone,
        balance: rawAmount,
      });

      if (res && (res.code === 200 || res.status === 'success')) {
        alert(`Berhasil mengirim ${formatBalance(rawAmount)} ke ${selectedUser.fullName}.`);
        await fetchData();
        handleCloseSendBalanceModal();
      } else {
        alert(`Gagal mengirim saldo: ${res?.Error || res?.message || 'Terjadi kesalahan tidak dikenal.'}`);
      }
    } catch (error) {
      console.error('Error sending balance:', error);
      alert('Gagal mengirim saldo: ' + (error.response?.data?.message || error || 'Koneksi terputus.'));
    } finally {
      setSendingBalance(false);
    }
  };

  // --- Handlers untuk Lihat Riwayat ---
  const handleViewHistory = async (user) => {
    setSelectedUser(user); // Simpan user yang dipilih untuk ditampilkan di modal
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    setErrorFetchingHistory(null);
    setHistoryData([]); // Clear previous history data

    try {
      const res = await getData("/Transaksi/user/" + user.phone);
      if (res.code === 200 && Array.isArray(res.data)) {
        setHistoryData(res.data);
      } else {
        setHistoryData([]);
        setErrorFetchingHistory(res?.message || res?.Error || "Tidak ada data riwayat atau format data tidak dikenal.");
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setErrorFetchingHistory('Terjadi kesalahan saat mengambil riwayat transaksi.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedUser(null);
    setHistoryData([]);
    setErrorFetchingHistory(null);
  };

  // --- Helper untuk format tanggal di riwayat ---
  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // 24-hour format
      }).format(date);
    } catch (e) {
      console.error("Invalid date string:", isoString);
      return isoString; // Fallback to raw string if parsing fails
    }
  };

  // New: Filter and Sort data using useMemo for performance
  const filteredAndSortedData = useMemo(() => {
    let currentData = [...data];

    if (searchTerm) {
      currentData = currentData.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    currentData.sort((a, b) => {
      const aValue = a[sortBy.key];
      const bValue = b[sortBy.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortBy.order === 'asc' ? (aValue || 0) - (bValue || 0) : (bValue || 0) - (aValue || 0);
    });

    return currentData;
  }, [data, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    setSortBy(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortBy.key === key) {
      return sortBy.order === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };


  return (
    <main className="ml-64 mt-20 p-8 bg-gray-100 min-h-screen">
      <section className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900">Manajemen Pengguna</h2>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition duration-300 transform hover:scale-105 font-semibold"
          >
            + Tambah Pengguna Baru
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau telepon..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <label htmlFor="sortBy" className="text-gray-700 font-medium text-sm flex-shrink-0">Urutkan berdasarkan:</label>
            <select
              id="sortBy"
              value={sortBy.key}
              onChange={(e) => handleSort(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white"
            >
              <option value="fullName">Nama Lengkap</option>
              <option value="balance">Saldo</option>
              <option value="email">Email</option>
              <option value="phone">Telepon</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 text-lg">Memuat data pengguna...</p>
          </div>
        ) : errorFetching ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorFetching}</span>
          </div>
        ) : filteredAndSortedData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">Tidak ada data pengguna yang ditemukan. {searchTerm && "Coba sesuaikan pencarian Anda."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full leading-normal table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fullName')}>
                    Nama Lengkap {getSortIcon('fullName')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('balance')}>
                    Saldo {getSortIcon('balance')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>
                    Email {getSortIcon('email')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('phone')}>
                    Telepon {getSortIcon('phone')}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alamat</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id || `user-${index}`} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-5 py-4 whitespace-normal text-sm text-gray-900 font-medium">{item.fullName}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatBalance(item.balance)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.email || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{item.phone}</td>
                    <td className="px-5 py-4 whitespace-normal text-sm text-gray-700">{item.address || '-'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm space-x-3">
                       <button
                         onClick={() => handleOpenSendBalanceModal(item)}
                         className="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out"
                       >
                         Kirim Saldo
                       </button>
                       <button
                         onClick={() => handleViewHistory(item)}
                         className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-150 ease-in-out ml-2"
                       >
                         Lihat Riwayat
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg font-semibold transition duration-200
                  ${
                    currentPage === i + 1
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Modal Tambah User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform scale-95 animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Tambah Pengguna Baru</h3>
            <div className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="Contoh: 081234567890"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
                    'Simpan Pengguna'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kirim Saldo */}
      {isSendBalanceModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform scale-95 animate-scale-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Kirim Saldo ke {selectedUser.fullName}</h3>
            <div className="space-y-5">
              <div>
                <label htmlFor="amountToSend" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Saldo</label>
                <input
                  type="text"
                  id="amountToSend"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                  placeholder="Masukkan jumlah saldo"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseSendBalanceModal}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
                  disabled={sendingBalance}
                >
                  Batal
                </button>
                <button
                  onClick={handleSendBalance}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={sendingBalance}
                >
                  {sendingBalance ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Saldo'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal Riwayat Transaksi --- */}
      {isHistoryModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl transform scale-95 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Riwayat Transaksi {selectedUser.fullName}</h3>
            {loadingHistory ? (
              <div className="text-center py-10 flex flex-col items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 text-lg">Memuat riwayat transaksi...</p>
              </div>
            ) : errorFetchingHistory ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {errorFetchingHistory}</span>
              </div>
            ) : historyData.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">Tidak ada riwayat transaksi ditemukan untuk pengguna ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full leading-normal table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipe</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nominal</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Keterangan</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((trans, idx) => (
                      <tr key={trans.id || `trans-${idx}`} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-5 py-3 text-sm text-gray-800">{idx + 1}</td>
                        <td className="px-5 py-3 text-sm text-gray-900">{trans.type}</td>
                        <td className="px-5 py-3 text-sm font-semibold">
                          <span className={`${trans.status === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatBalance(trans.nominal)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">{trans.ket || '-'}</td>
                        <td className="px-5 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trans.status === 'Income' ? 'bg-green-100 text-green-800' :
                            trans.status === 'Outcome' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trans.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">{formatDateTime(trans.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={handleCloseHistoryModal}
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

export default UserScreen;