// src/pages/AdminOrderTable.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getData, putData } from '../../api/service';
import { useNavigate } from 'react-router-dom';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

function AdminOrderTable() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProofImage, setCurrentProofImage] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [isSubmitting, setIsSubmitting] = useState(null); // State untuk melacak order ID yang sedang diproses

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getData("Order/Admin");
      if (response && response.data) {
        setAllOrders(response.data);
      } else {
        setAllOrders([]);
        setError("Data order tidak ditemukan.");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Gagal memuat data order.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    let filtered = [];
    if (activeTab === 'Semua') {
      filtered = allOrders;
    } else {
      filtered = allOrders.filter(order => order.status === activeTab);
    }

    if (activeTab === 'Semua') {
      return filtered.sort((a, b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [allOrders, activeTab]);

  // Handle Approve/Reject action
  const handleAction = async (orderId, newStatus) => {
    if (isSubmitting === orderId) { // Mencegah double click pada order yang sama
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin ${newStatus === 'Selesai' ? 'menyetujui' : 'menolak'} order ini?`)) {
      return;
    }

    setIsSubmitting(orderId); // Set order ID yang sedang diproses

    try {
      const formData = {
        id: orderId,
        status: newStatus
      };

      const response = await putData("Order/Saldo", formData);

      if (response && response.code === 200) {
        alert(`Order berhasil ${newStatus === 'Selesai' ? 'disetujui' : 'ditolak'}!`);
        fetchOrders(); // Refresh data setelah aksi
      } else {
        alert(`Gagal ${newStatus === 'Selesai' ? 'menyetujui' : 'menolak'} order: ${response.message || 'Terjadi kesalahan.'}`);
      }
    } catch (err) {
      console.error(`Error ${newStatus === 'Selesai' ? 'approving' : 'rejecting'} order:`, err);
      alert(`Terjadi kesalahan saat memproses order. Silakan coba lagi.`);
    } finally {
      setIsSubmitting(null); // Reset state submitting setelah selesai
    }
  };

  const handleViewProof = (imageUrl) => {
    setCurrentProofImage(imageUrl);
    setShowProofModal(true);
  };

  const handleCloseProofModal = () => {
    setShowProofModal(false);
    setCurrentProofImage('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Memuat data order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-lg text-center">{error}</p>
      </div>
    );
  }

  return (
    <main className="ml-64 mt-16 p-6 bg-gray-50 min-h-screen space-y-6">

      {/* Tab Bar */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-2 flex flex-wrap justify-center sm:justify-start gap-2">
        {['Pending', 'Selesai', 'Ditolak', 'Semua'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tab} ({allOrders.filter(order => tab === 'Semua' || order.status === tab).length})
          </button>
        ))}
      </div>
      {/* --- End Tab Bar --- */}

      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Tidak ada order dengan status '{activeTab}'.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Unik
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bukti Transfer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={order.status === 'Pending' ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.idUser}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.uniqueCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                    {order.image ? (
                      <span onClick={() => handleViewProof(order.image)}>Lihat Bukti</span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {order.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(order.id, 'Selesai')}
                          // Menonaktifkan tombol jika sedang memproses order ini
                          disabled={isSubmitting === order.id}
                          className={`mr-3 px-3 py-1 border rounded-md transition-colors
                            ${isSubmitting === order.id
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-900 border-green-600 hover:bg-green-50'
                            }`}
                        >
                          {isSubmitting === order.id ? 'Memproses...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(order.id, 'Ditolak')}
                          // Menonaktifkan tombol jika sedang memproses order ini
                          disabled={isSubmitting === order.id}
                          className={`px-3 py-1 border rounded-md transition-colors
                            ${isSubmitting === order.id
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900 border-red-600 hover:bg-red-50'
                            }`}
                        >
                          {isSubmitting === order.id ? 'Memproses...' : 'Reject'}
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">Telah Diproses</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Proof Image Modal */}
      {showProofModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseProofModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-full max-h-[90vh] overflow-y-auto relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseProofModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold z-10"
              aria-label="Tutup"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Bukti Transfer</h2>
            {currentProofImage ? (
              <img
                src={currentProofImage}
                alt="Bukti Transfer"
                className="max-w-full h-auto max-h-[calc(90vh-10rem)] object-contain rounded-md border border-gray-200 p-2"
              />
            ) : (
              <p className="text-gray-600">Tidak ada gambar bukti transfer.</p>
            )}
            <div className="mt-6 flex justify-end w-full">
              <button
                onClick={handleCloseProofModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminOrderTable;