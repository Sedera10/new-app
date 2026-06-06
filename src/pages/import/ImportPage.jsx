import { useState } from "react";
import CircularProgress from "../../assets/components/UI/CircularProgress";
import { importFile1 } from "../../services/imports/file1/index"; 

export default function ImportPage() {
  const [files, setFiles] = useState({ file1: null, file2: null, file3: null });
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState({ file1: null, file2: null, file3: null });
  
  // États de progression pour chaque fichier
  const [progress, setProgress] = useState({
    file1: { percent: 0, message: "En attente d'import..." },
    file2: { percent: 0, message: "En attente d'import..." },
    file3: { percent: 0, message: "En attente d'import..." }
  });

  const handleFileChange = (e, fileKey) => {
    setFiles(prev => ({ ...prev, [fileKey]: e.target.files[0] }));
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    
    // Initialiser les progressions
    setProgress({
      file1: { percent: 0, message: "Démarrage..." },
      file2: { percent: 0, message: "Démarrage..." },
      file3: { percent: 0, message: "Démarrage..." }
    });
    setResults({ file1: null, file2: null, file3: null });

    // Exemple de traitement futur de fichier 1 (le code est prêt et commenté)
    
    if (files.file1) {
      try {
        const result1 = await importFile1(files.file1, (prog) => {
           setProgress(prev => ({ 
             ...prev, 
             file1: { percent: prog.percentage, message: prog.message } 
           }));
        });
        setResults(prev => ({ ...prev, file1: result1 }));
        setProgress(prev => ({
          ...prev,
          file1: { percent: 100, message: "Termine" }
        }));
      } catch (error) {
        setProgress(prev => ({ ...prev, file1: { percent: 0, message: "Erreur" } }));
      }
    }
    
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", padding: "2rem" }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h1 className="m-0 fs-2 fw-bold text-center">Importation de données</h1>
        <button 
          className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "32px", height: "32px" }}
          onClick={() => window.location.reload()}
          title="Rafraîchir la page"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div className="card shadow-sm border-0 p-4 w-100" style={{ maxWidth: "800px", backgroundColor: "#FFFFFF", borderRadius: "16px" }}>
        {!isImporting ? (
          <form onSubmit={handleImport} className="d-flex flex-column gap-4">
            <div className="text-center mb-3">
              <h5 className="mb-2 text-secondary">Sélectionnez les fichiers pour l'import</h5>
              <p className="text-muted small">Veuillez insérer vos fichiers CSV ci-dessous. Tous les fichiers seront traités à la suite.</p>
            </div>

            <div className="row g-4">
              <div className="col-md-12">
                <label className="form-label fw-medium small text-secondary">Fichier 1 (ex: Parc, Utilisateurs...)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'file1')} 
                />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-medium small text-secondary">Fichier 2 (ex: Logiciels...)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'file2')} 
                />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-medium small text-secondary">Fichier 3 (ex: Licences...)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'file3')} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn mt-4 py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3"
              style={{ backgroundColor: "var(--bg-btn-primary)", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              // On peut désactiver le bouton si aucun fichier n'a été uploadé
              // disabled={!files.file1 && !files.file2 && !files.file3}
            >
              <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
              Lancer l'importation de masse
            </button>
          </form>
        ) : (
          <div className="d-flex flex-column align-items-center py-4">
            <h5 className="mb-5 fw-bold text-secondary text-center">
              Importation en cours... <br/>
              <small className="text-muted fw-normal">Veuillez patienter pendant le traitement des fichiers.</small>
            </h5>
            
            <div className="d-flex flex-wrap justify-content-center w-100" style={{ gap: "4rem" }}>
              
              {/* File 1 */}
              <div className="d-flex flex-column align-items-center">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-secondary"></i> File 1
                </h6>
                
                <CircularProgress 
                  percent={progress.file1.percent} 
                  currentStep={progress.file1.message} 
                  size={150} 
                />

                {results.file1 && (
                  <div className="mb-2 text-center small">
                    {results.file1.done?.length > 0 && (
                      <div className="text-success">
                        {results.file1.done.map((item, index) => (
                          <div key={`file1-done-${index}`}>{item}</div>
                        ))}
                      </div>
                    )}
                    {results.file1.errors?.length > 0 && (
                      <div className="text-danger">
                        {results.file1.errors.map((item, index) => (
                          <div key={`file1-error-${index}`}>{item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* File 2 */}
              <div className="d-flex flex-column align-items-center">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-secondary"></i> File 2
                </h6>
                <CircularProgress 
                  percent={progress.file2.percent} 
                  currentStep={progress.file2.message} 
                  size={150} 
                />
              </div>

              {/* File 3 */}
              <div className="d-flex flex-column align-items-center">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-secondary"></i> File 3
                </h6>
                <CircularProgress 
                  percent={progress.file3.percent} 
                  currentStep={progress.file3.message} 
                  size={150} 
                />
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}