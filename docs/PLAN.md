# PLANO DE IMPLEMENTAÇÃO: Evolução Nossa Casa (V4 - Full Stack)

Este plano foi criado na **Fase 1** da orquestração. A implementação só avançará após a aprovação do usuário.

## 1. Escopo das Novas Funcionalidades

O aplicativo fará a transição de um MVP local (LocalStorage) para um aplicativo SaaS/Fintech colaborativo com back-end em tempo real e funcionalidades de IA/Automação.

### 1.1. Autenticação e Colaboração (Backend)
- **Login:** Suporte a Login via Google e Email/Senha (Recomendação: Firebase Auth ou Supabase).
- **Casas Colaborativas (Multiplayer):** Capacidade de criar uma "Casa" e convidar outros usuários via e-mail. Ambos poderão ler/escrever dados simultaneamente.

### 1.2. Importação Inteligente (Web Scraping / IA)
- **Importação por Link:** Colar um link de e-commerce e automaticamente extrair: Título, Descrição, Fotos do anúncio e Preço ao vivo.
- **Importação por Foto:** Tirar uma foto ou enviar imagem e usar IA (Visão Computacional) para identificar o produto, estimar o preço e sugerir lojas.
- **Comparação de Preços:** (Opcional avançado) Exibir variações de preço para o mesmo produto extraído do link.

### 1.3. UI/UX Avançada (Frontend)
- **Exibições Financeiras no Topo:** Reorganizar a Home para que o Progresso e Desejos fiquem sempre em destaque logo no topo da tela inicial.
- **Visualização Flexível:** Alternância entre visualização em Lista (List) e em Grade (Grid).
- **Imagens nos Produtos:** Exibir a imagem do produto diretamente no card da lista/grade.
- **Modal de Detalhes (Large Card):** Ao clicar num produto, abrir um modal expansivo elegante com foto grande, histórico de preços, descrição e botões de ação.
- **Edição de Itens:** Adicionar fluxo claro para alterar nome, categoria, preço ou excluir um item.

---

## 2. Seleção de Stack Tecnológico

Para atingir esses objetivos, precisaremos integrar novas ferramentas ao stack atual (React + Vite + Capacitor):

- **Banco de Dados & Autenticação:** `Supabase` (Recomendado pela facilidade com Postgres e Auth) ou `Firebase`.
- **Extração de Links (Scraping):** Integração com microserviços serverless (Edge Functions) para fazer scrape dinâmico usando Cheerio/Puppeteer ou Apify.
- **Análise de Imagens:** OpenAI Vision API ou Gemini Pro Vision para reconhecer objetos enviados por foto.
- **Gerenciamento de Estado:** Transição do estado local (useState) para um estado remoto sincronizado (React Query ou assinaturas Supabase/Firebase).

---

## 3. Fases de Implementação (Pós-Aprovação)

Se aprovado, dividiremos o trabalho na Fase 2 com múltiplos agentes trabalhando em paralelo:

### Fase 2A: Fundação e Backend (`database-architect`, `security-auditor`)
1. Configurar projeto Supabase/Firebase.
2. Definir schema de tabelas e modelos de dados (Users, Houses, Items).
3. Configurar regras de segurança baseadas em Row Level Security (RLS) para proteger a colaboração.
4. Implementar serviço de Autenticação (Login UI e Providers).

### Fase 2B: Inteligência e Importação (`backend-specialist`)
1. Construir APIs/Cloud Functions para extrair metadados e fotos de links inseridos.
2. Construir APIs para envio de fotos e comunicação com IA para leitura do produto.

### Fase 2C: UI/UX e Frontend Core (`frontend-specialist`)
1. Reorganizar cabeçalho da dashboard para priorizar as métricas financeiras.
2. Desenvolver o sistema de listagem com toggle Grade/Lista.
3. Desenvolver o Modal de Detalhes (Card Grande) do produto e formulários de Edição.
4. Conectar a interface à API de banco de dados e APIs de IA.

---

## 4. Próximos Passos
Verifique o escopo, as tecnologias propostas e a estratégia de colaboração de agentes. Aguardo sua aprovação para iniciar a implementação da arquitetura paralela.
