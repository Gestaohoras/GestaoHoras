import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState('');
  const [bancoHoras, setBancoHoras] = useState(null);

  const fetchFuncionarios = async () => {
    const res = await axios.get('https://backend-banco-horas.onrender.com/funcionarios');
    setFuncionarios(res.data);
  };

  const criarFuncionario = async () => {
    await axios.post('https://backend-banco-horas.onrender.com/funcionarios', { nome });
    setNome('');
    fetchFuncionarios();
  };

  const verBancoHoras = async (id) => {
    const res = await axios.get(`https://backend-banco-horas.onrender.com/banco-horas/${id}`);
    setBancoHoras(res.data.totalHoras);
  };

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestão de Banco de Horas</h1>

      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Nome do Funcionário"
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={criarFuncionario}>
          Adicionar
        </button>
      </div>

      <ul>
        {funcionarios.map(f => (
          <li key={f.id} className="mb-2">
            {f.nome}{' '}
            <button
              className="ml-2 text-sm text-blue-600 underline"
              onClick={() => verBancoHoras(f.id)}>
              Ver banco de horas
            </button>
          </li>
        ))}
      </ul>

      {bancoHoras && (
        <div className="mt-4 text-green-700 font-semibold">
          Total de horas: {bancoHoras}
        </div>
      )}
    </div>
  );
}

export default App;
