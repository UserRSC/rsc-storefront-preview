// Storefront preview behaviour: demo cart (localStorage), add to cart, quantity stepper,
// mobile menu drawer, SKU search and the cart page. No data leaves the browser.
import { normaliseSku, esc, money } from './lib.js?v=4245788901';
import { productGrid, skuMatch, cartLine, cartTotals } from './templates.js?v=4245788901';

const CART_KEY = 'rsc-preview-cart';
const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const writeCart = (lines) => { try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch { /* private mode */ } renderCount(); };
let catalogue;
const products = async () => (catalogue ??= await (await fetch('data/products.json')).json());

function renderCount() {
  const n = readCart().reduce((s, l) => s + l.qty, 0);
  document.querySelectorAll('[data-testid="cart-count"]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
}

// Centred confirmation card (same markup and classes as the Magento store's success message).
const TICK = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
function closeAdded() { document.querySelector('.rsc-added')?.remove(); }
function showAdded({ title, html, cartLink = true }) {
  closeAdded();
  const el = document.createElement('div');
  el.className = 'rsc-added';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.dataset.testid = 'added-to-cart';
  el.innerHTML = `<div class="rsc-added__backdrop" data-added-close></div>
    <div class="rsc-added__card">
      <span class="rsc-added__icon">${TICK}</span>
      <p class="rsc-added__title">${esc(title)}</p>
      <p class="rsc-added__text">${html}</p>
      <div class="rsc-added__actions">
        ${cartLink ? '<a class="rsc-btn rsc-btn--primary" href="cart.html">View cart</a>' : ''}
        <button type="button" class="rsc-btn rsc-btn--outline" data-added-close>Continue shopping</button>
      </div>
    </div>`;
  document.body.append(el);
  el.querySelector('[data-added-close].rsc-btn')?.focus({ preventScroll: true });
  clearTimeout(showAdded.timer);
  showAdded.timer = setTimeout(closeAdded, 6000);
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-added-close]')) closeAdded(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAdded(); });

async function addToCart(sku, qty) {
  const lines = readCart();
  const line = lines.find((l) => l.sku === sku);
  if (line) line.qty += qty; else lines.push({ sku, qty });
  writeCart(lines);
  const p = (await products()).find((x) => x.sku === sku);
  showAdded({ title: 'Added to cart', html: `${qty} × <strong>${esc(p?.name || sku)}</strong>${p?.perUnit ? ` <span class="rsc-cart-unit">${esc(p.perUnit)}</span>` : ''}` });
}

document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-rsc-add]');
  if (!form) return;
  e.preventDefault();
  const qty = Math.max(1, parseInt(form.querySelector('input[name="qty"]')?.value || '1', 10) || 1);
  addToCart(form.dataset.sku, qty);
});

document.addEventListener('click', (e) => {
  const step = e.target.closest('[data-qty-step]');
  if (step) {
    const input = step.parentElement.querySelector('input');
    input.value = Math.max(1, (parseInt(input.value, 10) || 0) + Number(step.dataset.qtyStep));
  }
  if (e.target.closest('[data-menu-open]')) document.querySelector('#rsc-menu')?.showModal();
  if (e.target.closest('[data-menu-close]')) document.querySelector('#rsc-menu')?.close();
});

// Mark the current category in the navy bar and the drawer.
document.querySelectorAll('.rsc-nav__link, #rsc-menu a').forEach((a) => {
  if (a.href === location.origin + location.pathname) a.setAttribute('aria-current', 'page');
});

async function renderSearch() {
  const root = document.querySelector('[data-search-results]');
  if (!root) return;
  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  document.querySelector('#search').value = q;
  document.querySelector('[data-search-term]').textContent = q ? `Search results for: '${q}'` : 'Search';
  const all = await products();
  const exact = all.find((p) => normaliseSku(p.sku) === normaliseSku(q));
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = all.filter((p) => {
    const hay = `${p.sku} ${p.name} ${p.category}`.toLowerCase();
    return tokens.length && tokens.every((t) => hay.includes(t));
  });
  const ordered = exact ? [exact, ...hits.filter((p) => p !== exact)] : hits;
  root.innerHTML = (exact ? skuMatch(exact) : '') +
    (ordered.length
      ? `<p class="rsc-listing-count">${ordered.length} ${ordered.length === 1 ? 'product' : 'products'}</p>${productGrid(ordered)}`
      : `<p class="rsc-empty">No products match <strong>${esc(q)}</strong>. Try a SKU such as FOAM75MM 24M, or browse a category.</p>`);
}

async function renderCartPage() {
  const root = document.querySelector('[data-cart]');
  if (!root) return;
  const all = await products();
  const lines = readCart().filter((l) => all.some((p) => p.sku === l.sku));
  if (!lines.length) {
    root.innerHTML = '<p class="rsc-empty">Your cart is empty. <a class="rsc-link" href="eps-cladding.html">Browse EPS Cladding</a></p>';
    return;
  }
  const subtotal = lines.reduce((s, l) => s + l.qty * all.find((p) => p.sku === l.sku).price, 0);
  root.innerHTML = `<div class="rsc-cart">
      <div class="rsc-cart__lines">${lines.map((l) => cartLine(l, all.find((p) => p.sku === l.sku))).join('')}
        <div class="rsc-cart__actions"><button type="button" class="rsc-btn rsc-btn--outline" data-update-cart>Update Shopping Cart</button></div>
      </div>
      <aside class="rsc-cart__summary"><h2 class="rsc-pdp__section" style="margin:0 0 .75rem;font:700 1.25rem/1.2 var(--font-heading);color:var(--color-rsc-navy)">Summary</h2>
        ${cartTotals(subtotal)}
        <p class="rsc-buybox__note">Checkout is not part of this design preview. Use the Magento sandbox to place a test order.</p>
      </aside></div>`;
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-update-cart]')) {
    const lines = readCart();
    document.querySelectorAll('[data-role="cart-item-qty"]').forEach((input) => {
      const line = lines.find((l) => l.sku === input.dataset.sku);
      if (line) line.qty = Math.max(1, parseInt(input.value, 10) || 1);
    });
    writeCart(lines);
    renderCartPage();
  }
  const remove = e.target.closest('[data-remove]');
  if (remove) { writeCart(readCart().filter((l) => l.sku !== remove.dataset.remove)); renderCartPage(); }
});

renderCount();
renderSearch();
renderCartPage();
