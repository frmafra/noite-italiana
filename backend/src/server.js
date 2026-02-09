require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const routesDir = path.join(__dirname, 'routes');
const projetosRoutes = require(path.join(routesDir, 'projetos'));
const voluntariosRoutes = require(path.join(routesDir, 'voluntarios'));
const parceirosRoutes = require(path.join(routesDir, 'parceiros'));
const produtosRoutes = require(path.join(routesDir, 'produtos'));
const bancosRoutes = require(path.join(routesDir, 'bancos'));
const areasBaseRoutes = require(path.join(routesDir, 'areas-base'));
const areasProjetoRoutes = require(path.join(routesDir, 'areas-projeto'));
const atividadesRoutes = require(path.join(routesDir, 'atividades'));
const lancamentosRoutes = require(path.join(routesDir, 'lancamentos'));
const contasPagarRoutes = require(path.join(routesDir, 'contas-pagar'));
const contasReceberRoutes = require(path.join(routesDir, 'contas-receber'));
const ingressosRoutes = require(path.join(routesDir, 'ingressos'));
const patrociniosRoutes = require(path.join(routesDir, 'patrocinios'));
const baixaPagamentoRoutes = require(path.join(routesDir, 'baixa-pagamento'));
const orcamentoGeralRoutes = require(path.join(routesDir, 'orcamento-geral'));
const solicitacaoComprasRoutes = require(path.join(routesDir, 'solicitacao-compras'));
const solicitacaoItensRoutes = require(path.join(routesDir, 'solicitacao-itens'));
const cotacoesRoutes = require(path.join(routesDir, 'cotacoes'));
const aprovacoesComprasRoutes = require(path.join(routesDir, 'aprovacoes-compras'));
const pedidosComprasRoutes = require(path.join(routesDir, 'pedidos-compras'));
const entradasMercadoriaRoutes = require(path.join(routesDir, 'entradas-mercadoria'));
const fornecedoresRoutes = require(path.join(routesDir, 'fornecedores'));
const notaFiscalEntradaRoutes = require(path.join(routesDir, 'nota-fiscal-entrada'));
const pagamentoNfRoutes = require(path.join(routesDir, 'pagamento-nf'));

app.use('/api/projetos', projetosRoutes);
app.use('/api/voluntarios', voluntariosRoutes);
app.use('/api/parceiros', parceirosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/bancos', bancosRoutes);
app.use('/api/areas-base', areasBaseRoutes);
app.use('/api/areas-projeto', areasProjetoRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/api/lancamentos', lancamentosRoutes);
app.use('/api/contas-pagar', contasPagarRoutes);
app.use('/api/contas-receber', contasReceberRoutes);
app.use('/api/ingressos', ingressosRoutes);
app.use('/api/patrocinios', patrociniosRoutes);
app.use('/api/baixa-pagamento', baixaPagamentoRoutes);
app.use('/api/orcamento-geral', orcamentoGeralRoutes);
app.use('/api/solicitacao-compras', solicitacaoComprasRoutes);
app.use('/api/solicitacao-itens', solicitacaoItensRoutes);
app.use('/api/cotacoes', cotacoesRoutes);
app.use('/api/aprovacoes-compras', aprovacoesComprasRoutes);
app.use('/api/pedidos-compras', pedidosComprasRoutes);
app.use('/api/entradas-mercadoria', entradasMercadoriaRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/nota-fiscal-entrada', notaFiscalEntradaRoutes);
app.use('/api/pagamento-nf', pagamentoNfRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Backend Online - Noite Italiana 2026' });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
