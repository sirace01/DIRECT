
import React, { useState } from 'react';

const SQLEditor: React.FC = () => {
  const [query, setQuery] = useState('SELECT * FROM teachers LIMIT 10;');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeQuery = async (customQuery?: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    const queryToRun = customQuery || query;

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setResults(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickTables = [
    { label: 'Teachers', query: 'SELECT * FROM teachers;' },
    { label: 'Tools', query: 'SELECT * FROM tools;' },
    { label: 'Consumables', query: 'SELECT * FROM consumables;' },
    { label: 'Tasks', query: 'SELECT * FROM tasks;' },
    { label: 'Analyses', query: 'SELECT * FROM analyses;' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-2 text-xs font-bold text-gray-500 uppercase tracking-widest">PostgreSQL Terminal</span>
          </div>
          <div className="flex space-x-2">
            {quickTables.map((t) => (
              <button
                key={t.label}
                onClick={() => {
                  setQuery(t.query);
                  executeQuery(t.query);
                }}
                className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-48 p-6 bg-slate-900 text-indigo-300 font-mono text-sm border-none focus:ring-0 resize-none"
            spellCheck={false}
          />
          <button
            onClick={() => executeQuery()}
            disabled={isLoading}
            className={`absolute bottom-4 right-4 px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all ${
              isLoading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isLoading ? 'Executing...' : 'Run Query (F5)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-red-800 font-bold uppercase text-xs tracking-widest">Query Error: {error.code}</h4>
          </div>
          <p className="text-sm text-red-700 font-mono">{error.error || error.message}</p>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h4 className="text-sm font-bold text-gray-700">Results ({results.length} rows)</h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase">JSON Export Available in Console</span>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {results.length > 0 && Object.keys(results[0]).map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {results.map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50/20">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-6 py-3 whitespace-nowrap text-xs text-gray-600 font-mono">
                        {typeof val === 'object' ? JSON.stringify(val).substring(0, 30) + '...' : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && (
              <div className="p-12 text-center text-gray-400 italic text-sm">
                Query executed successfully. 0 rows returned.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLEditor;
