import path from 'path';
import fs from 'fs';
import { homedir } from 'os';

function flattenTree(tree) {
  const files = [];

  for (const entry of tree) {
    if (entry.isFile || entry.isSymlink) {
      files.push(entry);
    }

    if (entry.isDirectory) {
      files.push(flattenTree(entry.contents));
    }
  }

  return files.flat();
}

function absolutizePath(path) {
  return path.replace(/^~/, homedir());
}

// flatten = true ==> return a list of files instead of a tree (with directories as parent nodes in the tree)
// this function ignores symlinks
// scanpath argument is used only inside recursion to keep track of original scan start
// it is not ment as a part of api

// example: find all the images:
// scan.recursive(path, { flatten: true, filter: scan.mediaFilter({ mediaType: 'image' }) });
//
// Warning: does not include symlinks by default (you have to use includeSymlinks: true)
// Warning: filter is applied at each step, not at the end
// if checking for specific extensions or anything that checks the filenames, make sure to check only if not directory
// like it was done for the courtesy argument option extname ....
function recursive(_path, { flatten = false, filter = () => true, extname = null, includeSymlinks = false } = {}, scanpathRecursionState = null) {
  const fullPath = absolutizePath(_path);

  const list = fs.readdirSync(fullPath).map(relPath => `${fullPath}/${relPath}`);

  scanpathRecursionState = scanpathRecursionState || fullPath;

  const result = list
    .map(fileOrDir => {
      const info = {
        reldir: path.relative(scanpathRecursionState, path.dirname(fileOrDir)),
        relpath: path.join(path.relative(scanpathRecursionState, path.dirname(fileOrDir)), path.basename(fileOrDir)),
        dirname: path.dirname(fileOrDir),
        basename: path.basename(fileOrDir)
      };

      // file can disappear in meantime
      if (fs.existsSync(fileOrDir)) {
        if (fs.lstatSync(fileOrDir).isFile()) {
          info.extname = path.extname(fileOrDir);

          return Object.assign(
            {
              isFile: true,
              path: fileOrDir
            },
            info
          );
        }

        if (fs.lstatSync(fileOrDir).isDirectory()) {
          return Object.assign(
            {
              isDirectory: true,
              path: fileOrDir
            },
            Object.assign(info, { contents: recursive(fileOrDir, { filter, includeSymlinks }, scanpathRecursionState) })
          );
        }

        if (includeSymlinks && fs.lstatSync(fileOrDir).isSymbolicLink()) {
          info.extname = path.extname(fileOrDir);

          return Object.assign(
            {
              isSymlink: true,
              path: fileOrDir
            },
            info
          );
        }
      }

      return null;
    })
    .filter(Boolean);

  const filteredResults = flatten ? flattenTree(result).filter(filter) : result.filter(filter);

  if (extname) {
    return filteredResults.filter(entry => entry.isDirectory || (entry.isFile && entry.extname == extname));
  }

  // added recently
  return filteredResults.filter(({ basename }) => basename != '.DS_Store');
}

export { recursive };
