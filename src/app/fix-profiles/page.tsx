'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export default function FixProfilesPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fixProfiles = async () => {
    setLoading(true)
    setStatus('Starting profile fix...')

    try {
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        setStatus(`Error fetching auth users: ${authError.message}`)
        return
      }

      setStatus(`Found ${authUsers.users.length} auth users`)

      // Get existing profiles
      const { data: existingProfiles, error: profileError } = await supabase
        .from('users')
        .select('id')

      if (profileError) {
        setStatus(`Error fetching profiles: ${profileError.message}`)
        return
      }

      const existingProfileIds = new Set(existingProfiles?.map((p: any) => p.id) || [])
      const usersNeedingProfiles = authUsers.users.filter(user => !existingProfileIds.has(user.id))

      setStatus(`${usersNeedingProfiles.length} users need profiles`)

      // Create missing profiles
      for (const user of usersNeedingProfiles) {
        try {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || '',
              phone: user.user_metadata?.phone || '',
              role: 'user'
            } as any)

          if (insertError) {
            console.error(`Failed to create profile for ${user.email}:`, insertError)
          } else {
            console.log(`✅ Created profile for ${user.email}`)
          }
        } catch (err) {
          console.error(`Error creating profile for ${user.email}:`, err)
        }
      }

      setStatus('✅ Profile fix completed! Check console for details.')
    } catch (error) {
      setStatus(`Fix failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createAdminUser = async () => {
    setLoading(true)
    setStatus('Creating admin user...')

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@test.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          name: 'Admin User'
        }
      })

      if (authError) {
        setStatus(`Auth creation failed: ${authError.message}`)
        return
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin'
        } as any)

      if (profileError) {
        setStatus(`Profile creation failed: ${profileError.message}`)
        return
      }

      setStatus('✅ Admin user created! Email: admin@test.com, Password: password123')
    } catch (error) {
      setStatus(`Admin creation failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const createSampleData = async () => {
    setLoading(true)
    setStatus('Creating sample courts and data...')

    try {
      // Create sample courts
      const courts = [
        {
          name: 'Tennis Court A',
          type: 'tennis',
          description: 'Professional tennis court with synthetic surface',
          images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8'],
          amenities: ['Lighting', 'Seating', 'Water Fountain'],
          is_active: true
        },
        {
          name: 'Basketball Court Pro',
          type: 'basketball',
          description: 'Indoor basketball court with wooden flooring',
          images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc'],
          amenities: ['Air Conditioning', 'Sound System', 'Scoreboard'],
          is_active: true
        },
        {
          name: 'Cricket Ground Elite',
          type: 'cricket',
          description: 'Full-size cricket ground with natural grass',
          images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e'],
          amenities: ['Pavilion', 'Scoreboard', 'Practice Nets'],
          is_active: true
        }
      ]

      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .insert(courts as any)
        .select()

      if (courtsError) {
        setStatus(`Courts creation failed: ${courtsError.message}`)
        return
      }

      // Create pricing rules for each court
      const pricingRules = courtsData.flatMap((court: any) => [
        {
          court_id: court.id,
          duration_hours: 1,
          off_peak_price: 45.00,
          peak_price: 65.00
        },
        {
          court_id: court.id,
          duration_hours: 2,
          off_peak_price: 85.00,
          peak_price: 120.00
        }
      ])

      const { error: pricingError } = await supabase
        .from('pricing_rules')
        .insert(pricingRules as any)

      if (pricingError) {
        console.error('Pricing rules error:', pricingError)
      }

      setStatus('✅ Sample data created successfully!')
    } catch (error) {
      setStatus(`Sample data creation failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Fix User Profiles</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Fix Tools</h2>
          <p className="text-gray-600 mb-4">
            Use these tools to fix missing user profiles and create admin users.
          </p>
          
          <div className="space-y-4">
            <div>
              <Button 
                onClick={fixProfiles} 
                disabled={loading}
                className="mr-4"
              >
                {loading ? 'Fixing...' : 'Fix Missing Profiles'}
              </Button>
              
              <Button
                onClick={createAdminUser}
                disabled={loading}
                variant="outline"
                className="mr-4"
              >
                {loading ? 'Creating...' : 'Create Admin User'}
              </Button>

              <Button
                onClick={createSampleData}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Creating...' : 'Create Sample Data'}
              </Button>
            </div>
            
            {status && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-mono text-sm">{status}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• This page requires service role access</li>
            <li>• Run &quot;Fix Missing Profiles&quot; to create profiles for existing auth users</li>
            <li>• Use &quot;Create Admin User&quot; to create a test admin account</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
