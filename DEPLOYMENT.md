# Deployment Guide for DLM Movies

## Quick Start (Local Development)

```bash
cd /Users/shaji/Downloads/dlm-movies
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deploy to Production

### Build the Application

```bash
cd /Users/shaji/Downloads/dlm-movies
npm run build
```

### Run in Production Mode

```bash
npm start
```

The application can be deployed to any Node.js hosting platform.

## Production Checks

Before deploying, ensure:

- ✅ All pages load without errors
- ✅ Images are displaying correctly from TMDB
- ✅ Search functionality works
- ✅ Movie detail pages render properly
- ✅ Navigation between pages is smooth
- ✅ SEO metadata is present (check page source)

## Testing the Build Locally

```bash
npm run build
npm start
```

This will build and run the production version locally.

## Post-Deployment

1. **Verify SEO**: Check `/sitemap.xml` and `/robots.txt`
2. **Test Performance**: Use Lighthouse in Chrome DevTools
3. **Check Mobile**: Test on different devices
4. **Monitor**: Set up analytics for insights

## Custom Domain (Optional)

Configure your DNS settings to point to your hosting provider.

## Environment Variables for Production

The following are already configured in `.env.local`:

- `TMDB_API_KEY`: API key for server-side calls
- `NEXT_PUBLIC_TMDB_API_KEY`: API key for client-side calls

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is 18+
- Verify API key is correct

### Images Not Loading
- Verify `next.config.ts` has image domain configured
- Check that API key has proper permissions

### SEO Issues
- Run `npm run build` locally and check for warnings
- Verify metadata in page source

## Support

For technical issues, please refer to the project documentation.
