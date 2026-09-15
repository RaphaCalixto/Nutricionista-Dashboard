# 🥗 Nutrição com Amor — Sistema Clínico Profissional de Nutrição & Gestão de Consultório

<div align="center">

![Nutrição com Amor Banner](https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80)

**Plataforma SaaS completa para nutricionistas: montador de dietas com tabelas TACO/USDA, cálculo automático de macronutrientes, antropometria avançada (Pollock 3/7 dobras), galeria de evolução (Antes & Depois), prescrição de suplementos, agenda de consultas e prontuário eletrônico.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📋 Sumário
- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Autenticação & Isolamento Multiusuário](#-autenticação--isolamento-multiusuário)
- [Credenciais de Demonstração](#-credenciais-de-demonstração)
- [Instalação e Execução Local](#-instalação-e-execução-local)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Licença](#-licença)

---

## 🌟 Visão Geral

O **Nutrição com Amor** foi desenvolvido para transformar o fluxo de trabalho de nutricionistas clínicos e esportivos. O sistema une agilidade, precisão no cálculo nutricional e uma experiência visual premium e humanizada para o paciente.

A aplicação conta com **arquitetura híbrida**: funciona com sincronização em nuvem via **Supabase** e possui **cache local automático**, permitindo consultas ultra-rápidas e operação offline ininterrupta.

---

## 🚀 Funcionalidades Principais

### 1. 🔐 Autenticação & Gestão Multiusuário (SaaS Ready)
- **Login e Cadastro simplificados:** apenas Nome, E-mail e Senha.
- **Isolamento de Dados Estrito (Multi-tenancy):** Cada nutricionista tem sua base de dados isolada por `user_id`. Novas contas iniciam com o consultório limpo e zerado.
- Conta de demonstração integrada com dados simulados completos.

### 2. 👥 Prontuário Eletrônico & Gestão de Pacientes
- Cadastro completo de pacientes com metas nutricionais (Emagrecimento, Hipertrofia, Manutenção, Saúde Clínica, Performance, Gestação/Lactação).
- **Anamnese Clínica Detalhada:** histórico patológico, familiar, hábitos intestinais, qualidade do sono, nível de estresse, frequência de atividade física, recordatório 24h e aversões/alergias alimentares.

### 3. ⚖️ Antropometria & Composição Corporal
- Cálculo de IMC, Massa Gorda (kg), Massa Magra (kg) e % de Gordura corporal.
- Protocolos de Dobras Cutâneas (Pollock 3 dobras, 7 dobras) e circunferências corporais completas.
- Edição, exclusão e comparativo histórico de evolução física entre consultas.

### 4. 🍽️ Montador de Dietas Inteligente (TACO & API)
- Base de dados integrada com a **Tabela TACO** (Tabela Brasileira de Composição de Alimentos), **IBGE** e **USDA**.
- **Cálculo de Necessidades Energéticas:** Fórmulas de Harris-Benedict, Mifflin-St Jeor, Katch-McArdle, FAO/OMS com fator atividade e objetivo calórico.
- Distribuição de macronutrientes em tempo real (Proteínas, Carboidratos, Gorduras e Fibras) por refeição e total diário.
- Modal de edição de porções com **Gramas (g)** em primeiro lugar por padrão e conversão automática de medidas caseiras.
- Emissão de planos alimentares formatados para impressão e envio ao paciente com cabeçalho profissional personalizado.

### 5. 📸 Galeria de Evolução Fotográfica (Antes & Depois)
- Upload e registro fotográfico de pacientes por data e ângulo (Frente, Costas, Perfil Lateral).
- Comparador lado a lado com registro de peso e notas clínicas para acompanhamento visual do progresso.
- Suporte para upload direto de arquivos e URLs de imagem.

### 6. 💊 Módulo de Prescrição de Suplementos
- Prescrição individualizada com dosagem, horário de administração e orientações clínicas.
- Ações completas para adicionar, editar e excluir suplementos no prontuário.

### 7. 📅 Agenda de Consultas & Acompanhamento
- Calendário semanal e diário com status em português (*Agendada, Confirmada, Realizada, Cancelada*).
- Integração de link para teleconsultas online e anotações da sessão.

### 8. ⚙️ Configurações do Consultório & Backup
- Personalização de Nome Profissional, CRN, Nome da Clínica, WhatsApp Comercial, E-mail, Endereço e Instagram.
- Exportação de **Backup JSON Completo** de todos os dados cadastrados em 1 clique.
- Painel com o script SQL pronto para criação e atualização das tabelas no Supabase.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Banco de Dados & Backend:** [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Efeitos & UX:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🔑 Credenciais de Demonstração

Para testar o sistema com dados simulados pré-carregados (paciente de exemplo, anamnese, dieta montada, fotos e consultas):

- **E-mail:** `lais.leal@nutriplan.com`
- **Senha:** `123456`
- **Nome:** `Dra. Laís Leal`

*(Na tela de login, utilize o botão **"Preencher"** para autenticar com 1 clique).*

---

## 💻 Instalação e Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm` ou `yarn`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/RaphaCalixto/Nutricionista-Dashboard.git
   cd Nutricionista-Dashboard
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em: `http://localhost:5173/`

4. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 📁 Estrutura do Projeto

```
Nutri/
├── src/
│   ├── components/
│   │   ├── auth/           # Login e Cadastro (AuthView)
│   │   ├── dashboard/      # Métricas e Resumo do Consultório
│   │   ├── diet/           # Montador de Dietas e Visualização para Impressão
│   │   ├── foods/          # Tabela de Alimentos (TACO/IBGE/USDA)
│   │   ├── layout/         # Sidebar e Navbar com Perfil Ativo
│   │   ├── modals/         # Modais de Paciente, Consulta e SQL do Supabase
│   │   ├── patients/       # Lista, Detalhe, Anamnese, Antropometria e Fotos
│   │   ├── schedule/       # Agenda de Consultas
│   │   ├── settings/       # Configurações do Consultório e Backup
│   │   └── supplements/    # Prescrições de Suplementação
│   ├── data/               # Dados Iniciais Simulados (mockData)
│   ├── services/           # Camada de Autenticação (auth.ts), BD (db.ts) e Supabase
│   ├── types/              # Interfaces TypeScript e Enums
│   ├── App.tsx             # Componente Raiz e Roteamento de Estado
│   └── main.tsx            # Ponto de Entrada da Aplicação
├── public/                 # Assets Estáticos
├── package.json            # Dependências e Scripts
├── README.md               # Documentação Oficial
└── vite.config.ts          # Configuração do Vite
```

---

## 📄 Licença

Este projeto é desenvolvido para uso profissional e comercial. Todos os direitos reservados.

---

<div align="center">
Desenvolvido por <strong>Rapha Calixto</strong> • <strong>Nutrição com Amor</strong>
</div>
