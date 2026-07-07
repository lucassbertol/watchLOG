import { useState, useEffect, useMemo } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("backlog");
  const [series, setSeries] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tmdbId, setTmdbId] = useState(null);
  const [grade, setGrade] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [modalSeries, setModalSeries] = useState(null);
  const [modalGrade, setModalGrade] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recsData, setRecsData] = useState({ loading: false, items: [] });

  // Buscar séries do banco local
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/series/")
      .then((response) => response.json())
      .then((data) => {
        // Separa as séries por collection_type
        const backlogSeries = data.filter(
          (s) => s.collection_type === "backlog",
        );
        const watchLaterSeries = data.filter(
          (s) => s.collection_type === "watchLater",
        );

        setSeries(backlogSeries);
        setWatchLater(watchLaterSeries);
      })
      .catch((error) => console.error("Erro ao carregar séries:", error));
  }, []);

  // buscar séries da TMDB enquanto digita
  const handleSearchTMDB = (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    fetch(`http://127.0.0.1:8000/api/series/search-tmdb/?q=${query}`)
      .then((response) => response.json())
      .then((data) => setSearchResults(data))
      .catch((error) => console.error("Erro na busca:", error));
  };

  // selecionar série da TMDB
  const handleSelectSeries = (item) => {
    setTitle(item.title);
    setDescription(item.description);
    setTmdbId(item.tmdb_id);
    setPosterPath(item.poster_path);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSeries = {
      tmdb_id: tmdbId,
      title,
      description,
      poster_path: posterPath,
      collection_type: activeTab,
    };

    if (activeTab === "backlog") {
      newSeries.status = "completed";
      newSeries.grade = grade ? parseFloat(grade) : 0.0;
    }

    fetch("http://127.0.0.1:8000/api/series/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSeries),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro na API.");
        return response.json();
      })
      .then((data) => {
        // Busca provedores de streaming para a série
        fetch(`http://127.0.0.1:8000/api/series/${data.id}/fetch-providers/`, {
          method: "POST",
        })
          .then((res) => res.json())
          .then((updated) => {
            if (activeTab === "backlog") {
              setSeries((prev) => [...prev, updated]);
            } else {
              setWatchLater((prev) => [...prev, updated]);
            }
          })
          .catch(() => {
            // Fallback: adiciona sem providers se a busca falhar
            if (activeTab === "backlog") {
              setSeries((prev) => [...prev, data]);
            } else {
              setWatchLater((prev) => [...prev, data]);
            }
          });
        // Limpa o formulário
        setTitle("");
        setDescription("");
        setPosterPath("");
        setTmdbId(null);
        setGrade("");
        setSearchQuery("");
      })
      .catch((error) => console.error("Erro ao adicionar série:", error));
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8000/api/series/${id}/`, {
      method: "DELETE",
    })
      .then(() => {
        if (activeTab === "backlog") {
          setSeries(series.filter((item) => item.id !== id));
        } else {
          setWatchLater(watchLater.filter((item) => item.id !== id));
        }
      })
      .catch((error) => console.error("Erro ao excluir série:", error));
  };

  const handleMarkAsWatched = (item) => {
    setModalSeries(item);
    setModalGrade("");
  };

  const handleMoveToBacklog = () => {
    if (!modalSeries) return;

    const gradeValue = modalGrade ? parseFloat(modalGrade) : 0.0;

    fetch(`http://127.0.0.1:8000/api/series/${modalSeries.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_type: "backlog",
        status: "completed",
        grade: gradeValue,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro na API.");
        return res.json();
      })
      .then((updated) => {
        setWatchLater((prev) =>
          prev.filter((item) => item.id !== modalSeries.id),
        );
        setSeries((prev) => [...prev, updated]);
        setModalSeries(null);
        setModalGrade("");
      })
      .catch((error) => console.error("Erro ao mover série:", error));
  };

  const closeModal = () => {
    setModalSeries(null);
    setModalGrade("");
  };

  // Dados da aba ativa (backlog ordenado por nota decrescente)
  const currentSeriesList =
    activeTab === "backlog"
      ? [...series].sort((a, b) => parseFloat(b.grade) - parseFloat(a.grade))
      : watchLater;

  // Estatísticas do backlog
  const stats = useMemo(() => {
    const total = series.length;
    if (total === 0) {
      return {
        total: 0,
        media: 0,
        maxGrade: 0,
        minGrade: 0,
        top3: [],
        faixas: [],
        topProvider: null,
      };
    }

    const grades = series.map((s) => parseFloat(s.grade));
    const sum = grades.reduce((a, b) => a + b, 0);
    const maxGrade = Math.max(...grades);
    const minGrade = Math.min(...grades);

    const sorted = [...series].sort(
      (a, b) => parseFloat(b.grade) - parseFloat(a.grade),
    );
    const top3 = sorted.slice(0, 3);

    const faixas = [
      { label: "0-2", min: 0, max: 2, series: [] },
      { label: "2-4", min: 2, max: 4, series: [] },
      { label: "4-6", min: 4, max: 6, series: [] },
      { label: "6-8", min: 6, max: 8, series: [] },
      { label: "8-10", min: 8, max: 10.1, series: [] },
    ];
    for (const s of series) {
      const g = parseFloat(s.grade);
      const faixa = faixas.find((f) => g >= f.min && g < f.max);
      if (faixa) faixa.series.push(s);
    }

    const providerCount = {};
    for (const s of series) {
      if (s.providers) {
        for (const p of s.providers) {
          providerCount[p.provider_name] =
            (providerCount[p.provider_name] || 0) + 1;
        }
      }
    }
    let topProvider = null;
    let topCount = 0;
    for (const [name, count] of Object.entries(providerCount)) {
      if (count > topCount) {
        topCount = count;
        topProvider = { name, count };
      }
    }

    return {
      total,
      media: sum / total,
      maxGrade,
      minGrade,
      top3,
      faixas,
      topProvider,
    };
  }, [series]);

  // Buscar recomendações ao entrar na aba
  useEffect(() => {
    if (activeTab !== "recomendacoes") {
      setRecsData({ loading: false, items: [] });
      return;
    }
    if (series.length === 0) {
      setRecsData({ loading: false, items: [] });
      return;
    }

    const controller = new AbortController();

    setRecsData({ loading: true, items: [] });

    fetch("http://127.0.0.1:8000/api/series/recommendations/", {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setRecsData({ loading: false, items: data }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setRecsData({ loading: false, items: [] });
        }
      });

    return () => controller.abort();
  }, [activeTab, series]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>watchLOG</h1>
          <p>Gerencie seu catálogo de séries e acompanhe suas avaliações</p>
        </div>
      </header>

      <main className="main">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab("backlog")}
            className={`tab-button ${activeTab === "backlog" ? "active" : ""}`}
          >
            Backlog ({series.length})
          </button>
          <button
            onClick={() => setActiveTab("watchLater")}
            className={`tab-button ${activeTab === "watchLater" ? "active" : ""}`}
          >
            Watch Later ({watchLater.length})
          </button>
          <button
            onClick={() => setActiveTab("estatisticas")}
            className={`tab-button ${activeTab === "estatisticas" ? "active" : ""}`}
          >
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab("recomendacoes")}
            className={`tab-button ${activeTab === "recomendacoes" ? "active" : ""}`}
          >
            Recomendações
          </button>
        </div>

        {activeTab !== "estatisticas" && activeTab !== "recomendacoes" && (
          <>
            {/* Formulário */}
            <section className="form-section">
              <h2>
                + Adicionar Nova Série ao{" "}
                {activeTab === "backlog" ? "backlog" : "Watch Later"}
              </h2>

              <form onSubmit={handleSubmit} className="form">
                {/* Busca TMDB */}
                <div className="form-group">
                  <label className="form-label">Buscar Série</label>
                  <input
                    type="text"
                    placeholder="Digite o nome da série..."
                    value={searchQuery}
                    onChange={(e) => handleSearchTMDB(e.target.value)}
                    className="form-input"
                  />
                  {searchResults.length > 0 && (
                    <ul className="search-dropdown">
                      {searchResults.map((item) => (
                        <li
                          key={item.tmdb_id}
                          onClick={() => handleSelectSeries(item)}
                        >
                          <strong>{item.title}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Título e Descrição - aparecem em ambas as abas */}
                <div className="form-grid">
                  <div>
                    <label className="form-label">Título</label>
                    <input
                      type="text"
                      placeholder="Título da Série"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={tmdbId ? true : false}
                      className="form-input"
                    />
                  </div>

                  {activeTab === "backlog" && (
                    <div>
                      <label className="form-label">Nota (0-10)</label>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        min="0"
                        max="10"
                        step="0.1"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>

                {/* Descrição - Full width */}
                <div>
                  <label className="form-label">Descrição</label>
                  <textarea
                    placeholder="Descrição da Série"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    disabled={tmdbId ? true : false}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="submit-button">
                  Adicionar Série
                </button>
              </form>
            </section>

            {/* Lista de Séries */}
            <section className="series-section">
              <h2>
                {activeTab === "backlog" ? "Seu Backlog" : "Watch Later"} (
                {currentSeriesList.length})
              </h2>

              {currentSeriesList.length === 0 ? (
                <div className="empty-state">
                  <p>
                    Nenhuma série nesta aba ainda. Adicione sua primeira série
                    acima!
                  </p>
                </div>
              ) : (
                <div className="series-grid">
                  {currentSeriesList.map((item) => {
                    return (
                      <div key={item.id} className="series-card">
                        {/* Poster */}
                        {item.poster_path && (
                          <div className="series-poster">
                            <img
                              src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                              alt={item.title}
                            />
                          </div>
                        )}

                        {/* Conteúdo */}
                        <div className="series-content">
                          {/* Título */}
                          <h3 className="series-title">{item.title}</h3>

                          {/* Provedores de Streaming */}
                          {item.providers && item.providers.length > 0 && (
                            <div className="series-providers">
                              <span className="series-providers-label">Disponível em</span>
                              <div className="series-providers-logos">
                                {item.providers.map((prov) => (
                                  <img
                                    key={prov.provider_id}
                                    className="series-provider-logo"
                                    src={`https://image.tmdb.org/t/p/w45${prov.logo_path}`}
                                    alt={prov.provider_name}
                                    title={prov.provider_name}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Nota - apenas para Backlog */}
                          {activeTab === "backlog" && (
                            <div className="series-grade">
                              <span className="series-grade-star">⭐</span>
                              <span className="series-grade-value">
                                {parseFloat(item.grade).toFixed(1)}
                              </span>
                              <span className="series-grade-max">/10</span>
                            </div>
                          )}

                          {/* Descrição */}
                          <p className="series-description">
                            {item.description || "Sem descrição."}
                          </p>

                        </div>

                        {/* Botões */}
                        <div className="series-actions">
                          {activeTab === "watchLater" && (
                            <button
                              onClick={() => handleMarkAsWatched(item)}
                              className="watched-button"
                            >
                              Assistido
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="delete-button"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* Estatísticas */}
        {activeTab === "estatisticas" && (
          <section className="stats-section">
            <h2 className="stats-title">Estatísticas</h2>

            {stats.total === 0 ? (
              <div className="empty-state">
                <p>
                  Nenhuma série concluída ainda. As estatísticas aparecerão
                  aqui quando você adicionar séries ao Backlog.
                </p>
              </div>
            ) : (
              <>
                {/* Cards resumo */}
                <div className="stats-grid">
                  <div className="stats-card">
                    <span className="stats-card-value">{stats.total}</span>
                    <span className="stats-card-label">Total Assistidas</span>
                  </div>
                  <div className="stats-card">
                    <span className="stats-card-value">
                      {stats.media.toFixed(1)}
                    </span>
                    <span className="stats-card-label">Média Geral</span>
                  </div>
                  <div className="stats-card">
                    <span className="stats-card-value">
                      {stats.maxGrade.toFixed(1)}
                    </span>
                    <span className="stats-card-label">Nota Máxima</span>
                  </div>
                  <div className="stats-card">
                    <span className="stats-card-value">
                      {stats.minGrade.toFixed(1)}
                    </span>
                    <span className="stats-card-label">Nota Mínima</span>
                  </div>
                </div>

                {/* Top 3 */}
                <div className="stats-section-block">
                  <h3 className="stats-subtitle">Top 3 Melhores Séries</h3>
                  <div className="stats-top3">
                    {stats.top3.map((s, i) => (
                      <div key={s.id} className="stats-top3-item">
                        <span className="stats-top3-pos">{i + 1}º</span>
                        <div className="stats-top3-info">
                          <span className="stats-top3-title">{s.title}</span>
                          <span className="stats-top3-grade">
                            ⭐ {parseFloat(s.grade).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribuição das notas */}
                <div className="stats-section-block">
                  <h3 className="stats-subtitle">Distribuição das Notas</h3>
                  <div className="stats-faixas">
                    {stats.faixas.map((f) => {
                      const pct =
                        stats.total > 0
                          ? (f.series.length / stats.total) * 100
                          : 0;
                      return (
                        <div key={f.label} className="stats-faixa">
                          <span className="stats-faixa-label">{f.label}</span>
                          <div className="stats-faixa-bar-bg">
                            <div
                              className="stats-faixa-bar"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="stats-faixa-count">
                            {f.series.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Streaming mais usado */}
                {stats.topProvider && (
                  <div className="stats-section-block">
                    <h3 className="stats-subtitle">Streaming Mais Usado</h3>
                    <div className="stats-top-provider">
                      <span className="stats-top-provider-name">
                        {stats.topProvider.name}
                      </span>
                      <span className="stats-top-provider-count">
                        {stats.topProvider.count} série
                        {stats.topProvider.count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}
        {/* Recomendações */}
        {activeTab === "recomendacoes" && (
          <section className="stats-section">
            <h2 className="stats-title">Recomendações</h2>

            {recsData.loading ? (
              <div className="empty-state">
                <p>Buscando recomendações...</p>
              </div>
            ) : series.length === 0 ? (
              <div className="empty-state">
                <p>
                  Adicione séries ao Backlog com nota para receber
                  recomendações.
                </p>
              </div>
            ) : recsData.items.length === 0 ? (
              <div className="empty-state">
                <p>
                  Nenhuma recomendação encontrada no momento. Tente adicionar
                  mais séries.
                </p>
              </div>
            ) : (
              <div className="series-grid">
                {recsData.items.map((rec) => (
                  <div key={rec.tmdb_id} className="series-card">
                    {rec.poster_path && (
                      <div className="series-poster">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                          alt={rec.title}
                        />
                      </div>
                    )}
                    <div className="series-content">
                      <h3 className="series-title">{rec.title}</h3>
                      <div className="rec-match">
                        <span className="rec-match-badge">
                          +{rec.match_count}
                        </span>
                        <span className="rec-match-label">
                          {rec.source_titles.slice(0, 3).join(", ")}
                          {rec.source_titles.length > 3 && ", ..."}
                        </span>
                      </div>
                      <div className="rec-tmdb-score">
                        TMDB: {rec.vote_average.toFixed(1)}
                      </div>
                      <p className="series-description">
                        {rec.overview || "Sem descrição."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      {/* Modal de avaliação */}
      {modalSeries && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{modalSeries.title}</h2>
            <p className="modal-subtitle">Qual nota você dá para esta série?</p>

            <div className="modal-grade">
              <label className="form-label">Nota (0-10)</label>
              <input
                type="number"
                placeholder="0.0"
                value={modalGrade}
                onChange={(e) => setModalGrade(e.target.value)}
                min="0"
                max="10"
                step="0.1"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button onClick={closeModal} className="modal-cancel">
                Cancelar
              </button>
              <button onClick={handleMoveToBacklog} className="modal-confirm">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
