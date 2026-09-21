const fs = require("fs");
const path = require("path");
const https = require("https");

const PROD_URL = "https://purreayurherbs.com/api/storefront?fresh=1";
const DB_JSON_PATH = path.join(__dirname, "../src/lib/db.json");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith("http")) {
          const u = new URL(url);
          redirectUrl = `${u.origin}${redirectUrl}`;
        }
        return resolve(fetchJson(redirectUrl));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${res.statusCode}`));
      }

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function sync() {
  console.log("Fetching live production data from purreayurherbs.com...");
  try {
    const prodData = await fetchJson(PROD_URL);

    let localDb = {};
    if (fs.existsSync(DB_JSON_PATH)) {
      try {
        localDb = JSON.parse(fs.readFileSync(DB_JSON_PATH, "utf-8"));
      } catch {}
    }

    if (Array.isArray(prodData.products) && prodData.products.length > 0) {
      localDb.products = prodData.products;
      console.log(`✓ Synced ${prodData.products.length} live products with real photos`);
    }

    if (Array.isArray(prodData.categories) && prodData.categories.length > 0) {
      localDb.categories = prodData.categories;
      console.log(`✓ Synced ${prodData.categories.length} live categories`);
    }

    if (prodData.content) {
      localDb.content = { ...(localDb.content || {}), ...prodData.content };
      console.log(`✓ Synced live banners, announcement bar, and footer`);
    }

    if (prodData.settings) {
      localDb.settings = { ...(localDb.settings || {}), ...prodData.settings };
      console.log(`✓ Synced live store settings`);
    }

    if (Array.isArray(prodData.faqs) && prodData.faqs.length > 0) {
      localDb.faqs = prodData.faqs;
      console.log(`✓ Synced ${prodData.faqs.length} live FAQs`);
    }

    if (Array.isArray(prodData.reviews) && prodData.reviews.length > 0) {
      localDb.reviews = prodData.reviews;
      console.log(`✓ Synced ${prodData.reviews.length} live reviews`);
    }

    if (Array.isArray(prodData.blogs) && prodData.blogs.length > 0) {
      localDb.blogs = prodData.blogs;
      console.log(`✓ Synced ${prodData.blogs.length} live blogs`);
    }

    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(localDb, null, 2), "utf-8");
    console.log(`\n🎉 Success! Local db.json has been updated with live production photos and data.`);
    console.log(`Restart your local server (npm run dev) to see the live photos and data on localhost!`);
  } catch (error) {
    console.error("Error syncing production data:", error.message);
  }
}

sync();
