// Presentation rules shared by every preview page. They mirror
// src/app/code/RSC/Sandbox/ViewModel/TradeProduct.php so both storefronts read the same.

export const pluralise = (unit) => {
  if (!unit || unit === 'each') return unit || '';
  const plural = (w) => (/(s|x|ch|sh)$/.test(w) ? w + 'es' : w + 's');
  if (unit.includes(' of ')) {
    const [head, tail] = unit.split(' of ');
    const words = head.split(' ');
    words.push(plural(words.pop()));
    return words.join(' ') + ' of ' + tail;
  }
  const words = unit.split(' ');
  words.push(plural(words.pop()));
  return words.join(' ');
};

export const perUnit = (unit) => (!unit ? '' : unit === 'each' ? 'each' : 'per ' + unit);

export const money = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n).replace('A$', '$');

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const normaliseSku = (s) => String(s || '').replace(/\s+/g, '').toUpperCase();
