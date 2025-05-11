import { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiRefreshCw, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import Layout from '../../components/common/Layout';
import PageHeader from '../../components/common/PageHeader';
import apiService from '../../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingExaminers, setPendingExaminers] = useState([]);
  const [loading, setLoading] = useState({
    users: false,
    pendingExaminers: false
  });
  const [error, setError] = useState({
    users: null,
    pendingExaminers: null
  });

  // Fetch users and pending examiners on component mount
  useEffect(() => {
    fetchUsers();
    fetchPendingExaminers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(prev => ({ ...prev, users: null }));
    
    try {
      const response = await apiService.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(prev => ({ ...prev, users: 'Failed to load users' }));
      toast.error('Failed to load users');
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };
    
  // Fetch pending examiner registrations
  const fetchPendingExaminers = async () => {
    setLoading(prev => ({ ...prev, pendingExaminers: true }));
    setError(prev => ({ ...prev, pendingExaminers: null }));
    
    try {
      const response = await apiService.getPendingExaminers();
      setPendingExaminers(response.data);
    } catch (err) {
      console.error('Error fetching pending examiners:', err);
      setError(prev => ({ ...prev, pendingExaminers: 'Failed to load pending examiners' }));
      toast.error('Failed to load pending examiner registrations');
    } finally {
      setLoading(prev => ({ ...prev, pendingExaminers: false }));
    }
  };

  // Approve an examiner registration
  const handleApproveExaminer = async (examinerId) => {
    try {
      await apiService.approveExaminer(examinerId);
      toast.success('Examiner approved successfully');
      
      // Refresh the list of pending examiners and all users
      fetchPendingExaminers();
      fetchUsers();
    } catch (err) {
      console.error('Error approving examiner:', err);
      toast.error('Failed to approve examiner');
    }
  };

  // Reject an examiner registration
  const handleRejectExaminer = async (examinerId) => {
    try {
      await apiService.rejectExaminer(examinerId);
      toast.success('Examiner registration rejected');
      
      // Refresh the list of pending examiners
      fetchPendingExaminers();
    } catch (err) {
      console.error('Error rejecting examiner:', err);
      toast.error('Failed to reject examiner registration');
    }
  };

  // Activate or deactivate a user
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiService.updateUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage users, examiners, and system settings"
        />
        
        {/* Pending Examiner Approvals Section */}
        <div className="card mb-8">
          <div className="border-b border-neutral-200 dark:border-dark-border-primary p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-neutral-800 dark:text-dark-text-primary flex items-center">
              <FiUserCheck className="mr-2 text-primary-600 dark:text-primary-400" /> 
              Pending Examiner Approvals
            </h2>
            
            <button 
              onClick={fetchPendingExaminers}
              className="btn-secondary flex items-center"
              disabled={loading.pendingExaminers}
            >
              {loading.pendingExaminers ? (
                <div className="inline-block animate-spin h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-transparent rounded-full mr-2"></div>
              ) : (
                <FiRefreshCw className="mr-2" />
              )}
              Refresh
            </button>
          </div>
          
          <div className="p-6">
            {loading.pendingExaminers ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin h-6 w-6 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-neutral-500 dark:text-dark-text-secondary">Loading pending approvals...</p>
              </div>
            ) : error.pendingExaminers ? (
              <div className="text-center py-4 text-error-600 dark:text-error-400 flex flex-col items-center">
                <FiAlertCircle className="h-6 w-6 mb-2" />
                <p>{error.pendingExaminers}</p>
                <button 
                  onClick={fetchPendingExaminers}
                  className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  Try Again
                </button>
              </div>
            ) : pendingExaminers.length === 0 ? (
              <div className="text-center py-4 text-neutral-500 dark:text-dark-text-secondary">
                <p>No pending examiner registrations</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registered At</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingExaminers.map((examiner) => (
                      <tr key={examiner.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary">
                        <td className="px-6 py-4 whitespace-nowrap">{examiner.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{examiner.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(examiner.registeredAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => handleApproveExaminer(examiner.id)}
                            className="btn-success inline-flex items-center px-3 py-1 text-sm"
                          >
                            <FiCheckCircle className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectExaminer(examiner.id)}
                            className="btn-danger inline-flex items-center px-3 py-1 text-sm"
                          >
                            <FiXCircle className="mr-1" /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
              </div>
            </div>
            
        {/* User Management Section */}
        <div className="card">
          <div className="border-b border-neutral-200 dark:border-dark-border-primary p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-neutral-800 dark:text-dark-text-primary flex items-center">
              <FiUsers className="mr-2 text-primary-600 dark:text-primary-400" /> User Management
            </h2>
            
            <button 
              onClick={fetchUsers}
              className="btn-secondary flex items-center"
              disabled={loading.users}
            >
              {loading.users ? (
                <div className="inline-block animate-spin h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-transparent rounded-full mr-2"></div>
              ) : (
                <FiRefreshCw className="mr-2" />
              )}
              Refresh
            </button>
          </div>
          
          <div className="p-6">
            {loading.users ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin h-6 w-6 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                <p className="mt-2 text-neutral-500 dark:text-dark-text-secondary">Loading users...</p>
              </div>
            ) : error.users ? (
              <div className="text-center py-4 text-error-600 dark:text-error-400 flex flex-col items-center">
                <FiAlertCircle className="h-6 w-6 mb-2" />
                <p>{error.users}</p>
                <button 
                  onClick={fetchUsers}
                  className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-neutral-500 dark:text-dark-text-secondary">
                <p>No users found</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-dark-bg-tertiary">
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' :
                            user.role === 'EXAMINER' ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300' :
                            'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.active ? 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300' : 
                            'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-300'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.active)}
                            className={`px-3 py-1 rounded-md text-white transition-colors ${
                              user.active ? 
                              'bg-error-600 hover:bg-error-700 dark:bg-error-700 dark:hover:bg-error-800' : 
                              'bg-success-600 hover:bg-success-700 dark:bg-success-700 dark:hover:bg-success-800'
                            }`}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;