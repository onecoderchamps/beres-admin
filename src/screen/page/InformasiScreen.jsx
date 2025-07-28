// src/pages/InformasiScreen.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getData, putData } from "../../api/service";
import { useNavigate } from "react-router-dom";

// Import necessary chart components
// You'll need to install these: npm install react-chartjs-2 chart.js
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function InformasiScreen() {
  const [allUser, setAllUser] = useState([]);
  const [sedekah, setsedekah] = useState([]);
  const [allKoperasiBulanan, setAllKoperasiBulanan] = useState([]);
  const [allKoperasiTahunan, setAllKoperasiTahunan] = useState([]);

  const [patungan, setpatungan] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getData("user");
      const responseKopBul = await getData("koperasi"); 
      const responseSedekah = await getData("sedekah");
      const responsePatungan = await getData("patungan");

      setAllKoperasiBulanan(responseKopBul.data.filter(
        (koperasi) => koperasi.type === "KoperasiBulanan"
      ));
      setAllKoperasiTahunan(responseKopBul.data.filter(
        (koperasi) => koperasi.type === "KoperasiTahunan"
      ));
      setsedekah(responseSedekah.totalSedekah);
      setpatungan(responsePatungan.data.filter(
        (patungan) => patungan.sisaSlot <= 0
      ));

      if (response && response.data) {
        const filteredUsers = response.data.filter(
          (user) => user.idRole === "1"
        );
        setAllUser(filteredUsers);
      } else {
        setAllUser([]);
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

  // --- Dummy Data for demonstration ---
  // In a real application, you would fetch this data from your API.
  const totalBalance = allUser.reduce((accumulator, currentUser) => {
    return accumulator + currentUser.balance;
  }, 0);
  const totalBalanceKopBul = allKoperasiBulanan.reduce((accumulator, currentKoperasi) => {
    return accumulator + currentKoperasi.nominal;
  }, 0);
  const totalBalanceKopTah = allKoperasiTahunan.reduce((accumulator, currentKoperasi) => {
    return accumulator + currentKoperasi.nominal;
  }, 0);  
  
  const totalPatungan = patungan.reduce((accumulator, currentKoperasi) => {
    return accumulator + ((currentKoperasi.totalSlot - currentKoperasi.sisaSlot) * currentKoperasi.targetPay);
  }, 0);  

  const saldoData = {
    pengguna: totalBalance ? `Rp ${totalBalance.toLocaleString()}` : "Rp 0",
    koperasi: totalBalanceKopBul ? `Rp ${totalBalanceKopBul.toLocaleString()}` : "Rp 0",
    koperasiTahunan: totalBalanceKopTah ? `Rp ${totalBalanceKopTah.toLocaleString()}` : "Rp 0",
    openai: "Rp 2.500.000",
    duitku: "Rp 0",
    sedekah: sedekah ? `Rp ${sedekah.toLocaleString()}` : "Rp 0",
    event: "Rp 0",
    ppob: "Rp 1.500.000",
    lainlain: "Rp 0",
  };

  const summaryData = {
    totalProperty: patungan.length > 0 ? `${patungan.length} Properti` : "0 Properti",
    totalNilaiProperty: totalPatungan ? `Rp ${totalPatungan.toLocaleString()}` : "Rp 0",
    totalKeuntunganPPOB: "Rp 0",
  };

  const chartData = {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        label: "Penggunaan Mingguan",
        data: [640, 540, 650, 740, 1900, 1300, 1230], // Example data
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Penggunaan 1 Minggu",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  // ------------------------------------

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
    <main className="ml-64 mt-16 p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Saldo Information Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Informasi Saldo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo Pengguna</p>
            <p className="text-xl font-semibold text-blue-600 mt-1">
              {saldoData.pengguna}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo Koperasi Bulanan</p>
            <p className="text-xl font-semibold text-green-600 mt-1">
              {saldoData.koperasi}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo Koperasi Tahunan</p>
            <p className="text-xl font-semibold text-green-600 mt-1">
              {saldoData.koperasiTahunan}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo Sedekah</p>
            <p className="text-xl font-semibold text-yellow-600 mt-1">
              {saldoData.sedekah}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo OpenAI</p>
            <p className="text-xl font-semibold text-purple-600 mt-1">
              {saldoData.openai}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo Duitku</p>
            <p className="text-xl font-semibold text-yellow-600 mt-1">
              {saldoData.duitku}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo PPOB</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              {saldoData.ppob}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Saldo Lainnya</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              {saldoData.lainlain}
            </p>
          </div>
        </div>
      </section>

      {/* --- */}
      <hr className="border-gray-300" />
      {/* --- */}

      {/* Summary Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ringkasan Aset & Keuntungan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Property</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {summaryData.totalProperty}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Nilai Property</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {summaryData.totalNilaiProperty}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Keuntungan PPOB</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {summaryData.totalKeuntunganPPOB}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total Keuntungan Event</p>
            <p className="text-xl font-semibold text-gray-800 mt-1">
              {saldoData.event}
            </p>
          </div>
        </div>
      </section>

      {/* --- */}
      <hr className="border-gray-300" />
      {/* --- */}

      {/* Chart Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Grafik Penggunaan
        </h2>
        <div className="w-full">
          <Bar options={chartOptions} data={chartData} />
        </div>
      </section>
    </main>
  );
}

export default InformasiScreen;
