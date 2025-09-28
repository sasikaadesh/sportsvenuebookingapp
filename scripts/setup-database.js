const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up database...')

  try {
    // Test connection
    console.log('📡 Testing connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }

    console.log('✅ Connected to Supabase successfully!')

    // Check if users table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')

    if (tableError) {
      console.log('⚠️  Could not check tables, but connection works')
    } else if (tables && tables.length > 0) {
      console.log('✅ Users table exists')
    } else {
      console.log('❌ Users table does not exist - run the schema SQL in Supabase dashboard')
    }

    // List existing users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
    } else {
      console.log(`📊 Found ${users.length} users in database`)
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
    }

    // Create admin user if none exists
    const adminExists = users && users.some(user => user.role === 'admin')
    
    if (!adminExists) {
      console.log('👤 Creating admin user...')
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@test.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          name: 'Admin User'
        }
      })

      if (authError) {
        console.error('❌ Error creating auth user:', authError.message)
      } else {
        console.log('✅ Auth user created')

        // Create profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: 'admin@test.com',
            name: 'Admin User',
            role: 'admin'
          })

        if (profileError) {
          console.error('❌ Error creating profile:', profileError.message)
        } else {
          console.log('✅ Admin user created successfully!')
          console.log('📧 Email: admin@test.com')
          console.log('🔑 Password: password123')
        }
      }
    } else {
      console.log('✅ Admin user already exists')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

setupDatabase()
