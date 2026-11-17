# Interkombo Logistics — Website & Admin Dashboard

Built by L.C Digital Solution WebCraft Studios.

## What's inside

| File / folder | What it is |
|---|---|
| `index.html` | Public website (home, services, cross-border, quote calculator, tracking, about, contact) |
| `sitemap.xml`, `robots.txt` | For Google: sitemap of the site; robots keeps the admin page out of search |
| `admin.html` | Admin dashboard (also reachable from the small 🔒 in the website footer) |
| `assets/js/store.js` | Data layer — connects to Supabase (content, quotes, shipments, messages, subscribers, logins) |
| `assets/js/app.js` | Website logic |
| `assets/js/admin.js` | Dashboard logic |
| `assets/js/icons.js` | Icon set |
| `assets/css/` | Styles (`base.css` shared, `site.css` website, `admin.css` dashboard) |
| `assets/img/` | Logo (light + dark versions), favicon |

It is a plain static site: no build step. Upload the folder to any host (Vercel, Cloudflare Pages, cPanel `public_html`).

## Database (Supabase)

- Project: **interkombo-logistics** (organisation "Interkombo"), URL `https://hnagbyslldklisatkbkm.supabase.co`
- The website uses the public *publishable* key (in `store.js`). Security is enforced by row-level security in the database:
  - Visitors can only **submit** quotes, messages and newsletter sign-ups, read website content, and look up one shipment by its tracking number (customer name hidden).
  - Only admins can read, edit or delete records and change website content.
- Tables: `site_content`, `quotes`, `shipments`, `messages`, `subscribers`, `admins`.

## Admin login

- Email: zvikoeshumba@gmail.com (password set by the owner; change it in **Settings → Your password**)
- To add another admin: they create an account on the login page ("Need access? Create an account"), then an existing admin adds their email in **Settings → Admins**.

## When the domain is connected

1. Point the domain at the hosting (Vercel/Cloudflare).
2. In Supabase → **Authentication → URL Configuration**, set **Site URL** to the new domain and add it to **Redirect URLs**. This makes "Forgot password" emails work.
3. In `sitemap.xml`, `robots.txt` and the `canonical` line in `index.html`, replace `https://interkombo-logistics.vercel.app` with the new domain, then submit the sitemap in Google Search Console.

## Notes

- The three promo codes (MOVE10, BORDER500, MIDWEEK15) and the testimonials are samples. Replace them in the dashboard.
- Photos are added in the dashboard by pasting an image link (Site content, Services, Promotions → popup photo).
