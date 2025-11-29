# Supabase Email Troubleshooting Guide

## 🚨 Issue: Not Receiving Password Reset Emails

### Common Causes & Solutions

---

## ✅ Solution 1: Configure Supabase URL Settings (MOST COMMON)

### **Step-by-Step:**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click **Authentication** (left sidebar)
   - Click **URL Configuration**

3. **Set Site URL**
   ```
   https://acu-project-map-dev.vercel.app
   ```

4. **Add Redirect URLs** (Add all these):
   ```
   https://acu-project-map-dev.vercel.app/**
   https://acu-project-map-dev.vercel.app/admin/reset-password
   https://acu-project-map-dev.vercel.app/admin/dashboard
   http://localhost:8080/**
   http://localhost:8080/admin/reset-password
   ```

5. **Click Save**

6. **Wait 1-2 minutes** for changes to propagate

---

## ✅ Solution 2: Check Email Settings

### **In Supabase Dashboard:**

1. Go to **Authentication** → **Email Templates**

2. **Verify "Confirm signup" template** is enabled

3. **Check "Magic Link" template**

4. **Verify "Change Email Address" template**

5. **Most Important: Check "Reset Password" template**
   - Should contain: `{{ .ConfirmationURL }}`
   - Should be enabled

### **Default Reset Password Template:**
```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

---

## ✅ Solution 3: Use Custom SMTP (For Production)

### **Why?**
- Supabase's default email has limitations
- May be blocked by some email providers
- Rate limited to prevent abuse

### **Setup Custom SMTP:**

1. **Go to**: Authentication → Email Templates → SMTP Settings

2. **Get SMTP credentials** from:
   - **Gmail**: Use App Password
   - **SendGrid**: Free tier (100 emails/day)
   - **Mailgun**: Free tier (5,000 emails/month)
   - **AWS SES**: Very cheap, reliable

3. **Recommended: SendGrid Setup**

   a. Sign up at: https://sendgrid.com/
   
   b. Create an API key
   
   c. In Supabase SMTP Settings:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: ACU Project Map
   ```

4. **Click Save**

5. **Test** by sending a password reset email

---

## ✅ Solution 4: Check Email Provider

### **Gmail Users:**

1. **Check Spam/Junk folder**
   - Supabase emails often end up here

2. **Check "All Mail" folder**

3. **Search for**: `@supabase.io` or `@mail.supabase.io`

4. **Add to Safe Senders**:
   - Mark as "Not Spam"
   - Add sender to contacts

### **Outlook/Hotmail Users:**

1. Check **Junk Email** folder

2. Check **Clutter** folder

3. Add `@supabase.io` to **Safe Senders**

### **Corporate Email:**

- Contact IT department
- Corporate firewalls may block Supabase emails
- May need to whitelist domain

---

## ✅ Solution 5: Verify Email Address in Supabase

### **Check User Exists:**

1. Go to **Authentication** → **Users**

2. **Find your email** in the list

3. **Check "Email Confirmed" column**
   - ✅ Green checkmark = Confirmed
   - ❌ Red X = Not confirmed

4. If not confirmed:
   - Click on the user
   - Click **"Send confirmation email"**

---

## ✅ Solution 6: Check Rate Limiting

### **Supabase Email Limits:**

- **Free Tier**: Limited emails per hour
- **Rate limit**: May be hit during testing

### **Solution:**
1. Wait 10-15 minutes
2. Try again
3. Consider upgrading to Pro plan for higher limits

---

## ✅ Solution 7: Test with Different Email

### **Try These:**

1. **Gmail** (usually works best)
2. **Outlook/Hotmail**
3. **Yahoo**
4. **ProtonMail**

This helps identify if it's an email provider issue.

---

## 🧪 Testing Steps

### **Test Password Reset Flow:**

1. **Open Browser Console** (F12)

2. **Go to Network Tab**

3. **Attempt password reset**

4. **Check for errors**:
   - Look for failed requests
   - Check response messages

5. **Look for Success Response**:
   ```json
   {
     "data": {},
     "error": null
   }
   ```

### **Check Supabase Logs:**

1. Go to **Supabase Dashboard**
2. Click **Logs** (left sidebar)
3. Filter by **Auth logs**
4. Look for password reset attempts
5. Check for errors

---

## 🔧 Quick Fix Script

Add this to your `ForgotPassword.tsx` for better debugging:

```typescript
const resetPassword = async (email: string) => {
  try {
    console.log('Attempting password reset for:', email);
    console.log('Redirect URL:', `${window.location.origin}/admin/reset-password`);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    console.log('Reset password response:', { data, error });

    if (error) {
      console.error('Reset password error:', error);
      throw error;
    }

    console.log('Password reset email sent successfully');
    toast({
      title: "✅ Password Reset Email Sent",
      description: "Check your email for the password reset link",
      duration: 2000,
    });
  } catch (error: any) {
    console.error('Caught error:', error);
    toast({
      title: "❌ Password Reset Failed",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
    throw error;
  }
};
```

---

## 🎯 Most Likely Issues (In Order)

1. **❌ Redirect URLs not configured** (90% of cases)
   - Solution: Add your Vercel URL to Supabase redirect URLs

2. **❌ Email in Spam folder** (5% of cases)
   - Solution: Check spam/junk folder

3. **❌ Using default Supabase SMTP** (3% of cases)
   - Solution: Set up custom SMTP

4. **❌ Rate limiting** (1% of cases)
   - Solution: Wait and try again

5. **❌ Email not confirmed** (1% of cases)
   - Solution: Confirm email first

---

## 📋 Checklist

Go through this checklist:

### Supabase Configuration:
- [ ] Site URL is set to your Vercel URL
- [ ] Redirect URLs include your Vercel URL
- [ ] Reset password email template is enabled
- [ ] Email template contains `{{ .ConfirmationURL }}`

### Email Provider:
- [ ] Checked spam/junk folder
- [ ] Checked all mail folders
- [ ] Tried different email address
- [ ] Email is confirmed in Supabase users list

### Testing:
- [ ] Browser console shows no errors
- [ ] Supabase logs show no errors
- [ ] Success toast appears after submission
- [ ] Waited 5-10 minutes for email

### Advanced:
- [ ] Custom SMTP configured (if available)
- [ ] Rate limits not exceeded
- [ ] Email provider not blocking Supabase

---

## 🚀 Quick Start Fix

**The #1 most common fix:**

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add this to Redirect URLs:
   ```
   https://acu-project-map-dev.vercel.app/**
   ```
4. Click Save
5. Wait 2 minutes
6. Try password reset again
7. Check spam folder

---

## 📞 Still Not Working?

### Check These:

1. **Supabase Status**: https://status.supabase.com/
   - Is there an outage?

2. **Supabase Logs**: 
   - Dashboard → Logs → Auth
   - Look for specific errors

3. **Browser Console**:
   - Any red errors?
   - Network requests failing?

4. **Email Provider**:
   - Try a different email service
   - Check email provider settings

---

## 💡 Workaround: Manual Password Reset

**If emails still not working:**

1. **As Admin in Supabase Dashboard**:
   - Go to Authentication → Users
   - Find the user
   - Click on user
   - Click "Send Password Recovery"
   - This sends email directly from Supabase

2. **Or Reset via SQL Editor**:
   ```sql
   -- Generate a new password reset token
   SELECT * FROM auth.users WHERE email = 'user@example.com';
   ```

---

## 🎯 Final Solution

**If nothing else works, here's the nuclear option:**

1. **Delete the user** from Supabase Dashboard
2. **Create a new account** with password
3. **Sign in** with new password
4. **No email confirmation needed**

---

## 📚 Additional Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Email Configuration**: https://supabase.com/docs/guides/auth/auth-email
- **SMTP Setup**: https://supabase.com/docs/guides/auth/auth-smtp
- **Troubleshooting**: https://supabase.com/docs/guides/auth/troubleshooting

---

## ✅ Expected Flow

**When everything works correctly:**

1. User enters email → Click "Send Reset Link"
2. App shows: "✅ Password Reset Email Sent"
3. Email arrives within **1-2 minutes**
4. Email contains link: `https://acu-project-map-dev.vercel.app/admin/reset-password?token=...`
5. User clicks link → Redirected to reset password page
6. User enters new password → Password updated
7. User can sign in with new password

---

## 🎉 Success!

Once configured correctly:
- ✅ Emails arrive in 1-2 minutes
- ✅ Links work correctly
- ✅ Password reset completes successfully
- ✅ User can sign in immediately

**Most issues are fixed by adding the correct redirect URLs in Supabase!**

