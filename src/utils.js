
const fs = require('fs')
const pathUtils = require('path')

const permRequestKeys = [
  '@context',
  'id',
  'parentCapability',
  'invoker',
  'date',
  'caveats',
  'proof'
]

module.exports = {
  isFile,
  isDirectory,
  getOutfilePath,
  logError,
  permRequestKeys,
  validateDirPath,
  validateFilePath,
  validateOutfileName
}

// misc utils

/**
 * Logs an error message to console. Logs original error if it exists and
 * the verboseErrors global is true.
 * 
 * @param {string} msg - The error message
 * @param {Error} err - The original error
 */
function logError(msg, err) {
  console.error(msg)
  if (err && mm_plugin.verboseErrors) console.error(err)
}

/**
 * Gets the complete out file path from the source file path and output
 * directory path. 
 * 
 * @param {string} srcFilePath - The source file path
 * @param {string} outDir - The out file directory
 * @returns {string} - The complete out file path
 */
function getOutfilePath(outDir, outFileName) {
  return pathUtils.join(outDir, outFileName || 'bundle.js')
}

/**
 * Ensures that the outfile name is just a js file name.
 * Throws on validation failure
 *
 * @param {string} str - The file name to validate
 * @returns {boolean} - True if validation succeeded
 */
function validateOutfileName(str) { 
  if (!str.endsWith('.js') || str.indexOf('/') !== -1) {
    throw new Error(`Invalid outfile name: ${str}`)
  }
  return true
}

/**
 * Validates a file path.
 * Throws on validation failure
 * 
 * @param {string} filePath - The file path to validate
 * @returns {boolean} - True if validation succeeded
 */
async function validateFilePath(filePath) {

  const exists = await isFile(filePath)

  if (!exists) {
    throw new Error(`Invalid params: '${filePath}' is not a file or does not exist.`)
  }

  return true
}

/**
 * Validates a directory path.
 * Throws on validation failure
 * 
 * @param {string} dirPath - The directory path to validate
 * @returns {boolean} - True if validation succeeded
 */
async function validateDirPath(dirName, createDir) {

  const exists = await isDirectory(dirName, createDir)

  if (!exists) {
    throw new Error(`Invalid params: '${dirName}' is not a directory or could not be created.`)
  }

  return true
}

/**
 * Checks whether the given path string resolves to an existing directory, or 
 * if a directory was created.
 * @param {string} p - The path string to check
 * @param {boolean} createDir - Whether to create the directory if it doesn't exist
 * @returns {boolean} - Whether the given path is an existing directory
 */
function isDirectory(p, createDir) {
  return new Promise((resolve, _) => {
    fs.stat(p, (err, stats) => {
      if (err || !stats) {
        if (err.code === 'ENOENT') {
          if (!createDir) return resolve(false)
          try {
            fs.mkdirSync(p)
            return resolve(true)
          } catch (err) {
            logError(`Directory '${p}' could not be created.`, err)
            process.exit(1)
          }
        }
        return resolve(false)
      }
      resolve(stats.isDirectory())
    })
  })
}

/**
 * Checks whether the given path string resolves to an existing file.
 * @param {string} p - The path string to check
 * @returns {boolean} - Whether the given path is an existing file
 */
function isFile(p) {
  return new Promise((resolve, _) => {
    fs.stat(p, (err, stats) => {
      if (err || !stats) {
        return resolve(false)
      }
      resolve(stats.isFile())
    })
  })
}
