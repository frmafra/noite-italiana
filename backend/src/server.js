require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const projetosRoutes = require('./routes/projetos');
const voluntariosRoutes = require('./routes/voluntarios');
const parceirosRoutes = require('./routes/parceiros');
const produtosRoutes = require('./routes/produtos');
const bancosRoutes = require('./routes/bancos');
const areasBaseRoutes = require('./routes/areas-base');
const areasProjetoRoutes = require('./routes/areas-projeto');
const atividadesRoutes = require('./routes/atividades');
const lancamentosRoutes = require('./routes/lancamentos');
const contasPagarRoutes = require('./routes/contas-pagar');
const contasReceberRoutes = require('./routes/contas-receber');
const ingressosRoutes = require('./routes/ingressos');
const patrociniosRoutes = require('./routes/patrocinios');
const baixaPagamentoRoutes = require('./routes/baixa-pagamento');
const orcamentoGeralRoutes = require('./routes/orcamento-geral');
const solicitacaoComprasRoutes = require('./routes/solicitacao-compras');
const solicitacaoItensRoutes = require('./routes/solicitacao-itens');
const cotacoesRoutes = require('./routes/cotacoes');
const aprovacoesComprasRoutes = require('./routes/aprovacoes-compras');
const pedidosComprasRoutes = require('./routes/pedidos-compras');
const entradasMercadoriaRoutes = require('./routes/entradas-mercadoria');
const fornecedoresRoutes = require('./routes/fornecedores');
const notaFiscalEntradaRoutes = require('./routes/nota-fiscal-entrada');
const pagamentoNfRoutes = require('./routes/pagamento-nf');

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
