# Bework Link Manager API

API REST para gerenciamento de links de campanha com parametros UTM dinamicos.

## Stack

- Node.js + TypeScript + Express
- Prisma + MySQL
- Better Auth para autenticacao via sessao em cookie

## Como rodar

```bash
docker compose up -d
npm install
npx prisma migrate dev
npm run dev
```

## Decisoes de modelagem

### Por que `Parameter` pertence ao usuario e nao ao link?

Parametros UTM como `utm_source=facebook` costumam ser reutilizados em varios
links e projetos do mesmo usuario. Ao associar `Parameter` ao `User`, o mesmo
par `key/value` pode ser criado uma vez e reutilizado pela tabela de juncao
`LinkParameter`.

### Por que `LinkParameter` tem campo `order`?

A ordem dos parametros na query string pode ser importante para padronizacao de
tracking e leitura em ferramentas de analytics. O campo `order` permite montar a
URL final na sequencia definida pelo usuario, independente da ordem fisica no
banco.

### Por que `slug` e unico por usuario?

O slug identifica projetos dentro do contexto de cada usuario. Dois usuarios
diferentes podem ter projetos com o mesmo slug, enquanto a constraint
`@@unique([slug, userId])` garante unicidade apenas no escopo correto.

## Endpoint principal

```http
GET /api/links/:id/generate
```

Monta a URL final combinando `baseUrl`, parametros ordenados por
`LinkParameter.order` e `redirectUrl` quando existir.

Exemplo de resposta:

```json
{
  "url": "https://example.com?utm_source=facebook&utm_medium=cpc&redirect=https%3A%2F%2Flp.example.com"
}
```

## Autenticacao

Usa Better Auth com email/senha e sessao em cookie.

- `POST /api/auth/sign-up/email`: cria usuario
- `POST /api/auth/sign-in/email`: autentica usuario
- `POST /api/auth/sign-out`: encerra sessao
- `GET /api/auth/ok`: health check

Todas as demais rotas exigem cookie de sessao valido.
