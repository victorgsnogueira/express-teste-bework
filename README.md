# Bework Link Manager API

API REST para gerenciamento de links de campanha com parametros dinamicos, como
UTMs e redirect. A proposta e permitir que links sejam montados em tempo de uso,
sem precisar editar manualmente cada URL final.

## Stack

- Node.js + TypeScript
- Express
- Prisma ORM
- MySQL
- Better Auth com sessao em cookie
- Zod para validacao de entrada

## Como rodar

```bash
npm install
cp .env.example .env
docker compose up -d
npx prisma migrate dev
npm run dev
```

Para compilar e rodar a versao gerada:

```bash
npm run build
npm start
```

## Seed do banco

Depois de rodar as migrations, e possivel popular o banco com dados de exemplo:

```bash
npm run seed
```

O seed cria um usuario, um projeto, tres parametros UTM e um link associado aos
parametros.

Credenciais do usuario criado:

```text
email: seed@bework.local
senha: SenhaSeed123!
```

O script e idempotente para os dados desse usuario: se o usuario ja existir, ele
mantem a conta e recria os projetos, parametros e links de exemplo associados a
ela.

## Modelagem das entidades

O sistema foi modelado com a seguinte hierarquia principal:

```text
User -> Project -> Link -> LinkParameter <- Parameter
```

- `User`: dono dos dados da aplicacao. Projetos e parametros pertencem a um
  usuario.
- `Project`: agrupa links de campanha de um usuario. Possui `name` e `slug`.
- `Link`: template reutilizavel de link. Possui `name`, `baseUrl`,
  `redirectUrl` opcional e pertence a um projeto.
- `Parameter`: par chave/valor reutilizavel, como `utm_source=google`, sempre
  dentro do escopo de um usuario.
- `LinkParameter`: tabela de juncao entre links e parametros. Tambem guarda a
  ordem em que os parametros aparecem na URL gerada.

## Decisoes de modelagem

### 1. Ownership centralizado no usuario

Cada usuario deve acessar apenas os proprios dados. Por isso, `Project` e
`Parameter` possuem `userId`. Links sao protegidos pela relacao com projeto:
para acessar um link, a API verifica se o `project.userId` pertence ao usuario
autenticado.

Essa decisao evita que a seguranca dependa de filtros soltos em cada endpoint.
O escopo do dado fica explicito na modelagem e e reforcado nos services.

### 2. `Project` pertence ao usuario e tem slug unico por usuario

Um usuario pode ter mais de um projeto, e projetos precisam ser listaveis. O
`slug` foi modelado com `@@unique([slug, userId])`, nao como unico global.

Assim, dois usuarios diferentes podem criar um projeto com o mesmo slug, como
`campanha-natal`, sem colisao. A unicidade importa apenas dentro do espaco do
proprio usuario.

### 3. `Parameter` pertence ao usuario, nao ao link e nao e global

A alternativa de deixar `Parameter` global foi descartada. Se
`utm_source=google` fosse um registro global, usuarios diferentes poderiam
colidir no mesmo dado ou compartilhar informacao sem perceber. Alem disso, um
usuario nao teria controle real para editar ou remover um parametro que tambem
fosse usado por outros usuarios.

Tambem nao foi escolhido prender `Parameter` diretamente ao link, porque o
requisito pede reutilizacao. Parametros comuns de campanha sao reaproveitados em
varios links do mesmo usuario.

Por isso, `Parameter` tem `userId` e representa um catalogo reutilizavel dentro
da conta do usuario.

### 4. `Parameter` tem unicidade por chave, valor e usuario

A constraint `@@unique([key, value, userId])` impede duplicacao do mesmo par
chave/valor para um usuario, mas permite que usuarios diferentes tenham
parametros iguais.

Isso preserva isolamento e reduz duplicidade sem transformar parametros em
dados globais compartilhados.

### 5. `Link` pertence ao projeto e possui redirect opcional

Links sao os templates de campanha. Cada link tem uma URL base, um nome e
pertence a um projeto. O campo `redirectUrl` e nullable porque nem todo link
precisa redirecionar para uma URL de destino.

Foi escolhido manter `redirectUrl` como campo do proprio `Link`, em vez de criar
uma entidade separada, porque o redirect e um atributo simples e opcional do
template.

### 6. `LinkParameter` resolve a relacao N:N e controla a ordem

Um link pode ter varios parametros, e um parametro pode ser reutilizado em
varios links. Por isso existe a tabela de juncao `LinkParameter`.

O campo `order` foi adicionado para tornar a geracao da URL deterministica. Sem
ele, a ordem dos parametros dependeria da ordem fisica de leitura do banco.

### 7. Cascades e indices foram usados nas relacoes principais

As FKs usam `onDelete: Cascade` para evitar registros orfaos quando um usuario,
projeto ou link e removido.

Tambem foram adicionados indices em colunas consultadas com frequencia, como
`Project.userId`, `Parameter.userId` e `Link.projectId`, para melhorar as
listagens conforme o volume cresce.

### 8. URLs usam `Text`

`baseUrl` e `redirectUrl` usam `@db.Text`, porque URLs reais podem passar de
255 caracteres. A validacao de formato fica na camada da API.

## Como a solucao resolve o problema de escala

O sistema separa o template do link dos parametros reutilizaveis. Em vez de
editar manualmente varias URLs finais, o usuario edita o link, o redirect ou um
parametro uma unica vez.

Quando `GET /api/links/:id/generate` e chamado, a API monta a URL final usando:

- `baseUrl` do link
- parametros associados ao link
- ordem definida em `LinkParameter.order`
- `redirectUrl`, quando existir

Com isso, mudancas em parametros reutilizados passam a valer nas proximas
geracoes de todos os links associados, sem duplicar a mesma informacao em varias
URLs.

## Endpoints principais

As rotas de listagem aceitam paginacao por query string:

```http
GET /api/projects?page=1&perPage=10
```

`page` comeca em `1` e `perPage` aceita no maximo `100`. A resposta das
listagens segue este formato:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

As mesmas listagens tambem aceitam filtros simples:

- `GET /api/projects?search=campanha`: busca em `name` e `slug`
- `GET /api/parameters?search=utm`: busca em `key` e `value`
- `GET /api/parameters?key=utm_source&value=google`: filtra por chave e valor
- `GET /api/projects/:projectId/links?search=facebook`: busca em `name` e
  `baseUrl`
- `GET /api/projects/:projectId/links?hasRedirect=true`: retorna apenas links
  com redirect
- `GET /api/projects/:projectId/links?hasRedirect=false`: retorna apenas links
  sem redirect

### Autenticacao

- `POST /api/auth/sign-up/email`: cria usuario
- `POST /api/auth/sign-in/email`: autentica usuario
- `POST /api/auth/sign-out`: encerra sessao
- `GET /api/auth/ok`: health check do Better Auth

### Projetos

- `POST /api/projects`
- `GET /api/projects?page=1&perPage=10`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Parametros

- `POST /api/parameters`
- `GET /api/parameters?page=1&perPage=10`
- `GET /api/parameters/:id`
- `PUT /api/parameters/:id`
- `DELETE /api/parameters/:id`

### Links

- `POST /api/projects/:projectId/links`
- `GET /api/projects/:projectId/links?page=1&perPage=10`
- `GET /api/links/:id`
- `PUT /api/links/:id`
- `DELETE /api/links/:id`
- `GET /api/links/:id/generate`

Exemplo de resposta do endpoint de geracao:

```json
{
  "url": "https://example.com?utm_source=facebook&utm_medium=cpc&redirect=https%3A%2F%2Flp.example.com"
}
```

Todas as rotas de projetos, parametros e links exigem sessao valida em cookie.
