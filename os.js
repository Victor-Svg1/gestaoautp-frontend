const r = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

r.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ordens_servico WHERE empresa_id = $1 ORDER BY criado_em DESC', [req.usuario.empresa_id]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

r.post('/', auth, async (req, res) => {
  try {
    const b = req.body;
    if (!b.cliente_nome) return res.status(400).json({ erro: 'Cliente e obrigatorio' });
    const r2 = await db.query(
      `INSERT INTO ordens_servico (empresa_id,numero,cliente_nome,telefone,cpf_cnpj,endereco,cidade,placa,veiculo,km,box,mecanico,status,valor_total,defeito,diagnostico,previsao,servicos,pecas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
      [req.usuario.empresa_id, b.numero, b.cliente_nome, b.telefone || null, b.cpf_cnpj || null, b.endereco || null, b.cidade || null, b.placa || null, b.veiculo || null, b.km || 0, b.box || null, b.mecanico || null, b.status || 'aberta', b.valor_total || 0, b.defeito || null, b.diagnostico || null, b.previsao || null, JSON.stringify(b.servicos || []), JSON.stringify(b.pecas || [])]
    );
    res.status(201).json(r2.rows[0]);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

r.put('/:id', auth, async (req, res) => {
  try {
    const b = req.body;
    const r2 = await db.query(
      `UPDATE ordens_servico SET numero=$1,cliente_nome=$2,telefone=$3,cpf_cnpj=$4,endereco=$5,cidade=$6,placa=$7,veiculo=$8,km=$9,box=$10,mecanico=$11,status=$12,valor_total=$13,defeito=$14,diagnostico=$15,previsao=$16,servicos=$17,pecas=$18,atualizado_em=NOW()
       WHERE id=$19 AND empresa_id=$20 RETURNING *`,
      [b.numero, b.cliente_nome, b.telefone || null, b.cpf_cnpj || null, b.endereco || null, b.cidade || null, b.placa || null, b.veiculo || null, b.km || 0, b.box || null, b.mecanico || null, b.status || 'aberta', b.valor_total || 0, b.defeito || null, b.diagnostico || null, b.previsao || null, JSON.stringify(b.servicos || []), JSON.stringify(b.pecas || []), req.params.id, req.usuario.empresa_id]
    );
    if (!r2.rows.length) return res.status(404).json({ erro: 'Nao encontrada' });
    res.json(r2.rows[0]);
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

r.delete('/:id', auth, async (req, res) => {
  try {
    const r2 = await db.query('DELETE FROM ordens_servico WHERE id=$1 AND empresa_id=$2 RETURNING id', [req.params.id, req.usuario.empresa_id]);
    if (!r2.rows.length) return res.status(404).json({ erro: 'Nao encontrada' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ erro: e.message }); }
});

module.exports = r;
