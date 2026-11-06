# CustodyChain

## Origem e atribuição

Este repositório é derivado de [leandroloffi/CustodyChain](https://github.com/leandroloffi/CustodyChain), de Leandro Loffi (2024). A cópia e a alteração do código foram autorizadas por ele em 23/09/2026, com a condição de citar o trabalho de origem. O repositório público original não integra o resultado da tese de doutorado do autor. Esta versão é modificada por Lucas Barros Mota (Unifesspa, 2026) como parte de um TCC sobre cadeia de custódia de evidências com blockchain. Componentes do Hyperledger `fabric-samples` seguem a Apache License 2.0 e mantêm seus cabeçalhos originais. Detalhes em [NOTICE](NOTICE).

## Demonstração do frontend (modo simulado)

O frontend roda em modo MOCK: dados em `localStorage`, tudo rotulado como simulado, sem backend.

    cd frontend && npm install && npm run dev:demo   # http://localhost:5173
    npm test                                          # testes unitários (node:test)

Roteiro de apresentação em [docs/roteiro-demo.md](docs/roteiro-demo.md).

---

# 1. Download this project
	git clone https://github.com/leandroloffi/CustodyChain

# 2. Install dependencies
	sudo su
 	sudo apt-get install git 
	sudo apt-get install curl
	sudo apt-get install docker-compose
	sudo apt-get install npm
	sudo apt-get install jq
 	sudo apt install python3-distutils-extra
	sudo systemctl start docker
	sudo usermod -a -G docker <username>
	sudo docker --version
	sudo docker-compose --version
	systemctl enable docker

# 3. To run the Network
	cd backend/network/
	./network.sh down
	./network.sh up createChannel -c mychannel -ca
	./network.sh deployCC -ccn basic -ccp ../chaincode/ -ccl javascript

# 4. To run GATEWAY - PORT 3000
	cd ../gateway/
	npm install
	node src/app.js

# 5. To run FRONTEND - PORT 5173
	# open a new terminal
 	cd frontend/
	npm install
	npm run dev -- --host

# 6. FINISH
	cd ../backend/network/
	./network.sh down
