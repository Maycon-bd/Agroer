# Interface de Extração de Dados de Nota Fiscal

Este projeto é uma aplicação React desenvolvida com TypeScript e Vite para criar uma interface web que permite o upload de notas fiscais em PDF e a exibição dos dados extraídos em formato JSON.

## 🚀 Funcionalidades

- **Upload de Arquivos PDF**: Interface intuitiva para seleção de arquivos PDF de notas fiscais
- **Validação de Arquivo**: Aceita apenas arquivos com extensão .pdf
- **Extração Simulada**: Demonstração com dados mock após o processamento
- **Visualização JSON**: Exibição formatada dos dados extraídos
- **Cópia para Área de Transferência**: Funcionalidade para copiar o JSON gerado
- **Design Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Alternador de Visualização**: Opções entre visualização formatada e JSON (JSON funcional)

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Vite** como bundler e servidor de desenvolvimento
- **CSS3** com design moderno e responsivo
- **HTML5** com semântica adequada

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🔧 Instalação e Execução

1. **Clone o repositório ou navegue até o diretório do projeto**

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação:**
   Abra seu navegador e vá para `http://localhost:5173/`

## 📱 Como Usar

1. **Selecionar Arquivo**: Clique na área de upload para selecionar um arquivo PDF de nota fiscal
2. **Visualizar Seleção**: O nome do arquivo selecionado será exibido abaixo da área de upload
3. **Extrair Dados**: Clique no botão "EXTRAIR DADOS" para processar o arquivo (simulação com dados mock)
4. **Visualizar Resultados**: Os dados extraídos aparecerão em formato JSON na seção inferior
5. **Copiar JSON**: Use o botão "Copiar JSON" para copiar os dados para a área de transferência

## 🎨 Design e Layout

A interface foi desenvolvida seguindo um design moderno com:

- **Seção de Upload**: Gradiente roxo/azul com área de drag-and-drop estilizada
- **Seção de Dados**: Fundo claro com alternador de visualização e área de código destacada
- **Responsividade**: Adaptação automática para dispositivos móveis e desktop
- **Animações**: Transições suaves e efeitos hover para melhor experiência do usuário

## 📊 Estrutura dos Dados

O JSON gerado contém as seguintes informações da nota fiscal:

```json
{
  "numeroNota": "000008438",
  "serie": "001",
  "dataEmissao": "2025-01-15",
  "fornecedor": {
    "nome": "EMPRESA EXEMPLO LTDA",
    "cnpj": "13.142.597/0001-46",
    "endereco": "Rua das Flores, 123 - Centro - São Paulo/SP"
  },
  "valorTotal": 1250.75,
  "itens": [
    {
      "descricao": "Produto A",
      "quantidade": 2,
      "valorUnitario": 500.00,
      "valorTotal": 1000.00
    }
  ]
}
```

## 🔮 Próximos Passos

Esta é a primeira etapa do sistema de Contas a Pagar. Funcionalidades futuras incluem:

- Integração com API backend para processamento real de PDFs
- Implementação da "Visualização Formatada"
- Integração com IA (Gemini LLM) para extração automática de dados
- Sistema de autenticação e autorização
- Histórico de processamentos
- Exportação em diferentes formatos

## 📝 Notas de Desenvolvimento

- O processamento atual é simulado com um delay de 2 segundos
- Os dados exibidos são mock data para demonstração
- A validação de arquivo está implementada apenas no frontend
- A funcionalidade de cópia utiliza a API nativa do navegador (Clipboard API)

## 🤝 Contribuição

Este projeto faz parte de um sistema maior de Contas a Pagar. Para contribuições ou melhorias, siga as diretrizes de desenvolvimento da equipe.
