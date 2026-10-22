import { launchCamera, launchImageLibrary, ImagePickerResponse, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

/**
 * Las fotos se reducen y comprimen y se devuelven como data URI
 * ("data:image/jpeg;base64,..."), así se pueden guardar directo en
 * Firestore y siguen existiendo después de cerrar la app (el uri de
 * archivo que entrega el picker vive en una carpeta temporal).
 * ~480 px, calidad 0.6 → normalmente 25–70 KB.
 */
const COMMON = {
  mediaType: 'photo' as const,
  maxWidth: 480,
  maxHeight: 480,
  quality: 0.6 as const,
  includeBase64: true,
};

function extractImage(result: ImagePickerResponse): string | null {
  if (result.didCancel || result.errorCode) return null;
  const asset = result.assets?.[0];
  if (!asset) return null;
  if (asset.base64) {
    const type = asset.type ?? 'image/jpeg';
    return `data:${type};base64,${asset.base64}`;
  }
  return asset.uri ?? null;
}

/** Abre la cámara y devuelve la foto (data URI), o null si se canceló/falló. */
export async function pickImageFromCamera(): Promise<string | null> {
  const options: CameraOptions = { ...COMMON, saveToPhotos: false };
  return extractImage(await launchCamera(options));
}

/** Abre la galería y devuelve la imagen (data URI), o null si se canceló/falló. */
export async function pickImageFromLibrary(): Promise<string | null> {
  const options: ImageLibraryOptions = { ...COMMON, selectionLimit: 1 };
  return extractImage(await launchImageLibrary(options));
}
