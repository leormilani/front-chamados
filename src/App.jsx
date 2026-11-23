import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarChamados() {
    try {
      setErro('');
      const resposta = await fetch(`${API_URL}/chamados`);
      if (!resposta.ok) throw new Error('Falha ao buscar chamados');
      const dados = await resposta.json();
      setChamados(dados);
    } catch (e) {
      setErro('Não foi possível conectar na API (verifique se ela está rodando na porta 3000).');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  async function criarChamado(e) {
    e.preventDefault();
    if (!titulo.trim()) return;

    const resposta = await fetch(`${API_URL}/chamados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, prioridade })
    });

    if (resposta.ok) {
      setTitulo('');
      setPrioridade('media');
      carregarChamados();
    }
  }

  async function alterarStatus(id, novoStatus) {
    const resposta = await fetch(`${API_URL}/chamados/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });

    if (resposta.ok) {
      carregarChamados();
    }
  }

  async function excluirChamado(id) {
    const resposta = await fetch(`${API_URL}/chamados/${id}`, {
      method: 'DELETE'
    });

    if (resposta.ok) {
      carregarChamados();
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1 style={{ textAlign: 'center', fontSize: 32, marginBottom: 24 }}>
        Chamados & SLA (React + Web API)
      </h1>

      <form onSubmit={criarChamado} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Descreva o chamado..."
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        />

        <select
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="baixa">Baixa (48h)</option>
          <option value="media">Média (24h)</option>
          <option value="alta">Alta (4h)</option>
          <option value="critica">Crítica (2h)</option>
        </select>

        <button
          type="submit"
          style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}
        >
          Abrir chamado
        </button>
      </form>

      {erro && <p style={{ color: 'crimson' }}>{erro}</p>}
      {carregando ? (
        <p>Carregando chamados...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {chamados.map((c) => (
            <li
              key={c.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12
              }}
            >
              <div>
                <strong># {c.id} — {c.titulo}</strong>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                  Prioridade: <b>{c.prioridade}</b> | SLA: <b>{c.slaHoras} h</b>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={c.status}
                  onChange={(e) => alterarStatus(c.id, e.target.value)}
                  style={{ padding: 6, borderRadius: 6 }}
                >
                  <option value="aberto">aberto</option>
                  <option value="em_andamento">em_andamento</option>
                  <option value="resolvido">resolvido</option>
                </select>

                <button
                  type="button"
                  onClick={() => excluirChamado(c.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid #e0a8a8',
                    backgroundColor: '#fff5f5',
                    color: '#b91c1c',
                    cursor: 'pointer'
                  }}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}