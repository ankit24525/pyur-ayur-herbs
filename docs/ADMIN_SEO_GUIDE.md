# 🌿 Pure Ayur Herbs — Admin SEO User Guide & Playbook

Welcome to the **Official SEO User Guide for Pure Ayur Herbs**. This playbook is designed for store administrators, marketing managers, and catalog editors to help you rank your Ayurvedic remedies on **Google #1 Page**, maximize high-converting **Google Rich Snippets**, and drive organic sales without writing complex code.

---

## 📑 Table of Contents
1. [The 3-Minute Routine for Every Product](#1-the-3-minute-routine-for-every-product)
2. [Google Character Limits & Winning Copy Formulas](#2-google-character-limits--winning-copy-formulas)
3. [1-Click Bulk SEO Auto-Optimizer](#3-1-click-bulk-seo-auto-optimizer)
4. [Search Engine Ownership & Webmaster Verification (Google & Bing)](#4-search-engine-ownership--webmaster-verification)
5. [Google FAQ Accordions (Schema.org `FAQPage`)](#5-google-faq-accordions-faqpage-schema)
6. [Google Image Sitemaps & Image SEO](#6-google-image-sitemaps--image-seo)
7. [Instant Search Engine Crawler Ping API](#7-instant-search-engine-crawler-ping-api)
8. [The Golden Out-of-Stock (OOS) Strategy](#8-the-golden-out-of-stock-oos-strategy)
9. [Official Diagnostic & Testing Tools](#9-official-diagnostic--testing-tools)

---

## 1. The 3-Minute Routine for Every Product

Whenever you create a new herbal product or edit an existing remedy, follow this 6-step checklist:

| Step | Action | Where in Admin | Why It Matters |
|---|---|---|---|
| **1** | Enter product name, concern, price, and clear image | `Products > Edit > Product Info` | Forms the foundation of Google structured data schemas. |
| **2** | Switch to the **SEO Settings** tab | `Products > Edit > SEO Settings` | Displays live Google mobile search preview & character gauges. |
| **3** | Click **"⚡ Auto-Generate SEO"** | `SEO Settings` | Instantly drafts high-CTR title, description, and focus keywords. |
| **4** | Check the **Real-Time SEO Quality Score** | `SEO Settings` | Aim for **100/100**. Ensure title is 45-60 chars and description is 120-160 chars. |
| **5** | Add 2 to 3 **Product FAQs** | `SEO Settings > Product FAQs` | Converts your questions into expandable accordions on Google SERPs. |
| **6** | Save & Click **"🚀 Ping Google & Bing"** | `Admin Panel > SEO (Top Bar)` | Informs Googlebot to crawl and index your updated page right away. |

---

## 2. Google Character Limits & Winning Copy Formulas

Search engines have strict pixel and character widths. If your text is too short, you miss customer searches. If your text is too long, Google cuts it off with an ugly `...`.

### A. Meta Title Tag (The Clickable Blue Link)
* **Target Length**: **45 to 60 characters** (Green Meter in Admin)
* **Google Cut-off**: > 60 characters
* **Winning Formula**:
  ```text
  [Product Name] - [Primary Benefit / Target Concern] | Pure Ayur Herbs
  ```
* **Real-World Examples**:
  * 🟢 `Madhunashi Sugar Care - Control Blood Sugar Naturally | Pure Ayur Herbs` *(59 chars - Perfect)*
  * 🟢 `Virja Powder for Men - Stamina, Energy & Strength Booster | Pure Ayur Herbs` *(58 chars - Perfect)*
  * 🟢 `Ayurvedic Fat Burner Juice - Natural Belly Weight Detox | Pure Ayur Herbs` *(60 chars - Perfect)*

### B. Meta Description Tag (The Sales Snippet Below Title)
* **Target Length**: **120 to 160 characters** (Green Meter in Admin)
* **Google Cut-off**: > 160 characters
* **Winning Formula**:
  ```text
  Buy authentic [Product] online (₹[Price]). 100% AYUSH Certified herbal remedy for [Concern]. Formulated by Vaidyas. Free Priority Delivery across India!
  ```
* **Real-World Example**:
  * 🟢 `Buy authentic Virja Powder online (₹1,499). 100% AYUSH Certified herbal formula for men's stamina & vitality. Pure herbs with Free Priority Delivery!` *(155 chars - Perfect)*

### C. Do's and Don'ts Checklist
* ✅ **DO**: Always include the price `₹[price]`, `100% AYUSH Certified`, and the brand name `| Pure Ayur Herbs`.
* ✅ **DO**: Use action-oriented verbs: *Buy, Shop, Control, Boost, Relieve, Naturally*.
* ❌ **DON'T**: Stuff keywords: `buy virja best virja buy online price cheap offer` *(Google penalizes spammy keyword stuffing)*.
* ❌ **DON'T**: Duplicate identical titles across different products. Every single remedy must have a unique title!

---

## 3. 1-Click Bulk SEO Auto-Optimizer

### What is it?
In `Admin Panel > SEO`, there is a dedicated **Catalog SEO Readiness Scorecard** with a **"⚡ 1-Click Bulk Auto-Fill Missing SEO"** button.

### When should you use it?
* After adding multiple new remedies at once.
* After importing a batch of products from CSV.
* Whenever the progress bar is below 100%.

### Is it safe?
* **100% Non-Destructive**: It **never** changes or overwrites any product where you have already written a custom title or description.
* It only populates products currently relying on fallbacks.
* Generates tailored text using each item's actual title, price in INR, and health concern.

---

## 4. Search Engine Ownership & Webmaster Verification

To see what keywords people search to find your website, monitor indexing, and fix search errors, you must verify your site in **Google Search Console** and **Bing Webmaster Tools**.

### A. Google Search Console (GSC) Setup (1 Minute)
1. Go to [Google Search Console](https://search.google.com/search-console) and log in with your Google account.
2. Select **"URL prefix"** and enter `https://www.purreayurherbs.com`.
3. Under **"Other verification methods"**, click **"HTML tag"**.
4. You will see a snippet like `<meta name="google-site-verification" content="ABC...123" />`.
5. Copy the tag or just the token code (`ABC...123`).
6. Go to **Admin Panel > SEO** and paste it into the **Google Search Console Verification Tag / Token** field.
7. Click **"Save SEO Configuration"**. Pure Ayur Herbs automatically injects it into `<head>` across all pages!
8. Switch back to Google Search Console and click **"Verify"**. Your site is now officially verified.

### B. Bing Webmaster Tools Setup (1 Minute)
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters) and sign in.
2. Add your site: `https://www.purreayurherbs.com`.
3. Choose **"HTML Meta Tag"** verification.
4. Copy the `msvalidate.01` token.
5. Paste it into the **Bing Webmaster Tools Verification Tag / Token** field in Admin > SEO and click **"Save SEO Configuration"**.
6. Switch back to Bing and click **"Verify"**.

---

## 5. Google FAQ Accordions (Schema.org `FAQPage`)

### Why FAQ Accordions Drive Huge Sales
When customers search Google for health topics (e.g. *"how to take sugar powder"*), Google can display **expandable question-and-answer accordions** directly under your product listing.
* **Benefits**:
  1. Expands your listing height by **up to 2.5x** on mobile screens, pushing competitor listings below the fold.
  2. Eliminates customer hesitation before they even click onto your site.

### How to Add Product FAQs
1. Go to `Admin Panel > Products > Edit Product > SEO Settings`.
2. Scroll to **"Product FAQs & Google FAQ Accordion Schema"**.
3. Click **"+ Add FAQ"**.
4. Enter practical questions and answers:
   * **Question 1 (Dosage)**: *"How and when should I consume this remedy?"*
     * **Answer**: *"Take 1 to 2 scoops/capsules twice daily with lukewarm water 30 minutes before meals."*
   * **Question 2 (Safety)**: *"Is this remedy 100% herbal and safe?"*
     * **Answer**: *"Yes, all Pure Ayur Herbs formulas are 100% AYUSH Certified, chemical-free, and crafted under GMP standards."*
   * **Question 3 (Results)**: *"When can I expect results?"*
     * **Answer**: *"Most users experience noticeable benefits within 2 to 3 weeks of consistent daily usage."*
5. Save the product. The system automatically creates both the frontend customer accordion and the Google `FAQPage` JSON-LD schema!

---

## 6. Google Image Sitemaps & Image SEO

Images are a massive source of free e-commerce traffic through **Google Images**.

* **Automated Image Sitemap**: Pure Ayur Herbs automatically extracts every product's primary image, secondary gallery photos, and blog post covers into `https://www.purreayurherbs.com/sitemap.xml`.
* **Automated Alt Descriptions**: Every catalog card and hero stage image is automatically equipped with descriptive alt tags (e.g. `[Product Name] - 100% Certified Authentic Ayurvedic Formula | Pure Ayur Herbs`).
* **Admin Best Practice**: Always upload clear, well-lit, authentic product images with clean backgrounds.

---

## 7. Instant Search Engine Crawler Ping API

Normally, Googlebot takes days or weeks to discover new products or price updates.

With the **Search Engine Crawler Ping API**:
* Click the **"🚀 Ping Google & Bing"** button in the header of `Admin Panel > SEO`.
* The server instantly dispatches HTTP notification requests to Google's ping gateway and Bing's ping service with your updated sitemap.
* **When to click it**:
  * After launching a new product.
  * After editing product prices, titles, or descriptions.
  * After publishing a new blog article.

---

## 8. The Golden Out-of-Stock (OOS) Strategy

### ⚠️ The #1 Rule: NEVER Delete an Out-of-Stock Product Page!

* **What happens if you delete a product?**
  * The link becomes a `404 Not Found` error.
  * Google permanently deletes the page from its search index.
  * You lose all keywords, backlinks, and domain authority you worked months to build.

### How Pure Ayur Herbs Protects You:
* Set the stock to `0` or disable unavailable variants in the product editor.
* The page remains live at `200 OK` so Google keeps ranking it.
* Googlebot is signaled with Schema.org `availability: OutOfStock` (100% compliant with Google Merchant Guidelines).
* The "Buy Now" button automatically transforms into a **"🔔 Notify Me on WhatsApp When Restocked"** button.
* Customers can send their phone number or start a pre-filled WhatsApp chat, turning a zero-inventory moment into a qualified customer lead!

---

## 9. Official Diagnostic & Testing Tools

Direct shortcuts are available in `Admin Panel > SEO`:

| Tool | Link | What It's For |
|---|---|---|
| **Google Search Console** | [search.google.com](https://search.google.com/search-console) | View impressions, submit sitemap, and check ranking keywords. |
| **Google Rich Results Test** | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) | Test your product URLs to verify Gold Star ratings, Price, and FAQ accordions. |
| **Google PageSpeed Insights** | [pagespeed.web.dev](https://pagespeed.web.dev/) | Test mobile speed and Core Web Vitals (LCP, INP, CLS). |
| **Live Dynamic Sitemap** | `/sitemap.xml` | View all product, category, and blog URLs fed to search engines. |
| **Crawl Directives** | `/robots.txt` | View bot crawl permissions and protected endpoints. |

---

*Pure Ayur Herbs Enterprise SEO Engine — Designed for Sustainable Organic Growth.*
