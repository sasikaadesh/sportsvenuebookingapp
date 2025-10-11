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
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
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
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin'
      
      const { error } = await (supabase as any)
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        toast.error('Failed to update user role')
        return
      }

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ))
      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      console.error('Exception updating user role:', error)
      toast.error('An error occurred')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    // Debug logging - Step 1
    console.log('Delete user called with ID:', userId)
    console.log('All users in state:', users.map(u => ({ id: u.id, email: u.email, name: u.name })))

    const userToDelete = users.find(u => u.id === userId)
    console.log('User to delete:', userToDelete)

    const userName = userToDelete?.name || userToDelete?.email || 'this user'

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone and will permanently remove the user from the system.`)) {
      return
    }

    if (!user?.id) {
      toast.error('You must be logged in to delete users')
      return
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      toast.error('You cannot delete your own account')
      return
    }

    const loadingToast = toast.loading('Deleting user...')

    try {
      console.log('Attempting to delete user:', { userId, adminUserId: user.id })

      // Call our API route to properly delete the user from both auth.users and users tables
      const response = await fetch('/api/admin/delete-user-direct', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          adminUserId: user.id
        }),
      })

      const result = await response.json()
      console.log('Delete response:', result)

      if (!response.ok) {
        console.error('Error deleting user:', result.error)
        toast.error(result.error || 'Failed to delete user', { id: loadingToast })
        return
      }

      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId))
      toast.success(`User ${userName} deleted successfully`, { id: loadingToast })

      // Reload users list to ensure consistency
      setTimeout(() => {
        loadUsers()
      }, 1000)

    } catch (error) {
      console.error('Exception deleting user:', error)
      toast.error('An error occurred while deleting user', { id: loadingToast })
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || user.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role || 'user'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role || 'user')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={`Make ${user.role === 'admin' ? 'User' : 'Admin'}`}
                          >
                            {user.role === 'admin' ? (
                              <UserX className="w-4 h-4 text-orange-600" />
                            ) : (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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

      <Footer />
    </div>
  )
}
