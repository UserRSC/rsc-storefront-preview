// Markup for the static storefront preview. Runs at build time (Node) and in the browser
// (search results, cart). It uses the same rsc-* classes as the RSC/hyva .phtml templates,
// so all styling comes from src/app/design/frontend/RSC/hyva/web/tailwind/rsc/*.css.
import { esc, money } from './lib.js?v=4245788901';

export const NOTICE = '<strong style="font-weight:700">Sandbox — test orders only.</strong> Design preview with demo prices and stock. No payment is taken and nothing is delivered.';

const badge = (p) => `<span class="${esc(p.availability.class)}" data-availability="${esc(p.availability.code)}">${esc(p.availability.label)}</span>`;

export function productCard(p) {
  const facts = p.facts.map((f) => `<span class="rsc-chip">${esc(f.value)}</span>`).join('');
  const buy = p.inStock
    ? `<div class="rsc-card__actions">
         <label class="sr-only" for="qty-${esc(p.id)}">Quantity (${esc(p.unitPlural || 'items')})</label>
         <span class="rsc-qty rsc-qty--sm"><input id="qty-${esc(p.id)}" type="number" name="qty" value="1" min="1" step="1" inputmode="numeric" title="Quantity (${esc(p.unitPlural)})"></span>
         <button class="rsc-btn rsc-btn--primary" data-addto="cart" aria-label="Add to Cart ${esc(p.name)}">Add to Cart</button>
       </div>`
    : `<p class="rsc-card__stock">Out of stock: check back soon</p>`;
  const open = p.inStock ? `<form class="rsc-card" data-sku="${esc(p.sku)}" data-rsc-add>` : `<div class="rsc-card" data-sku="${esc(p.sku)}">`;
  const close = p.inStock ? '</form>' : '</div>';
  return `${open}
    <a href="${esc(p.url)}" class="rsc-card__media" tabindex="-1" aria-hidden="true">
      <img src="${esc(p.image)}" alt="${esc(p.name)}" width="500" height="500" loading="lazy">
    </a>
    <div class="rsc-card__body">
      <div class="rsc-card__meta"><span class="rsc-card__sku">SKU ${esc(p.sku)}</span>${badge(p)}</div>
      <a class="rsc-card__name" href="${esc(p.url)}">${esc(p.name)}</a>
      ${facts ? `<div class="rsc-chips">${facts}</div>` : ''}
      <div class="rsc-card__price">
        <div class="rsc-price-line">
          <span class="rsc-price-line__amount">${money(p.price)}</span>
          <span class="rsc-price-line__tax">inc. GST</span>
          ${p.perUnit ? `<span class="rsc-price-line__unit">${esc(p.perUnit)}</span>` : ''}
        </div>
      </div>
      ${buy}
    </div>
  ${close}`;
}

export const productGrid = (products, extra = '') =>
  `<ul class="rsc-grid ${extra}" style="list-style:none;margin:0;padding:0">${products.map((p) => `<li>${productCard(p)}</li>`).join('')}</ul>`;

export function skuMatch(p) {
  const facts = p.facts.map((f) => `<span class="rsc-chip">${esc(f.value)}</span>`).join('');
  return `<section class="rsc-sku-match" aria-labelledby="rsc-sku-match-title" data-testid="sku-match" data-sku="${esc(p.sku)}">
    <a href="${esc(p.url)}" tabindex="-1" aria-hidden="true"><img src="${esc(p.image)}" alt="" width="240" height="240"></a>
    <div style="display:grid;gap:.375rem;min-width:0">
      <p class="rsc-eyebrow">Exact SKU match</p>
      <a id="rsc-sku-match-title" class="rsc-sku-match__name" href="${esc(p.url)}">${esc(p.name)}</a>
      <div class="rsc-pdp__meta"><span class="rsc-badge rsc-badge--sku">SKU&nbsp;${esc(p.sku)}</span>${badge(p)}${facts}</div>
      <div class="rsc-price-line"><span class="rsc-price-line__amount">${money(p.price)}</span><span class="rsc-price-line__tax">inc. GST</span>${p.perUnit ? `<span class="rsc-price-line__unit">${esc(p.perUnit)}</span>` : ''}</div>
    </div>
    <div class="rsc-sku-match__buy">
      ${p.inStock
        ? `<form class="rsc-card__actions" style="padding:0" data-sku="${esc(p.sku)}" data-rsc-add>
            <label class="sr-only" for="rsc-sku-match-qty">Quantity (${esc(p.unitPlural)})</label>
            <span class="rsc-qty rsc-qty--sm"><input id="rsc-sku-match-qty" type="number" name="qty" value="1" min="1" step="1" inputmode="numeric"></span>
            <button type="submit" class="rsc-btn rsc-btn--primary">Add to Cart</button>
          </form>`
        : badge(p)}
    </div>
  </section>`;
}

export function productPage(p) {
  const facts = p.facts.map((f) => `<div class="rsc-chip"><dt style="display:inline">${esc(f.label)}:</dt> <dd style="display:inline;margin:0"><b>${esc(f.value)}</b></dd></div>`).join('');
  const rows = [{ label: 'SKU', value: p.sku }, ...(p.perUnit ? [{ label: 'Sales unit', value: p.perUnit[0].toUpperCase() + p.perUnit.slice(1) }] : []), ...p.specs];
  const buy = p.inStock
    ? `<form class="rsc-buybox__row" data-sku="${esc(p.sku)}" data-rsc-add id="product_addtocart_form">
        <div>
          <span class="rsc-qty">
            <button type="button" data-qty-step="-1" aria-label="Decrease quantity">&minus;</button>
            <label for="qty-pdp" class="sr-only">Quantity</label>
            <input id="qty-pdp" name="qty" type="number" value="1" min="1" step="1" inputmode="numeric">
            <button type="button" data-qty-step="1" aria-label="Increase quantity">+</button>
          </span>
          ${p.unitPlural ? `<span class="rsc-qty-caption">Quantity in ${esc(p.unitPlural)}</span>` : ''}
        </div>
        <button type="submit" class="rsc-btn rsc-btn--primary" id="product-addtocart-button" data-addto="cart"><span>Add to Cart</span></button>
      </form>
      <p class="rsc-buybox__note">Design preview: demo price and stock. Test checkout runs in the Magento sandbox.</p>`
    : `<p class="rsc-card__stock" style="font-size:1rem">This product is out of stock. Demo stock level for design review.</p>`;
  return `
  <nav class="rsc-breadcrumbs" aria-label="Breadcrumb"><a href="./">Home</a> / <a href="${esc(p.categoryUrl)}">${esc(p.category)}</a> / <span>${esc(p.name)}</span></nav>
  <section class="rsc-pdp" aria-label="Product Info">
    <div class="rsc-pdp__gallery"><img src="${esc(p.image)}" alt="${esc(p.name)}" width="1000" height="1000"></div>
    <div class="rsc-pdp__info" data-sku="${esc(p.sku)}">
      <div>
        <h1 class="rsc-pdp__title page-title">${esc(p.name)}</h1>
        <div class="rsc-pdp__meta" style="margin-top:.75rem">
          <span class="rsc-badge rsc-badge--sku" data-testid="pdp-sku">SKU&nbsp;${esc(p.sku)}</span>
          <span class="${esc(p.availability.class)}" data-testid="${p.availability.code === 'out-of-stock' ? 'pdp-out-of-stock' : 'pdp-availability'}" data-availability="${esc(p.availability.code)}">${esc(p.availability.label)}</span>
          ${p.perUnit ? `<span class="rsc-badge">Sold ${esc(p.perUnit)}</span>` : ''}
        </div>
      </div>
      ${facts ? `<dl class="rsc-chips" aria-label="Size and pack">${facts}</dl>` : ''}
      <div class="rsc-buybox">
        <div class="rsc-price-line rsc-price-line--lg" role="group" aria-label="Price">
          <span class="rsc-price-line__amount price">${money(p.price)}</span>
          <span class="rsc-price-line__tax">inc. GST</span>
          ${p.perUnit ? `<span class="rsc-price-line__unit" data-testid="pdp-unit">${esc(p.perUnit)}</span>` : ''}
        </div>
        ${buy}
      </div>
      ${p.short ? `<div class="rsc-pdp__summary"><p>${esc(p.short)}</p></div>` : ''}
    </div>
  </section>
  <div class="rsc-pdp-details">
    <section class="rsc-pdp__section"><h2>Specifications</h2>
      <table class="rsc-specs" data-testid="pdp-specs">${rows.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td>${esc(r.value)}</td></tr>`).join('')}</table>
    </section>
    <section class="rsc-pdp__section rsc-prose"><h2>Description</h2>${p.description}</section>
  </div>`;
}

export function cartLine(line, p) {
  return `<article class="rsc-cart-line" data-sku="${esc(p.sku)}">
    <a href="${esc(p.url)}" class="rsc-cart-line__media"><img src="${esc(p.image)}" alt="" width="96" height="96"></a>
    <div class="rsc-cart-line__info">
      <a class="rsc-card__name" href="${esc(p.url)}">${esc(p.name)}</a>
      <div class="rsc-cart-meta" data-testid="cart-item-meta">
        <span class="rsc-badge rsc-badge--sku">SKU&nbsp;${esc(p.sku)}</span>
        ${badge(p)}
        ${p.facts.map((f) => `<span>${esc(f.value)}</span>`).join('')}
      </div>
      <p class="rsc-cart-line__price">${line.qty} × ${money(p.price)} <span class="rsc-cart-unit" data-testid="cart-item-unit">${esc(p.perUnit)}</span></p>
    </div>
    <div class="rsc-cart-line__qty">
      <label>
        <span class="sr-only">Qty</span>
        <input type="number" min="1" step="1" inputmode="numeric" value="${line.qty}" data-role="cart-item-qty" data-sku="${esc(p.sku)}" class="rsc-cart-line__input">
        ${p.unitPlural ? `<span class="rsc-qty-caption">Quantity in ${esc(p.unitPlural)}</span>` : ''}
      </label>
      <button type="button" class="rsc-link" data-remove="${esc(p.sku)}">Remove</button>
    </div>
    <p class="rsc-cart-line__total">${money(line.qty * p.price)}</p>
  </article>`;
}

export const cartTotals = (subtotal) => `
  <dl class="rsc-cart-totals" data-testid="cart-totals">
    <div><dt>Subtotal</dt><dd>${money(subtotal)}</dd></div>
    <div><dt>GST included</dt><dd>${money(subtotal / 11)}</dd></div>
    <div class="rsc-cart-totals__grand"><dt>Total inc. GST</dt><dd>${money(subtotal)}</dd></div>
  </dl>`;
