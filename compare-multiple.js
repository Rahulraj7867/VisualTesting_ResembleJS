function getRelativeImagePath(from, to) {
    let relativePath = path.relative(path.dirname(from), to);
    return relativePath.split(path.sep).join('/'); // Convert Windows backslash paths to web standard forward slashes
  }