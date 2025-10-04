# Fix Court Pricing System - Complete Guide

## 🚨 Problem

When updating court prices, you get this error:
```
Court updated but pricing rules failed. You can update pricing later.
```

And the new prices don't display after saving.

## 🔍 Root Causes

1. **Missing Table**: `pricing_rules` table doesn't exist in your database
2. **Schema Mismatch**: Different schemas use different column names
3. **No Price Refresh**: Prices don't update in the UI after saving
4. **Error Handling**: Poor error messages don't explain the issue

## ✅ Complete Solution

### **Step 1: Fix Database Schema (Required)**

Run this SQL script in your **Supabase SQL Editor**:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the content from `fix-pricing-system.sql`
3. Click **Run** to execute

This will:
- ✅ **Create pricing_rules table** with correct schema
- ✅ **Add default pricing** for all existing courts
- ✅ **Set up proper constraints** and triggers
- ✅ **Configure RLS policies** for security

### **Step 2: Code Improvements (Already Applied)**

I've updated the edit court functionality to:
- ✅ **Check table existence** before updating pricing
- ✅ **Use upsert operations** for better reliability
- ✅ **Handle missing tables** gracefully
- ✅ **Refresh prices** after successful update
- ✅ **Provide clear error messages**

## 🧪 Testing the Fix

### **After running the SQL script:**

1. **Go to Edit Court**: `/admin/courts/[id]/edit`
2. **Change prices**: Update 1hr or 2hr pricing
3. **Click Save**: Should see "Court and pricing updated successfully!"
4. **Check prices**: New prices should display immediately
5. **Verify database**: Check pricing_rules table has new values

### **Expected Results:**

- ✅ **Success message**: "Court and pricing updated successfully!"
- ✅ **Prices update**: New prices show in the form immediately
- ✅ **Database updated**: pricing_rules table contains new values
- ✅ **No errors**: Clean operation without failures

## 📊 Database Schema

### **pricing_rules Table Structure:**
```sql
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY,
    court_id UUID REFERENCES courts(id),
    duration_hours INTEGER NOT NULL,
    off_peak_price DECIMAL(10,2) NOT NULL,
    peak_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(court_id, duration_hours)
);
```

### **Sample Data:**
```sql
-- Tennis Court - 1 hour
court_id: "abc-123"
duration_hours: 1
off_peak_price: 45.00
peak_price: 58.50

-- Tennis Court - 2 hours  
court_id: "abc-123"
duration_hours: 2
off_peak_price: 85.00
peak_price: 110.50
```

## 🔧 How the Pricing System Works

### **Price Calculation:**
- **Off-peak price**: What you enter in the form
- **Peak price**: Automatically calculated as off-peak × 1.3 (30% higher)
- **Rounded**: Peak prices are rounded to 2 decimal places

### **Storage:**
- **Court basic info**: Stored in `courts` table
- **Pricing rules**: Stored in `pricing_rules` table
- **Linked by**: `court_id` foreign key

### **Display:**
- **Admin forms**: Show off-peak prices for editing
- **User booking**: Show both off-peak and peak prices
- **Court cards**: Show "from $X" using lowest off-peak price

## 🎯 Benefits of the Fix

### **For Admins:**
- 🔧 **Easy price updates** - Change prices and see results immediately
- 📊 **Flexible pricing** - Different prices for 1hr vs 2hr bookings
- ⏰ **Peak hour pricing** - Automatic 30% markup for busy times
- 🛡️ **Error handling** - Clear messages when things go wrong

### **For Users:**
- 💰 **Transparent pricing** - See both off-peak and peak prices
- ⏰ **Time-based rates** - Different prices for different durations
- 📱 **Consistent display** - Prices show correctly across the app

## 🚀 Advanced Features

### **Peak Hour Logic:**
```typescript
// Peak hours: 5 PM - 10 PM on weekdays
const isPeakHour = (time: string) => {
  const hour = parseInt(time.split(':')[0])
  const day = new Date().getDay()
  return day >= 1 && day <= 5 && hour >= 17 && hour <= 22
}
```

### **Dynamic Pricing:**
- **Off-peak**: Weekday mornings, weekends
- **Peak**: Weekday evenings (5 PM - 10 PM)
- **Premium**: Special events or holidays (future feature)

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Table doesn't exist" error**
   - ✅ **Solution**: Run the `fix-pricing-system.sql` script

2. **Prices don't update after saving**
   - ✅ **Solution**: The code now refreshes automatically after 1 second

3. **Wrong column names error**
   - ✅ **Solution**: The SQL script creates the correct schema

4. **Permission denied error**
   - ✅ **Solution**: The script sets up proper RLS policies

### **Verification Commands:**

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'pricing_rules';

-- Check pricing for a specific court
SELECT c.name, pr.duration_hours, pr.off_peak_price, pr.peak_price
FROM courts c
JOIN pricing_rules pr ON c.id = pr.court_id
WHERE c.name LIKE '%Tennis%';

-- Check all pricing rules
SELECT COUNT(*) as total_rules FROM pricing_rules;
```

## 📈 Next Steps

After fixing the pricing system:

1. ✅ **Test all court types** - Verify pricing works for tennis, basketball, etc.
2. ✅ **Update existing courts** - Set appropriate prices for each court type
3. ✅ **Test booking flow** - Ensure prices display correctly during booking
4. ✅ **Monitor performance** - Check that pricing queries are fast

The court pricing system should now work perfectly with immediate price updates and proper error handling! 🎉
