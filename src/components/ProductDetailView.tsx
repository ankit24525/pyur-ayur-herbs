import Link from "next/link";
import { ProductDetail, productDetails } from "@/lib/product-detail-data";

function Stars({ rating }: { rating: number }) {
  return <span className="text-[#99B949]">★★★★★</span>;
}

export function ProductDetailView({ product }: { product: ProductDetail }) {
  const saving = product.mrp - product.price;

  return (
    <main className="bg-[#fbfcf5] text-[#1b251d]">
      <div className="sticky top-0 z-40 bg-[#2f4f1f] px-4 py-2 text-center text-sm font-semibold tracking-wide text-white">
        PAYDAY Sale Ends Soon • Extra 10% Off With Pyur Coins
      </div>

      <section className="mx-auto max-w-[1320px] px-4 py-4 text-sm text-[#66715c] lg:px-0">
        <Link href="/" className="hover:text-[#6f9131]">Home</Link>
        <span className="mx-2">/</span>
        <span>Product</span>
        <span className="mx-2">/</span>
        <span className="font-medium text-[#1b251d]">{product.name}</span>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-8 px-4 pb-12 lg:grid-cols-[56%_44%] lg:px-0">
        <div className="grid gap-4 lg:grid-cols-[86px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
            {product.gallery.map((item, index) => (
              <button key={item} className="grid size-[78px] shrink-0 place-items-center rounded-lg border border-[#d7ddca] bg-white p-2 shadow-sm">
                <img src={index === 0 ? product.image : item} alt="thumbnail" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>

          <div className="order-1 rounded-2xl border border-[#d7ddca] bg-[#eef5df] p-8 lg:order-2">
            <div className="relative mx-auto grid min-h-[480px] max-w-[620px] place-items-center">
              <span className="absolute right-0 top-0 rounded bg-[#c8dca3] px-3 py-1 text-sm font-bold text-[#253b14]">{product.discount}</span>
              <img src={product.image} alt={product.name} className="h-[430px] w-full object-contain" />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(50,70,30,0.10)] lg:p-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#789939]">{product.category}</p>
          <h1 className="text-3xl font-black leading-tight lg:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base leading-7 text-[#586452]">{product.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-[#f0f6e5] px-3 py-1 text-sm font-semibold"><Stars rating={product.rating} /> {product.rating}/5 ({product.reviews})</div>
            <div className="rounded-full bg-[#fff6d9] px-3 py-1 text-sm font-semibold text-[#6b5700]">Earn 🟡 {product.coins} Coins</div>
          </div>

          <div className="mt-7 border-y border-[#eceee6] py-5">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black">₹{product.price}</span>
              <span className="pb-1 text-xl text-[#888] line-through">₹{product.mrp}</span>
              <span className="pb-1 text-base font-bold text-[#6f9131]">Save ₹{saving}</span>
            </div>
            <p className="mt-2 text-sm text-[#66715c]">Inclusive of all taxes. Free delivery on prepaid orders.</p>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-[#a8bd76] bg-[#f8fbef] p-4">
            <p className="font-bold">Best Price</p>
            <p className="mt-1 text-sm text-[#586452]">Use coupon <b>PYUR10</b> for additional launch discount.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[130px_1fr]">
            <div className="flex h-14 items-center justify-between rounded-lg border border-[#d7ddca] px-4 text-lg font-bold">
              <button>-</button><span>1</span><button>+</button>
            </div>
            <button className="h-14 rounded-lg bg-[#80a33a] text-lg font-black tracking-wide text-white hover:bg-[#66872d]">ADD TO CART</button>
          </div>
          <button className="mt-3 h-14 w-full rounded-lg bg-[#252525] text-lg font-black tracking-wide text-white hover:bg-black">BUY NOW</button>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["🚚 Delivered by 3 - 4 Aug", "🌿 Pure Herbs", "🔒 Secure Checkout"].map((item) => (
              <div key={item} className="rounded-lg bg-[#f5f5f0] px-3 py-3 text-center text-sm font-semibold text-[#56604f]">{item}</div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-6 px-4 pb-16 lg:grid-cols-2 lg:px-0">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Key Benefits</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {product.benefits.map((benefit) => <div key={benefit} className="rounded-xl bg-[#f3f8e8] p-4 font-semibold">✓ {benefit}</div>)}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Ingredients</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {product.ingredients.map((ingredient) => <span key={ingredient} className="rounded-full border border-[#b7c986] px-4 py-2 font-semibold">{ingredient}</span>)}
          </div>
          <div className="mt-6 space-y-3 text-[#586452]">
            <details open className="rounded-lg border p-4"><summary className="cursor-pointer font-bold text-[#1b251d]">How to use</summary><p className="mt-2">Take as directed on pack or as advised by your wellness expert.</p></details>
            <details className="rounded-lg border p-4"><summary className="cursor-pointer font-bold text-[#1b251d]">Shipping & returns</summary><p className="mt-2">Fast delivery, secure packaging and simple replacement support.</p></details>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-20 lg:px-0">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-black">You may also like</h2>
          <Link href="/" className="font-bold text-[#c9704c]">View all</Link>
        </div>
        <div className="grid grid-flow-col auto-cols-[calc((100vw-50px)/2)] gap-3 overflow-x-auto pb-2 md:auto-cols-[calc((100vw-60px)/3)] lg:grid-cols-4 lg:auto-cols-fr lg:gap-6 lg:overflow-visible">
          {productDetails.map((item) => (
            <Link key={item.slug} href={`/products/${item.slug}`} className="overflow-hidden rounded-lg border border-[#DDDDD9] bg-white">
              <div className="relative bg-[#eef5df] p-5"><span className="absolute right-2 top-2 rounded bg-[#c8dca3] px-2 text-sm font-bold">{item.discount}</span><img src={item.image} alt={item.name} className="h-[260px] w-full object-contain" /></div>
              <div className="p-3"><h3 className="min-h-[48px] text-lg">{item.name}</h3><p className="mt-3 text-2xl font-black">₹{item.price} <span className="text-base font-normal text-[#888] line-through">{item.mrp}</span></p></div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
