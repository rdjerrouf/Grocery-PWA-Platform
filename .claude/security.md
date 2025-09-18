# Security Guidelines & Best Practices

## 🔒 Environment Variables Security

### ✅ Safe for Public Repositories:
- `NEXT_PUBLIC_*` variables (these are exposed to browsers anyway)
- `.env.example` with placeholder values
- Documentation with placeholder examples

### ❌ NEVER Commit These:
- `.env.local` - Contains real API keys and secrets
- `.env.production` - Production secrets
- `.env.development` - Development secrets
- Any file containing actual API keys, tokens, or passwords

## 🛡️ GitIgnore Protection

Our `.gitignore` includes comprehensive protection for:
```
# Environment files
.env*
.env.local
.env.development
.env.production

# Build artifacts (may contain embedded secrets)
/.next/server/
/.next/static/

# Security-sensitive files
*.key
*.pem
*.p12
*.pfx
*secret*
*credential*

# Test reports (might contain sensitive data)
/test-results/
/playwright-report/
```

## 🔍 Secret Detection Checklist

Before committing, always check for:
- [ ] No actual API keys in source code
- [ ] No JWT tokens in documentation (use placeholders)
- [ ] No database passwords or connection strings
- [ ] No service account keys or certificates
- [ ] No webhook secrets or signing keys

## 🚨 Common Security Risks

### 1. Environment Variable Exposure
```tsx
// ❌ BAD - Server-only secrets in client code
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ✅ GOOD - Only use server-only secrets in server components/actions
// app/actions/admin.ts
'use server'
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

### 2. JWT Token Leakage
```tsx
// ❌ BAD - Logging tokens
console.log('User token:', token)

// ✅ GOOD - Never log sensitive data
console.log('User authenticated:', !!token)
```

### 3. Database Credential Exposure
```tsx
// ❌ BAD - Direct database URLs
const dbUrl = 'postgresql://user:password@host/db'

// ✅ GOOD - Use environment variables
const dbUrl = process.env.DATABASE_URL
```

## 📋 Pre-Commit Security Checklist

Before every commit:
1. [ ] Run `git status` to see what files are being committed
2. [ ] Verify no `.env*` files are staged
3. [ ] Check no actual API keys are in code with: `git diff --cached | grep -i "api_key\|secret\|password"`
4. [ ] Ensure all secrets use environment variables
5. [ ] Verify `.env.example` only has placeholders

## 🔧 Emergency Response

If sensitive data is accidentally committed:
1. **Immediately rotate all exposed secrets**
2. **Remove from git history**: `git filter-branch` or BFG Repo-Cleaner
3. **Force push**: `git push --force-with-lease`
4. **Notify team members** to pull latest changes
5. **Update security documentation**

## 🎯 Supabase-Specific Security

### Row Level Security (RLS)
- Always enable RLS on tables with sensitive data
- Test RLS policies with different user roles
- Never bypass RLS in production code

### API Key Management
```env
# ✅ GOOD - Separate keys by environment
SUPABASE_URL_DEV=https://xxx.supabase.co
SUPABASE_URL_PROD=https://yyy.supabase.co

# Service role keys - server-side only
SUPABASE_SERVICE_ROLE_KEY_DEV=eyJ...
SUPABASE_SERVICE_ROLE_KEY_PROD=eyJ...
```

### Authentication Best Practices
- Use auth helpers for proper session management
- Implement proper CSRF protection
- Validate user permissions in server actions
- Use middleware for route protection

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [GitHub Security Advisories](https://docs.github.com/en/code-security)

## 🔄 Security Review Process

For every pull request:
1. Review environment variable usage
2. Check for hardcoded secrets
3. Verify RLS policies are correct
4. Test authentication flows
5. Validate input sanitization
6. Check for XSS vulnerabilities

Remember: **Security is everyone's responsibility!**