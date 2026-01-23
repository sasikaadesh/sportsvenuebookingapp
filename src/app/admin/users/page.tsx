'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  User
} from 'lucide-react'
import { HeaderApp } from '@/components/layout/HeaderApp'
import { FooterSimple } from '@/components/layout/FooterSimple'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'makeAdmin' | 'makeUser' | 'delete'
    userId: string
    userName: string
  }>({
    isOpen: false,
    type: 'delete',
    userId: '',
    userName: ''
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return

    // If no user, redirect to home
    if (!user) {
      console.log('Admin users: No user found, redirecting to home')
      router.push('/')
      return
    }

    // If profile is still loading (null), wait
    if (profile === null) {
      console.log('Admin users: Profile still loading, waiting...')
      return
    }

    // If profile exists but no admin role, redirect
    if (profile && profile.role !== 'admin') {
      console.log('Admin users: User is not admin, role:', profile.role, 'redirecting to home')
      router.push('/')
      return
    }

    // If we get here, user should be admin
    console.log('Admin users: Loading users for admin user')
    loadUsers()
  }, [user, profile, loading, router])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      console.log('Loading users from database...')

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        toast.error('Failed to load users')
        return
      }

      console.log('Loaded users:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('Exception loading users:', error)
      toast.error('An error occurred while loading users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const userToUpdate = users.find(u => u.id === userId)
    const userName = userToUpdate?.full_name || userToUpdate?.email || 'this user'
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    setConfirmDialog({
      isOpen: true,
      type: newRole === 'admin' ? 'makeAdmin' : 'makeUser',
      userId,
      userName
    })
  }

  const confirmToggleRole = async () => {
    setActionLoading(true)
    try {
      const userToUpdate = users.find(u => u.id === confirmDialog.userId)
      const currentRole = userToUpdate?.role
      const newRole = currentRole === 'admin' ? 'user' : 'admin'

      const { error } = await (supabase as any)
        .from('users')
        .update({ role: newRole })
        .eq('id', confirmDialog.userId)

      if (error) {
        console.error('Error updating user role:', error)
        toast.error('Failed to update user role')
        return
      }

      setUsers(users.map(user =>
        user.id === confirmDialog.userId
          ? { ...user, role: newRole }
          : user
      ))
      toast.success(`User role updated to ${newRole}`)
      setConfirmDialog({ isOpen: false, type: 'delete', userId: '', userName: '' })
    } catch (error) {
      console.error('Exception updating user role:', error)
      toast.error('An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    // Debug logging - Step 1
    console.log('Delete user called with ID:', userId)
    console.log('All users in state:', users.map(u => ({ id: u.id, email: u.email, full_name: u.full_name })))

    const userToDelete = users.find(u => u.id === userId)
    console.log('User to delete:', userToDelete)

    const userName = userToDelete?.full_name || userToDelete?.email || 'this user'

    if (!user?.id) {
      toast.error('You must be logged in to delete users')
      return
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      toast.error('You cannot delete your own account')
      return
    }

    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      userId,
      userName
    })
  }

  const confirmDeleteUser = async () => {
    setActionLoading(true)
    const loadingToast = toast.loading('Deleting user...')

    try {
      console.log('Attempting to delete user:', { userId: confirmDialog.userId, adminUserId: user?.id })

      // Call our API route to properly delete the user from both auth.users and users tables
      const response = await fetch('/api/admin/delete-user-direct', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: confirmDialog.userId,
          adminUserId: user?.id
        }),
      })

      const result = await response.json()
      console.log('Delete response:', result)

      if (!response.ok) {
        console.error('Error deleting user:', result.error)
        toast.error(result.error || 'Failed to delete user', { id: loadingToast })
        return
      }

      // Success - show toast
      toast.success(`User ${confirmDialog.userName} deleted successfully`, { id: loadingToast })

      // Close dialog
      setConfirmDialog({ isOpen: false, type: 'delete', userId: '', userName: '' })

      // Wait a moment for database operations to fully complete
      await new Promise(resolve => setTimeout(resolve, 800))

      // Reload users list from database to ensure consistency
      await loadUsers()

    } catch (error) {
      console.error('Exception deleting user:', error)
      toast.error('An error occurred while deleting user', { id: loadingToast })
    } finally {
      setActionLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show loading while auth is loading or profile is null
  if (loading || loadingUsers || !user || profile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : loadingUsers ? 'Loading users...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    )
  }

  // If profile exists but user is not admin, don't render anything (redirect will happen in useEffect)
  if (profile && profile.role !== 'admin') {
    return null
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <HeaderApp />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage user accounts and permissions</p>
              </div>
            </div>
          </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-200"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No users found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.full_name || user.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        }`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role || 'user'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role || 'user')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={`Make ${user.role === 'admin' ? 'User' : 'Admin'}`}
                          >
                            {user.role === 'admin' ? (
                              <UserX className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
        </main>

        <FooterSimple />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, type: 'delete', userId: '', userName: '' })}
          onConfirm={confirmDialog.type === 'delete' ? confirmDeleteUser : confirmToggleRole}
          title={
            confirmDialog.type === 'delete'
              ? 'Delete User'
              : confirmDialog.type === 'makeAdmin'
              ? 'Make Admin'
              : 'Remove Admin'
          }
          message={
            confirmDialog.type === 'delete'
              ? `Are you sure you want to delete ${confirmDialog.userName}? This action cannot be undone and will permanently remove the user from the system.`
              : confirmDialog.type === 'makeAdmin'
              ? `Are you sure you want to make ${confirmDialog.userName} an admin? They will have full access to the admin dashboard.`
              : `Are you sure you want to remove admin privileges from ${confirmDialog.userName}? They will be converted to a regular user.`
          }
          confirmText={
            confirmDialog.type === 'delete'
              ? 'Delete User'
              : confirmDialog.type === 'makeAdmin'
              ? 'Make Admin'
              : 'Remove Admin'
          }
          variant={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
          loading={actionLoading}
        />
      </div>
    </AdminLayout>
  )
}
