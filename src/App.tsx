import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActivePage } from './components/Sidebar';
import { DemoModeBanner } from './components/DemoModeBanner';
import { TransactionModal } from './components/TransactionModal';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AddTransactionPage } from './pages/AddTransactionPage';
import { UploadDatasetPage } from './pages/UploadDatasetPage';
import { FraudMonitoringPage } from './pages/FraudMonitoringPage';
import { MLAnalyticsPage } from './pages/MLAnalyticsPage';
import { BlockchainVerificationPage } from './pages/BlockchainVerificationPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { StakeholderRole, Transaction } from './types';
import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [currentRole, setCurrentRole] = useState<StakeholderRole>('AUDITOR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const fetchAlertsCount = async () => {
    try {
      const alerts = await api.getAlerts();
      const active = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'UNREAD').length;
      setUnreadAlertsCount(active);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInspectTxById = async (txId: string) => {
    try {
      const tx = await api.getTransaction(txId);
      setSelectedTransaction(tx);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Demo Mode Banner */}
      <DemoModeBanner
        onGoToVerification={() => setActivePage('blockchain-verification')}
        onGoToTransactions={() => setActivePage('transactions')}
      />

      {/* Main Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlerts={() => setActivePage('alerts')}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activePage !== 'transactions') {
            setActivePage('transactions');
          }
        }}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Body: Sidebar + Main View */}
      <div className="flex-1 flex min-h-[calc(100vh-100px)]">
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          unreadAlertsCount={unreadAlertsCount}
        />

        <main className="flex-1 overflow-x-hidden min-w-0">
          {activePage === 'dashboard' && (
            <DashboardPage
              onSelectTransaction={setSelectedTransaction}
              onNavigateAdd={() => setActivePage('add-transaction')}
            />
          )}

          {activePage === 'transactions' && (
            <TransactionsPage
              onSelectTransaction={setSelectedTransaction}
              onNavigateAdd={() => setActivePage('add-transaction')}
              onNavigateUpload={() => setActivePage('upload-dataset')}
            />
          )}

          {activePage === 'add-transaction' && (
            <AddTransactionPage
              onSuccess={(txId) => {
                fetchAlertsCount();
                handleInspectTxById(txId);
              }}
              onNavigateTransactions={() => setActivePage('transactions')}
            />
          )}

          {activePage === 'upload-dataset' && (
            <UploadDatasetPage
              onSuccess={() => {
                fetchAlertsCount();
                setActivePage('transactions');
              }}
            />
          )}

          {activePage === 'fraud-monitoring' && (
            <FraudMonitoringPage
              onSelectTransaction={setSelectedTransaction}
              onNavigateVerification={() => setActivePage('blockchain-verification')}
            />
          )}

          {activePage === 'ml-analytics' && <MLAnalyticsPage />}

          {activePage === 'blockchain-verification' && <BlockchainVerificationPage />}

          {activePage === 'alerts' && (
            <AlertsPage onSelectTxId={handleInspectTxById} />
          )}

          {activePage === 'reports' && <ReportsPage />}

          {activePage === 'settings' && <SettingsPage />}

          {activePage === 'login' && (
            <LoginPage
              currentRole={currentRole}
              onSelectRole={(role) => setCurrentRole(role)}
              onContinue={() => setActivePage('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Transaction Inspection & Audit Modal */}
      {selectedTransaction && (
        <TransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onRefresh={async () => {
            fetchAlertsCount();
            if (selectedTransaction?.transaction_id) {
              await handleInspectTxById(selectedTransaction.transaction_id);
            }
          }}
        />
      )}
    </div>
  );
}
