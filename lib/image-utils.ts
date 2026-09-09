/**
 * Hosts liberados em next.config.js (`images.domains` +
 * `images.remotePatterns`) — mantido em sincronia manual com aquele
 * arquivo. Se adicionar um host novo lá, adicione aqui também.
 */
const ALLOWED_IMAGE_HOSTS = [
  "lirp.cdn-website.com",
  "images.unsplash.com",
  "www.dipilatti.com.br",
  "img-estoquenow.s3.amazonaws.com",
];

function isAllowedHostname(hostname: string): boolean {
  return ALLOWED_IMAGE_HOSTS.includes(hostname) || hostname.endsWith(".supabase.co");
}

/**
 * Valida se uma string é utilizável como `src` de next/image sem
 * derrubar a página.
 *
 * Um `item.image ? ... : ...` (ou `.filter(Boolean)`) não é suficiente:
 * ele só checa se a string existe, não se ela aponta pra um host
 * liberado. Isso mordeu de verdade — o antigo fallback de carrinho
 * (`https://via.placeholder.com/300`, nunca liberado aqui e que nem
 * existe mais como serviço) ficou gravado em carrinhos já salvos no
 * localStorage de quem acessou antes da correção, e pode estar gravado
 * também dentro do JSONB `itens` de pedidos já criados no banco. Pra
 * essas strings, `Boolean("https://via.placeholder.com/300")` é
 * `true` — o guard antigo deixava passar, o next/image recusava o
 * host em runtime e derrubava a página inteira em vez de só não
 * mostrar a foto.
 *
 * Um caminho relativo (ex.: "/foo.jpg") sempre passa: na pior hipótese
 * dá um 404 no otimizador de imagem (ícone de imagem quebrada), o que
 * não é o mesmo tipo de crash que uma URL absoluta com host não
 * configurado.
 */
export function isValidImageUrl(url?: string | null): url is string {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return true;
  try {
    return isAllowedHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}
