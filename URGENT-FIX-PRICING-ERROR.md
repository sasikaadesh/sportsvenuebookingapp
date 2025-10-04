# URGENT: Fix "off_peak_price column not found" Error

## 🚨 Current Error
```
Court updated but pricing failed: Could not find the 'off_peak_price' column of 'pricing_rules' in the schema cache
```

## 🔍 Root Cause
Your `pricing_rules` table either:
1. **Doesn't exist** in your database
2. **Has wrong schema** (different column names)
3. **Has old schema** from a previous setup

## ✅ IMMEDIATE FIX (2 minutes)

### **Step 1: Run Database Script**

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** the entire content from `check-and-fix-pricing-table.sql`
3. **Click "Run"** to execute the script
4. **Wait for completion** (should take 5-10 seconds)

### **Step 2: Verify the Fix**

1. **Go back to your court edit page**
2. **Change a price** (e.g., 1hr price from 45 to 50)
3. **Click Save**
4. **Should see**: "Court and pricing updated successfully!"

## 🔧 What the Script Does

### **Diagnosis:**
- ✅ **Checks if table exists**
- ✅ **Shows current table structure**
- ✅ **Identifies schema problems**

### **Fixes:**
- ✅ **Drops incompatible table** (if wrong schema)
- ✅ **Creates correct table structure**
- ✅ **Adds proper columns**: `off_peak_price`, `peak_price`
- ✅ **Inserts default pricing** for all courts
- ✅ **Sets up constraints** and triggers

### **Expected Output:**
```sql
-- You should see this in the SQL Editor results:
pricing_rules table DOES NOT EXIST
-- OR
pricing_rules table EXISTS
-- Followed by:
Final pricing_rules table structure:
column_name     | data_type | is_nullable
id              | uuid      | NO
court_id        | uuid      | NO  
duration_hours  | integer   | NO
off_peak_price  | numeric   | NO
peak_price      | numeric   | NO
created_at      | timestamp | YES
updated_at      | timestamp | YES
```

## 🎯 Code Improvements (Already Applied)

I've updated the edit court code to:

### **Better Error Detection:**
```typescript
// Check if table has correct schema
const { data: schemaCheck, error: schemaError } = await supabase
  .from('pricing_rules')
  .select('off_peak_price, peak_price')
  .limit(1)

if (schemaError && schemaError.message.includes('off_peak_price')) {
  toast.error('Pricing system needs to be set up. Please run the database setup script.')
}
```

### **Clear User Messages:**
- ✅ **Schema error**: "Pricing system needs to be set up"
- ✅ **Success**: "Court and pricing updated successfully!"
- ✅ **Fallback**: "Court updated successfully, but pricing system requires database migration"

## 🧪 Testing After Fix

### **Test 1: Update Prices**
1. Go to `/admin/courts/[id]/edit`
2. Change 1hr price: `45` → `50`
3. Change 2hr price: `85` → `95`
4. Click **Save**
5. **Expected**: "Court and pricing updated successfully!"

### **Test 2: Verify Database**
Run this in SQL Editor:
```sql
SELECT c.name, pr.duration_hours, pr.off_peak_price, pr.peak_price
FROM courts c
JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.name LIKE '%Tennis%'
ORDER BY pr.duration_hours;
```

**Expected Result:**
```
name                | duration_hours | off_peak_price | peak_price
Premium Tennis Court| 1              | 50.00          | 65.00
Premium Tennis Court| 2              | 95.00          | 123.50
```

## 🔄 How Pricing Works After Fix

### **Price Structure:**
- **Off-peak price**: What you enter in the admin form
- **Peak price**: Automatically calculated (off-peak × 1.3)
- **Duration-based**: Separate pricing for 1hr and 2hr bookings

### **Example:**
```
You enter: 1hr = $45, 2hr = $85
Database stores:
- 1hr: off_peak=$45, peak=$58.50
- 2hr: off_peak=$85, peak=$110.50
```

### **User sees:**
- **Booking page**: "$45-$58.50 per hour" (off-peak to peak range)
- **Court cards**: "From $45" (lowest off-peak price)

## 🚨 If Script Fails

### **Common Issues:**

1. **Permission denied**
   - Make sure you're using the **SQL Editor** in Supabase Dashboard
   - Don't run this in your local terminal

2. **Foreign key constraint error**
   - The script handles this automatically
   - If it persists, contact support

3. **Table already exists with data**
   - The script preserves existing data when possible
   - Only drops table if schema is incompatible

### **Manual Verification:**
```sql
-- Check if table was created correctly
\d pricing_rules

-- Check if data was inserted
SELECT COUNT(*) FROM pricing_rules;

-- Should return number > 0
```

## 📞 Support

If the script doesn't work:
1. **Copy the error message** from SQL Editor
2. **Check the Results tab** for detailed output
3. **Try running the script again** (it's safe to run multiple times)

The pricing system should work perfectly after running this script! 🎉

## 🎯 Summary

**Before Fix:**
- ❌ "off_peak_price column not found" error
- ❌ Prices don't update
- ❌ Confusing error messages

**After Fix:**
- ✅ "Court and pricing updated successfully!" message
- ✅ Prices update immediately
- ✅ Clear error messages if issues occur
- ✅ Proper database schema with all required columns
