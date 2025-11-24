import { basename, extname, join } from "path";

const projectRoot = process.cwd();
const assetsRoot = join(projectRoot, "src");

export type ImageFileParts = {
  readonly baseName: string;
  readonly extension: string;
};

export type ImagePaths = {
  readonly originalPath: string;
  readonly thumbnailPath: string;
};

export function splitFilename(filePath: string): ImageFileParts {
  const extension = extname(filePath);
  const baseName = basename(filePath, extension);
  return { baseName, extension };
}

export function buildPathsFromSrc(src: string): ImagePaths {
  const { baseName, extension } = splitFilename(src);
  return {
    originalPath: join(assetsRoot, src),
    thumbnailPath: join(assetsRoot, `${baseName}-thumbnail${extension}`),
  };
}

export function buildPathsFromBase(
  baseName: string,
  extension: string,
): ImagePaths {
  return {
    originalPath: join(assetsRoot, `${baseName}${extension}`),
    thumbnailPath: join(assetsRoot, `${baseName}-thumbnail${extension}`),
  };
}
