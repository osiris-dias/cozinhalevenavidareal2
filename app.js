const infoDialog = document.querySelector('#info-dialog');
function showInfo(title, text) {
 document.querySelector('#info-title').textContent = title;
 document.querySelector('#info-body').textContent = text;
 infoDialog.showModal();
}
document.querySelectorAll('dialog').forEach(dialog => {
 dialog.querySelector('.close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => { if(event.target === dialog) { const b=dialog.getBoundingClientRect(); if(event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close(); }});
});
document.querySelector('.dialog-dismiss').addEventListener('click', () => infoDialog.close());
// Mantém os links nativos disponíveis para o script da UTMify.
// Repassa os parâmetros de campanha também se o script externo não carregar.
function checkoutTrackingParams(search, storage) {
 const incoming = new URLSearchParams(search);
 const allowed = key => /^utm_[a-z0-9_]+$/i.test(key) || ['fbclid', 'gclid', 'ttclid', 'src', 'sck', 'xcod'].includes(key);
 const current = new URLSearchParams();
 incoming.forEach((value, key) => { if (allowed(key)) current.set(key, value); });
 const storageKey = 'cozinha_leve_campaign';
 try {
  if (current.size) { storage.setItem(storageKey, current.toString()); return current; }
  const saved = new URLSearchParams(storage.getItem(storageKey) || '');
  saved.forEach((value, key) => { if (allowed(key)) current.set(key, value); });
 } catch (_) { /* O checkout continua funcionando com armazenamento bloqueado. */ }
 return current;
}
let campaignStorage;
try { campaignStorage = window.sessionStorage; } catch (_) {}
const campaignParams = checkoutTrackingParams(window.location.search, campaignStorage);
document.querySelectorAll('.buy[data-plan]').forEach(link => {
 const checkout = window.COZINHA_LEVE?.checkout?.[link.dataset.plan] || link.href;
 try {
  const target = new URL(checkout);
  if (target.protocol !== 'https:') return;
  // Preserva parâmetros que o script externo já tenha acrescentado ao link.
  new URL(link.href).searchParams.forEach((value, key) => target.searchParams.set(key, value));
  campaignParams.forEach((value, key) => { if (!target.searchParams.has(key)) target.searchParams.set(key, value); });
  link.href = target.href;
 } catch (_) { /* Mantém o link HTML original. */ }
});
const info = {
 privacy: ['Privacidade', 'Esta página não solicita cadastro nem dados de pagamento. Utiliza a UTMify e parâmetros de campanha para identificar a origem dos acessos e das vendas. Parâmetros de campanha podem ser mantidos no armazenamento da sessão do navegador e repassados à plataforma de pagamento. Ao concluir uma compra, os dados necessários são tratados pela plataforma de pagamento conforme a política de privacidade dela. O provedor de hospedagem pode processar registros técnicos necessários para oferecer e proteger o acesso.'],
 terms: ['Condições de uso', 'Os materiais são digitais e destinados ao uso pessoal de quem compra. Não é permitida a revenda ou redistribuição dos arquivos. O pacote adquirido inclui apenas os itens descritos na oferta correspondente. Sugestões culinárias não constituem prescrição nutricional. A oferta prevê reembolso integral solicitado em até 7 dias após a compra, pela plataforma de pagamento.']
};
document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => showInfo(...info[button.dataset.info])));
