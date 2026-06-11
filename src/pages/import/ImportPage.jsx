import { useState } from "react";
import CircularProgress from "../../assets/components/UI/CircularProgress";
import { importFile1 } from "../../services/imports/file1/index";
import { importFile2 } from "../../services/imports/file2/index";
import { importFile3 } from "../../services/imports/file3/index";
import { importImages } from "../../services/imports/image";
import { extractZipFiles } from "../../services/imports/image/helper";

const INITIAL_PROGRESS = {
  file1: { percent: 0, message: "En attente d'import..." },
  file2: { percent: 0, message: "En attente d'import..." },
  file3: { percent: 0, message: "En attente d'import..." },
  image: { percent: 0, message: "En attente d'import..." },
};

export default function ImportPage() {
  const [files, setFiles]             = useState({ file1: null, file2: null, file3: null });
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults]       = useState({ file1: null, file2: null, file3: null, image: null });
  const [imageFiles, setImageFiles] = useState([]);
  const [progress, setProgress]     = useState(INITIAL_PROGRESS);

  const handleFileChange = (e, fileKey) => {
    setFiles(prev => ({ ...prev, [fileKey]: e.target.files[0] }));
  };

  const handleImageChange = (e) => {
    const f = e.target.files;
    setImageFiles(f && f.length > 0 ? [f[0]] : []);
  };

  const updateProgress = (fileKey, percent, message) => {
    setProgress(prev => ({ ...prev, [fileKey]: { percent, message } }));
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    setProgress(INITIAL_PROGRESS);
    setResults({ file1: null, file2: null, file3: null, image: null });

    let result1 = null;
    if (files.file1) {
      try {
        result1 = await importFile1(files.file1, (prog) => {
          updateProgress("file1", prog.percentage, prog.description || prog.message);
        });
        setResults(prev => ({ ...prev, file1: result1 }));
        updateProgress("file1", 100, "Terminé ✓");
      } catch (error) {
        updateProgress("file1", 0, "Erreur ✗");
        console.error("Erreur file1:", error);
      }
    }

    let result2 = null;
    if (result1 && files.file2) {
      try {
        const input1 = result1 || { touchedResources: new Set(), ticketMap: {} };
        result2 = await importFile2(files.file2, input1, (prog) => {
          updateProgress("file2", prog.percentage, prog.description || prog.message);
        });
        setResults(prev => ({ ...prev, file2: result2 }));
        updateProgress("file2", 100, "Terminé ✓");
      } catch (error) {
        updateProgress("file2", 0, "Erreur ✗");
        console.error("Erreur file2:", error);
      }
    }

    let result3 = null;
    if (result2 && files.file3) {
      try {
        const input2 = result2 || { touchedResources: new Set(), ticketMap: {} };
        result3 = await importFile3(files.file3, input2, (prog) => {
          updateProgress("file3", prog.percentage, prog.description || prog.message);
        });
        setResults(prev => ({ ...prev, file3: result3 }));
        updateProgress("file3", 100, "Terminé ✓");
      } catch (error) {
        updateProgress("file3", 0, "Erreur ✗");
        console.error("Erreur file3:", error);
      }
    }

    if (result3 && imageFiles.length > 0) {
      try {
        updateProgress("image", 0, "Extraction du ZIP...");
        const extractedImages = await extractZipFiles(imageFiles[0]);

        if (extractedImages.length === 0) {
          throw new Error("Le fichier ZIP ne contient aucune image");
        }

        const resultImage = await importImages(extractedImages, (prog) => {
          updateProgress("image", prog.percentage, prog.description || prog.message);
        });

        setResults(prev => ({ ...prev, image: resultImage }));
        updateProgress("image", 100, "Terminé ✓");
      } catch (error) {
        updateProgress("image", 0, "Erreur ✗");
        console.error("Erreur images:", error);
      }
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "80vh", padding: "2rem", backgroundColor: "var(--bg-body, #f8f9fa)" }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <h1 className="m-0 fs-2 fw-bold text-center text-secondary">Importation de données</h1>
        <button 
          className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: "36px", height: "36px", border: "1px solid #ddd" }}
          onClick={() => window.location.reload()}
          title="Rafraîchir la page"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div className="card shadow-sm border-0 p-4 w-100" style={{ maxWidth: "1000px", backgroundColor: "#FFFFFF", borderRadius: "16px" }}>
        {!isImporting ? (
          <form onSubmit={handleImport} className="d-flex flex-column gap-4">
            <div className="text-center mb-2">
              <h5 className="mb-2 fw-bold text-dark">Sélectionnez les fichiers pour l'import</h5>
              <p className="text-muted small">Veuillez insérer vos fichiers ci-dessous. Ils seront traités les uns après les autres.</p>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Fichier 1 */}
              <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                <label className="form-label fw-bold small text-secondary mb-1">
                  <i className="bi bi-filetype-csv me-2"></i>Elements & Utilisateurs
                </label>
                <input 
                  type="file" 
                  className="form-control bg-white" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'file1')} 
                />
                {files.file1 && (
                  <div className="mt-2 small text-success fw-medium text-truncate">
                      ✓ {files.file1.name}
                  </div>
                )}
              </div>

              {/* Fichier 2 */}
              <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                <label className="form-label fw-bold small text-secondary mb-1">
                  <i className="bi bi-filetype-csv me-2"></i>Tickets
                </label>
                <input 
                  type="file" 
                  className="form-control bg-white" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'file2')} 
                />
                {files.file2 && (
                  <div className="mt-2 small text-success fw-medium text-truncate">
                      ✓ {files.file2.name}
                  </div>
                )}
              </div>

              {/* Fichier 3 */}
              <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                <label className="form-label fw-bold small text-secondary mb-1">
                  <i className="bi bi-filetype-csv me-2"></i>Tickets Costs
                </label>
                <input 
                  type="file" 
                  className="form-control bg-white" 
                  accept=".csv"
                  onChange={(e) => handleFileChange(e, 'file3')} 
                />
                {files.file3 && (
                  <div className="mt-2 small text-success fw-medium text-truncate">
                      ✓ {files.file3.name}
                  </div>
                )}
              </div>

              {/* Images / ZIP */}
              <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                <label className="form-label fw-bold small text-secondary mb-1">
                  <i className="bi bi-file-earmark-zip me-2"></i>Images (Fichier ZIP)
                </label>
                <input 
                  type="file" 
                  className="form-control bg-white" 
                  accept=".zip"
                  onChange={handleImageChange} 
                />
                {imageFiles.length > 0 && (
                    <div className="mt-2 small text-primary fw-medium text-truncate">
                        ✓ {imageFiles[0].name} sélectionné
                    </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn mt-3 py-3 fw-bold text-white d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-3 border-0"
              style={{ backgroundColor: "var(--bg-btn-primary, #0d6efd)", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
              Lancer l'importation de masse
            </button>
          </form>
        ) : (
          <div className="d-flex flex-column align-items-center py-4">
            <h5 className="mb-5 fw-bold text-secondary text-center lh-base">
              Importation en cours... <br/>
              <small className="text-muted fw-normal fs-6">Veuillez patienter pendant le traitement des données.</small>
            </h5>
            
            {/* Conteneur Flex avec largeur fixe pour chaque étape afin de stabiliser le texte */}
            <div className="d-flex flex-wrap justify-content-center w-100" style={{ gap: "3rem" }}>
              
              {/* File 1 */}
              <div className="d-flex flex-column align-items-center text-center" style={{ width: "240px" }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 text-dark">
                  <i className="bi bi-file-earmark-text text-primary fs-5"></i> Elements & Users
                </h6>
                
                <CircularProgress 
                  percent={progress.file1.percent} 
                  currentStep={progress.file1.message} 
                  size={140} 
                />

                {results.file1 && (
                  <div className="mt-3 text-start small text-break w-100 px-2">
                    {results.file1.done?.length > 0 && (
                      <div className="text-success small">
                        {results.file1.done.map((item, index) => (
                          <div key={`file1-done-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                    {results.file1.errors?.length > 0 && (
                      <div className="text-danger small mt-1">
                        {results.file1.errors.map((item, index) => (
                          <div key={`file1-error-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* File 2 */}
              <div className="d-flex flex-column align-items-center text-center" style={{ width: "240px" }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 text-dark">
                  <i className="bi bi-file-earmark-text text-primary fs-5"></i> Tickets
                </h6>
                <CircularProgress 
                  percent={progress.file2.percent} 
                  currentStep={progress.file2.message} 
                  size={140} 
                />
                {results.file2 && (
                  <div className="mt-3 text-start small text-break w-100 px-2">
                    {results.file2.done?.length > 0 && (
                      <div className="text-success small">
                        {results.file2.done.map((item, index) => (
                          <div key={`file2-done-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                    {results.file2.errors?.length > 0 && (
                      <div className="text-danger small mt-1">
                        {results.file2.errors.map((item, index) => (
                          <div key={`file2-error-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* File 3 */}
              <div className="d-flex flex-column align-items-center text-center" style={{ width: "240px" }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 text-dark">
                  <i className="bi bi-file-earmark-text text-primary fs-5"></i> Tickets Costs
                </h6>
                <CircularProgress 
                  percent={progress.file3.percent} 
                  currentStep={progress.file3.message} 
                  size={140} 
                />
                {results.file3 && (
                  <div className="mt-3 text-start small text-break w-100 px-2">
                    {results.file3.done?.length > 0 && (
                      <div className="text-success small">
                        {results.file3.done.map((item, index) => (
                          <div key={`file3-done-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                    {results.file3.errors?.length > 0 && (
                      <div className="text-danger small mt-1">
                        {results.file3.errors.map((item, index) => (
                          <div key={`file3-error-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="d-flex flex-column align-items-center text-center" style={{ width: "240px" }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 text-dark">
                  <i className="bi bi-images text-primary fs-5"></i> Upload Image
                </h6>
                {imageFiles.length > 0 && 
                <CircularProgress 
                  percent={progress.image.percent} 
                  currentStep={progress.image.message} 
                  size={140} 
                />}
                {results.image && (
                  <div className="mt-3 text-start small text-break w-100 px-2">
                    {results.image.done?.length > 0 && (
                      <div className="text-success small">
                        {results.image.done.map((item, index) => (
                          <div key={`image-done-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                    {results.image.errors?.length > 0 && (
                      <div className="text-danger small mt-1">
                        {results.image.errors.map((item, index) => (
                          <div key={`image-error-${index}`}>• {item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}