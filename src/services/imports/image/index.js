import { resolveItem } from "../file2/helper";
import { createItem } from '../../api';
import { api } from '../../api';

// ============================================================
// Vérifie la vraie signature du fichier (magic bytes)
// et retourne le vrai type MIME détecté
// ============================================================
export const detectRealMimeType = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target.result);

      // PNG : 89 50 4E 47
      if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
        resolve("image/png");
        return;
      }
      // JPEG : FF D8 FF
      if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
        resolve("image/jpeg");
        return;
      }
      // GIF : 47 49 46
      if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) {
        resolve("image/gif");
        return;
      }
      // Inconnu → on retourne le type déclaré par le navigateur
      resolve(file.type || "application/octet-stream");
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

// ============================================================
// Valide et corrige le fichier si nécessaire
// Retourne { file, valid, converted, realMime }
// ============================================================
export const validateAndFixFile = async (file) => {
  const declaredExt  = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  const realMime     = await detectRealMimeType(file);

  const mimeToExt = {
    "image/png":  ".png",
    "image/jpeg": ".jpeg",
    "image/gif":  ".gif",
  };

  const realExt = mimeToExt[realMime] || null;

  // Fichier valide : l'extension correspond au vrai type
  if (realExt && realExt === declaredExt) {
    return { file, valid: true, converted: false, realMime };
  }

  // Fichier invalide mais type réel connu → convertir via canvas
  if (realMime === "image/jpeg" || realMime === "image/png") {
    console.warn(`Fichier '${file.name}' : extension '${declaredExt}' ≠ type réel '${realMime}' → conversion`);

    const convertedFile = await convertImageFile(file, realMime);
    return { file: convertedFile, valid: false, converted: true, realMime };
  }

  // Type réel inconnu → on tente quand même avec le fichier original
  console.warn(`Fichier '${file.name}' : type réel inconnu (${realMime}), on tente l'upload tel quel`);
  return { file, valid: false, converted: false, realMime };
};

// ============================================================
// Convertit un fichier image via canvas
// ============================================================
export const convertImageFile = (file, targetMime) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error(`Conversion échouée pour ${file.name}`));
          return;
        }

        const ext          = targetMime === "image/png" ? ".png" : ".jpeg";
        const baseName     = file.name.substring(0, file.name.lastIndexOf("."));
        const newFileName  = `${baseName}${ext}`;
        const convertedFile = new File([blob], newFileName, { type: targetMime });

        console.log(`✓ Converti : ${file.name} → ${newFileName}`);
        resolve(convertedFile);
      }, targetMime, 0.95);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Impossible de lire l'image : ${file.name}`));
    };

    img.src = url;
  });
};

// ============================================================
// Upload + liaison Document_Item
// ============================================================
export const uploadAndLinkImage = async (file, itemtype, itemId) => {
  const formData = new FormData();
  formData.append("uploadManifest", JSON.stringify({
    input: {
      name: file.name.replace(/\.(png|jpg|jpeg)$/i, ""),
      _filename: [file.name],
      entities_id: 0,
    }
  }));
  formData.append("filename[0]", file, file.name);

  const sessionToken = sessionStorage.getItem("glpi_session_token");

  const uploadResponse = await api.post("/Document", formData, {
    headers: {
      "App-Token":     import.meta.env.VITE_API,
      "Session-Token": sessionToken,
    },
    transformRequest: [
      (data, headers) => {
        delete headers["Content-Type"];
        delete headers.common?.["Content-Type"];
        return data;
      }
    ],
  });

  const document = uploadResponse.data;
  if (!document?.id) {
    throw new Error(`Upload échoué pour ${file.name}`);
  }

  console.log(`Document créé, id: ${document.id}`);

  const link = await createItem("Document_Item", {
    documents_id: document.id,
    itemtype,
    items_id:    itemId,
    entities_id: 0,
  });

  console.log(`Document_Item créé, id: ${link?.id}`);
  return { document, link };
};

// ============================================================
// Import de toutes les images
// ============================================================
export const importImages = async (imageFiles, onProgress = () => {}) => {
  const results = {
    images:  [],
    done:    [],
    errors:  [],
    summary: { totalImages: 0, successImages: 0, totalErrors: 0 }
  };

  try {
    if (!imageFiles || imageFiles.length === 0) {
      results.errors.push("Aucun fichier image sélectionné");
      results.summary.totalErrors = results.errors.length;
      return results;
    }

    const supportedExtensions = [".png", ".jpg", ".jpeg"];
    const validImages = Array.from(imageFiles).filter(file => {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      return supportedExtensions.includes(ext);
    });

    results.summary.totalImages = validImages.length;

    if (validImages.length === 0) {
      results.errors.push("Aucun fichier image valide (.png/.jpg/.jpeg) trouvé");
      results.summary.totalErrors = results.errors.length;
      return results;
    }

    let totalUpload = 0;

    for (let i = 0; i < validImages.length; i++) {
      const originalFile = validImages[i];

      onProgress({
        step:        "images",
        message:     "images",
        description: `Image ${i + 1} / ${validImages.length} : ${originalFile.name}`,
        percentage:  Math.round(((i + 1) / validImages.length) * 100),
      });

      try {
        // Validation et correction du fichier
        const { file, converted, realMime } = await validateAndFixFile(originalFile);

        if (converted) {
          console.log(`Image convertie : ${originalFile.name} → ${file.name} (${realMime})`);
        }

        const itemName = file.name.substring(0, file.name.lastIndexOf("."));

        if (!itemName) {
          results.errors.push(`Image ignorée (nom invalide) : ${originalFile.name}`);
          continue;
        }

        // Résolution de l'élément GLPI par le nom original (sans extension)
        const originalName = originalFile.name.substring(0, originalFile.name.lastIndexOf("."));
        const resolved = await resolveItem(originalName);

        if (!resolved) {
          results.errors.push(`Image '${originalFile.name}' : élément '${originalName}' introuvable dans GLPI`);
          continue;
        }

        await uploadAndLinkImage(file, resolved.itemtype, resolved.id);

        totalUpload++;
        results.images.push({
          fileName:      originalFile.name,
          uploadedAs:    file.name,
          itemName:      originalName,
          itemtype:      resolved.itemtype,
          itemId:        resolved.id,
          converted,
          status:        "success",
        });
        results.summary.successImages++;

      } catch (error) {
        results.errors.push(`Image '${originalFile.name}' : ${error.message}`);
        console.error(`✗ Erreur image ${originalFile.name} :`, error.response?.data || error.message);
      }
    }

    results.done.push(`Fichiers uploadés : ${totalUpload}`);
    results.summary.totalErrors = results.errors.length;

    onProgress({
      step:        "complete",
      message:     "complete",
      description: "Import des images terminé !",
      percentage:  100,
    });

    return results;

  } catch (error) {
    results.errors.push(`Erreur générale images : ${error.message}`);
    results.summary.totalErrors = results.errors.length;
    throw error;
  }
};