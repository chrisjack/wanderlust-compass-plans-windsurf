# Supabase Security Deployment Guide

## 🚀 Manual Deployment Steps

Since Docker is not available for local bundling, follow these steps to deploy the security improvements:

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `diphacbvdhfzdqfkobkl`
3. Navigate to **Edge Functions** in the sidebar

### 2. Update Each Function

#### wikivoyage-search
1. Click on `wikivoyage-search` function
2. Replace the code with the updated version from `supabase/functions/wikivoyage-search/index.ts`
3. Click **Deploy**

#### parse-travel-document
1. Click on `parse-travel-document` function
2. Replace the code with the updated version from `supabase/functions/parse-travel-document/index.ts`
3. Click **Deploy**

#### flight-monitor
1. Click on `flight-monitor` function
2. Replace the code with the updated version from `supabase/functions/flight-monitor/index.ts`
3. Click **Deploy**

#### handle-travel-email
1. Click on `handle-travel-email` function
2. Replace the code with the updated version from `supabase/functions/handle-travel-email/index.ts`
3. Click **Deploy**

#### email-webhook
1. Click on `email-webhook` function
2. Replace the code with the updated version from `supabase/functions/email-webhook/index.ts`
3. Click **Deploy**

### 3. Update Function Configuration
1. Go to **Settings** → **Edge Functions**
2. Ensure all functions have `verify_jwt = true` (except email-webhook which should be `false`)

### 4. Deploy Database Migrations
1. Go to **SQL Editor**
2. Run the updated migration from `supabase/migrations/20240320000000_create_import_tables.sql`
3. This will add the new RLS policies

## 🧪 Testing After Deployment

Run the test script to verify all security measures are working:

```bash
node test-security-functions.js
```

## ✅ Expected Test Results

After deployment, all tests should pass:

- ✅ wikivoyage-search: Valid queries accepted
- ✅ wikivoyage-search invalid: Empty queries rejected
- ✅ parse-travel-document: Valid documents processed
- ✅ parse-travel-document oversized: Large documents rejected (>50KB)
- ✅ CORS: Properly restricted to specific domain
- ✅ Authentication: All functions require proper authentication

## 🔧 Troubleshooting

### If functions fail to deploy:
1. Check the function logs in the Supabase dashboard
2. Verify all imports are correct
3. Ensure environment variables are set

### If tests still fail:
1. Wait a few minutes for deployment to complete
2. Check function versions in the dashboard
3. Verify the function code was updated correctly

## 📋 Security Checklist

After deployment, verify:

- [ ] All functions require JWT authentication (except email-webhook)
- [ ] Input validation is working
- [ ] CORS is restricted to your domain
- [ ] Error messages are sanitized
- [ ] RLS policies are in place
- [ ] Content length limits are enforced 