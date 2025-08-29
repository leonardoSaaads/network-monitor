# Network-Monitor

> Aprenda conceitos complexos de forma visual e interativa.

*\<p align="center"\>Exemplo da visualização interativa do Three-Way Handshake do TCP.\</p\>*

-----

## 📄 Sobre o Projeto

O **Network-Monitor** é uma plataforma educacional desenvolvida para desmistificar conceitos fundamentais de redes de computadores. Com foco em estudantes e entusiastas da área, o projeto utiliza visualizações interativas e simulações em tempo real para transformar tópicos complexos em conhecimento prático e de fácil compreensão.

## 🚀 Funcionalidades

  - **Simulações Interativas:** Acompanhe passo a passo processos como a resolução de um domínio DNS ou o estabelecimento de uma conexão TCP.
  - **Visualização de Dados:** Gráficos e painéis que mostram o fluxo de dados, métricas de performance e o estado de cada componente da rede.
  - **Explicações Detalhadas:** Cada etapa da simulação é acompanhada de explicações claras e objetivas sobre o que está acontecendo.
  - **Comparativo de Funcionalidades:** Entenda as diferenças entre diferentes algoritmos de balanceamento de carga ou os benefícios de usar uma CDN.

## 📚 Módulos Abordados

Atualmente, o Network-Monitor cobre os seguintes tópicos essenciais:

  - **DNS (Domain Name System):** Simula o processo de resolução de um nome de domínio para um endereço IP, mostrando a hierarquia desde o resolver local até os servidores raiz e autoritativos.
  - **Load Balancer (Balanceador de Carga):** Demonstra visualmente como diferentes algoritmos (Round Robin, Least Connections, etc.) distribuem o tráfego de entrada entre múltiplos servidores.
  - **TCP Connection (Conexão TCP):** Explica o famoso *Three-Way Handshake* para estabelecer uma conexão e o processo de quatro vias para finalizá-la, detalhando cada flag (SYN, ACK, FIN).
  - **HTTP Request (Requisição HTTP):** Ilustra o ciclo de vida completo de uma requisição HTTP, desde a solicitação do cliente até a resposta do servidor, incluindo métodos, status codes e headers.
  - **CDN (Content Delivery Network):** Mostra como uma CDN acelera a entrega de conteúdo ao servir arquivos a partir de servidores de borda (edge servers) geograficamente mais próximos do usuário.
  - **VPN (Virtual Private Network):** Visualiza como uma VPN cria um "túnel" seguro e criptografado para os seus dados, protegendo sua privacidade e mascarando seu endereço IP.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias de ponta:

  - **[Vite](https://vitejs.dev/):** Build tool moderna e extremamente rápida.
  - **[React 19](https://react.dev/):** Biblioteca para construir interfaces de usuário.
  - **[Tailwind CSS](https://tailwindcss.com/):** Framework CSS utility-first para estilização rápida e responsiva.
  - **[SWC (Speedy Web Compiler)](https://swc.rs/):** Compilador otimizado em Rust, utilizado pelo Vite para máxima performance.
  - **[Lucide React](https://lucide.dev/):** Biblioteca de ícones simples e elegante.

## 🚀 Começando

Para executar o projeto localmente, siga os passos abaixo.

### Pré-requisitos

Você vai precisar ter o [Node.js](https://nodejs.org/en) (versão 18 ou superior) e o [npm](https://www.npmjs.com/) instalados em sua máquina.

### Instalação

1.  Clone o repositório:
    ```sh
    git clone https://github.com/leonardoSaaads/network-monitor.git
    ```
2.  Navegue até o diretório do projeto:
    ```sh
    cd network-monitor
    ```
3.  Instale as dependências:
    ```sh
    npm install
    ```
4.  Inicie o servidor de desenvolvimento:
    ```sh
    npm run dev
    ```
5.  Abra [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173) (ou a porta indicada no terminal) no seu navegador para ver o projeto rodando.

## 🤝 Contribuições

Contribuições são o que tornam a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito bem-vinda**.

Se você tem uma sugestão para melhorar o projeto, sinta-se à vontade para fazer um fork do repositório e criar um pull request, ou simplesmente abrir uma issue com a tag "enhancement".

1.  Faça um **Fork** do projeto.
2.  Crie uma nova Branch (`git checkout -b feature/AmazingFeature`).
3.  Faça o Commit de suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4.  Faça o Push para a Branch (`git push origin feature/AmazingFeature`).
5.  Abra um **Pull Request**.

## 📄 Licença

Este projeto está distribuído sob a Licença. Veja o arquivo `LICENSE` para mais detalhes.