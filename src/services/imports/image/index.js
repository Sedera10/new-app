import { resolveItem } from "../file2/helper";
import { createItem, authHeaders } from '../../api';
import {api} from '../../api';

export const uploadAndLinkImage = async (file, itemtype, itemId) => {
  const formData = new FormData();
  formData.append("uploadManifest", JSON.stringify({
    input: {
      name: file.name.replace(/\.(png|jpg|jpeg)$/i, ""),
      _filename: [file.name],
      entities_id: 0,
    }
  }));
  formData.append("filename[0]", file);

  const uploadResponse = await api.post("/Document", formData, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

  const document = uploadResponse.data;
  if (!document?.id) {
    throw new Error(`Upload échoué pour ${file.name}`);
  }

  const link = await createItem("Document_Item", {
    documents_id: document.id,
    itemtype,
    items_id:    itemId,
    entities_id: 0,
  });

  return { document, link };
};

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
      const file = validImages[i];

      onProgress({
        step:        "images",
        message:     "images",
        description: `Image ${i + 1} / ${validImages.length} : ${file.name}`,
        percentage:  Math.round(((i + 1) / validImages.length) * 100),
      });

      try {
        const itemName = file.name.substring(0, file.name.lastIndexOf("."));

        if (!itemName) {
          results.errors.push(`Image ignorée (nom invalide) : ${file.name}`);
          continue;
        }

        const resolved = await resolveItem(itemName);

        if (!resolved) {
          results.errors.push(`Image '${file.name}' : élément '${itemName}' introuvable dans GLPI`);
          continue;
        }

        await uploadAndLinkImage(file, resolved.itemtype, resolved.id);

        totalUpload++;
        results.images.push({
          fileName: file.name,
          itemName,
          itemtype: resolved.itemtype,
          itemId:   resolved.id,
          status:   "success",
        });
        results.summary.successImages++;

      } catch (error) {
        results.errors.push(`Image '${file.name}' : ${error.message}`);
      }
    }

    results.done.push(`Fichiers uploadés : ${totalUpload}`); // ✅ template string
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