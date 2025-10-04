# Fix "maintenance_mode column not found" Error

## 🚨 Problem

When trying to update court prices in the Edit Court page, you get this error:
```
Failed to update court: Could not find the 'maintenance_mode' column of 'courts' in the schema cache
```

## 🔍 Root Cause

The issue occurs because:
1. **Different database schemas** - Some setup scripts include `maintenance_mode` column, others don't
2. **Code expects column** - The edit court functionality tries to update this column
3. **Schema mismatch** - Your current database doesn't have this column

## ✅ Solution

### **Step 1: Add Missing Column (Recommended)**

Run this SQL script in your **Supabase SQL Editor**:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the content from `add-maintenance-mode-column.sql`
3. Click **Run** to execute

This will:
- ✅ Add the `maintenance_mode` column if missing
- ✅ Set default value to `false` for existing courts
- ✅ Update RLS policies to include maintenance mode
- ✅ Add other potentially missing columns

### **Step 2: Code Updates (Already Applied)**

I've updated the edit court functionality to:
- ✅ **Check if column exists** before trying to update it
- ✅ **Gracefully handle missing column** without breaking
- ✅ **Conditionally render** maintenance mode checkbox
- ✅ **Prevent errors** during court updates

## 🧪 Testing the Fix

### **After running the SQL script:**

1. **Go to Edit Court page**: `/admin/courts/[id]/edit`
2. **Update court prices**: Change 1hr or 2hr pricing
3. **Click Save**: Should work without errors
4. **Check maintenance mode**: Checkbox should appear if column exists

### **Expected Results:**

- ✅ **No more "column not found" errors**
- ✅ **Court prices update successfully**
- ✅ **Maintenance mode toggle works** (if column exists)
- ✅ **Graceful fallback** if column is missing

## 🔧 Alternative Solutions

### **Option 1: Quick Fix (Temporary)**
If you can't run SQL scripts, the code updates alone will prevent the error by skipping the maintenance_mode update.

### **Option 2: Remove Maintenance Mode (Not Recommended)**
You could remove all maintenance_mode references from the code, but this removes useful functionality.

### **Option 3: Database Reset (Nuclear Option)**
Run a complete database setup script, but this will lose existing data.

## 📊 Database Schema Verification

After applying the fix, verify your schema:

```sql
-- Check if maintenance_mode column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'courts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected columns:
- ✅ `id` (UUID)
- ✅ `name` (TEXT)
- ✅ `type` (TEXT)
- ✅ `description` (TEXT)
- ✅ `is_active` (BOOLEAN)
- ✅ `maintenance_mode` (BOOLEAN) ← Should be present after fix
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP)

## 🎯 Benefits of the Fix

### **With maintenance_mode column:**
- 🔧 **Maintenance scheduling** - Mark courts as under maintenance
- 🚫 **Prevent bookings** - Users can't book courts in maintenance
- 📊 **Better admin control** - Separate from active/inactive status
- 🔄 **Flexible management** - Can be active but in maintenance

### **Code improvements:**
- 🛡️ **Error prevention** - Graceful handling of missing columns
- 🔄 **Backward compatibility** - Works with different database schemas
- 🧪 **Better testing** - Checks column existence before operations
- 📱 **Dynamic UI** - Shows/hides features based on database schema

## 🚀 Next Steps

1. ✅ **Run the SQL script** to add missing columns
2. ✅ **Test court editing** to verify the fix works
3. ✅ **Use maintenance mode** for better court management
4. ✅ **Monitor for other schema issues** and apply similar fixes

The edit court functionality should now work perfectly without any "column not found" errors! 🎉
