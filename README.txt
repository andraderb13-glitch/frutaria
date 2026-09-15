FRUTARIA - FRONTEND

Este pacote contém somente o FRONTEND.
O BACKEND NÃO FOI ALTERADO.

ARQUIVOS
- home.html: página principal, catálogo e popups.
- tudo_lindo.css: visual da página.
- leva_e_tras.js: comunicação com a API.
- img/fruteriaimg.png: logo original.

API USADA
Por padrão o JavaScript está configurado para:
https://localhost:7190/api

Se a API estiver usando a porta HTTP 5217, altere no início de leva_e_tras.js:
const API_BASE = "http://localhost:5217/api";

IMPORTANTE SOBRE CORS
O backend enviado não possui configuração de CORS no Program.cs.
Por isso, se o navegador bloquear as requisições, será necessário executar o frontend por uma origem permitida/configurada no ambiente do professor, ou adicionar CORS ao backend.
Como foi solicitado que o backend não seja alterado, este pacote não faz nenhuma alteração nele.

FUNCIONALIDADES DO FRONT
- Lista frutas diretamente de GET /api/frutas.
- Mostra categoria, preço e estoque.
- Atualiza a lista quando novos produtos forem cadastrados no banco.
- Carrega clientes de GET /api/clientes no momento da compra.
- Registra venda em POST /api/vendas.
- Pop-up Sobre com história fictícia e engraçada.
- Pop-up Contato com informações genéricas.
- Botão Atualizar para buscar os dados mais recentes da API.


ATUALIZAÇÃO
- Adicionada caixa de pesquisa de frutas (nome ou categoria).
- O frontend usa a API em https://localhost:7190/api, conforme o launchSettings.json do backend enviado.
- Se aparecer ERR_CONNECTION_REFUSED, abra o backend no Visual Studio e execute o perfil https.
- O backend não foi alterado.
- Se depois de iniciar o backend aparecer erro de CORS no Console do navegador, isso é uma configuração do backend; como combinado, este frontend não modifica o backend.
