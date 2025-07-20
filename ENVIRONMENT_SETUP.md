# Environment Setup Guide

## 🌍 Documentation URL Configuration

The website uses environment variables to handle different documentation URLs for development vs production.

### 📝 **Create Your Local Environment File**

Create a `.env.local` file in your project root with:

```bash
# Documentation URL - Development points to local mdBook server
NEXT_PUBLIC_DOCS_URL=http://localhost:3000

# Other environment variables (copy from env.example and add your keys)
NEXT_PUBLIC_SUPABASE_URL=https://lzgxtrefdbalpzmuoduf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@ciro.network
TO_EMAIL=admin@ciro.network
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### 🚀 **How It Works**

| Environment | `NEXT_PUBLIC_DOCS_URL` Value | Result |
|-------------|------------------------------|---------|
| **Development** | `http://localhost:3000` | Links to local mdBook server |
| **Production (Vercel)** | `https://docs.ciro.network` | Links to production docs |

### 🔧 **Environment Variables in Use**

The code now uses:
```typescript
// Fallback to localhost:3000 if env var not set
process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3000'
```

### 📁 **Files Updated**

- ✅ `src/app/page.tsx` - Main navigation Knowledge Base link
- ✅ `src/components/Footer.tsx` - Footer documentation link  
- ✅ `src/app/api/waitlist/route.ts` - Email template link
- ✅ `env.example` - Production example added

### 🎯 **Next Steps**

1. **Create `.env.local`** with the content above
2. **Restart your dev server**: `npm run dev`
3. **Test the links** - they should now point to `http://localhost:3000`
4. **For production deployment**: Set `NEXT_PUBLIC_DOCS_URL=https://docs.ciro.network` in Vercel

### 🐛 **Troubleshooting**

If links are still redirecting to `:3002/docs`:
1. Clear browser cache
2. Restart Next.js dev server
3. Check that `.env.local` exists and has the correct value
4. Verify no browser extensions are modifying URLs 