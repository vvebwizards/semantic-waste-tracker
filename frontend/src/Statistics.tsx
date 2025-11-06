import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import "./pages.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface Stats {
  totalProducers: { value: string };
  agriculturalProducers: { value: string };
  industrialProducers: { value: string };
  commercialProducers: { value: string };
  hospitalProducers: { value: string };
  residentialProducers: { value: string };
  totalWastes: { value: string };
  totalWeight: { value: string };
}

function Statistics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [producerChartType, setProducerChartType] = useState<"bar" | "doughnut">("bar");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/production/producers/statistics/`);
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message);
        return;
      }

      const statsData = data.data?.results?.bindings[0] || null;
      setStats(statsData);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const producerChartData = {
    labels: ['Agricoles', 'Industriels', 'Commerciaux', 'Hospitaliers', 'Résidentiels'],
    datasets: [
      {
        label: 'Nombre de Producteurs',
        data: stats ? [
          parseInt(stats.agriculturalProducers.value),
          parseInt(stats.industrialProducers.value),
          parseInt(stats.commercialProducers.value),
          parseInt(stats.hospitalProducers.value),
          parseInt(stats.residentialProducers.value)
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const performanceChartData = {
    labels: ['Producteurs Totaux', 'Déchets Collectés', 'Poids Total (kg)'],
    datasets: [
      {
        label: 'Métriques du Système',
        data: stats ? [
          parseInt(stats.totalProducers.value),
          parseInt(stats.totalWastes.value),
          parseFloat(stats.totalWeight.value)
        ] : [0, 0, 0],
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1e293b',
          font: {
            size: 12,
            weight: '500' as const
          }
        }
      },
      title: {
        display: true,
        color: '#1e293b',
        font: {
          size: 14,
          weight: '600' as const
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#64748b'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#1e293b',
          font: {
            size: 11,
            weight: '500' as const
          },
          padding: 15
        }
      },
    },
    cutout: '60%',
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#1e293b',
          font: {
            size: 12,
            weight: '500' as const
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#64748b'
        }
      },
      x: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        },
        ticks: {
          color: '#64748b'
        }
      },
    },
  };

  return (
    <div className="page-container">

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Chargement des statistiques...</div>}

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏭</div>
              <div className="stat-value">{stats.totalProducers.value}</div>
              <div className="stat-label">Producteurs Totaux</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🌾</div>
              <div className="stat-value">{stats.agriculturalProducers.value}</div>
              <div className="stat-label">Producteurs Agricoles</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-value">{stats.industrialProducers.value}</div>
              <div className="stat-label">Producteurs Industriels</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-value">{stats.commercialProducers.value}</div>
              <div className="stat-label">Producteurs Commerciaux</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏥</div>
              <div className="stat-value">{stats.hospitalProducers.value}</div>
              <div className="stat-label">Producteurs Hospitaliers</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-value">{stats.residentialProducers.value}</div>
              <div className="stat-label">Producteurs Résidentiels</div>
            </div>

            <div className="stat-card large">
              <div className="stat-icon">🗑️</div>
              <div className="stat-value">{stats.totalWastes.value}</div>
              <div className="stat-label">Déchets Collectés</div>
            </div>

            <div className="stat-card large">
              <div className="stat-icon">⚖️</div>
              <div className="stat-value">{parseFloat(stats.totalWeight.value).toFixed(2)}</div>
              <div className="stat-label">Kg de Déchets Traités</div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-wrapper">
              <div className="chart-header">
                <h3> Répartition des Producteurs</h3>
                <div className="chart-actions">
                  <button 
                    className={`chart-btn ${producerChartType === "bar" ? "active" : ""}`}
                    onClick={() => setProducerChartType("bar")}
                  >
                    Barres
                  </button>
                  <button 
                    className={`chart-btn ${producerChartType === "doughnut" ? "active" : ""}`}
                    onClick={() => setProducerChartType("doughnut")}
                  >
                    Camembert
                  </button>
                </div>
              </div>
              <div className="chart-container">
                {producerChartType === "bar" ? (
                  <Bar data={producerChartData} options={barChartOptions} />
                ) : (
                  <Doughnut data={producerChartData} options={doughnutChartOptions} />
                )}
              </div>
            </div>

            <div className="chart-wrapper">
              <div className="chart-header">
                <h3>📈 Performance du Système</h3>
              </div>
              <div className="chart-container">
                <Line data={performanceChartData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !stats && !error && (
        <div className="empty-state">
          <p>Aucune donnée statistique disponible</p>
        </div>
      )}
    </div>
  );
}

export default Statistics;