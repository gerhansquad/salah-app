export {promiseHandler, makeTimestamp, getFileEntry, getFileContent, writeToFile}



function getKeyByValue(object, value) {
	return Object.keys(object).find((key) => object[key] == value)
}

function makeTimestamp(time, yearNo, monthNo, dayNo) {
	let date = new Date()
    date.setFullYear(yearNo)
    date.setDate(dayNo)
    date.setMonth(parseInt(monthNo)-1)
	let hour = time.split(":")[0]
	hour = hour == 0 ? 24 : hour
	date.setHours(hour)
	date.setMinutes(time.split(":")[1])
	date.setSeconds(0)
	return date
}

async function promiseHandler(promise, ...args) {   
	try {
		const data = await promise(...args)
		return [data, null]
	} catch (error) {
		return [null, error]
	}
}

async function getFileEntry() {
	console.log("GETTING FILE ENTRY")

	const [FileEntry, error] = await promiseHandler(getFilePromise)
	error ? console.error("ERROR WHILE GETTING FILE ENTRIES: ", error) : null
	return FileEntry

	function getFilePromise(...args) {
		return new Promise((res, rej) => {
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFsSuccessHandler, getFsErrorHandler)

			function getFsErrorHandler(event) {
				rej(event.target.error.code)
			}

			// Receives a FileSystem object
			function getFsSuccessHandler(fileSystem) {
				// create salah FileEntry object representing the salah file on a file system
				fileSystem.root.getFile("salah-data.json", { create: true }, getFileEntrySuccessHandler, getFileEntryErrorHandler)

				function getFileEntryErrorHandler(error) {
					rej(error)
				}

				// Receives a FileEntry object
				function getFileEntrySuccessHandler(fileEntry) {
					res(fileEntry)
				}
			}
		})
	}
}

async function getFileContent(fileEntry) {
	console.log("FILE GOING TO BE READ: " + JSON.stringify(fileEntry, null, 4))
	const [data, error] = await promiseHandler(getFileDataPromise)
	error && console.error("ERROR WHILE READING FILE: ", error)
	return data

	function getFileDataPromise(...args) {
		/**
		 * - Creates a File object (not an actual file on the fs) containing file properties.
		 * - Allows JavaScript to access the file content.
		 * - Represents the current state of the file that the FileEntry represents.
		 */
		return new Promise((res, rej) => {
			fileEntry.file(createFileSuccessHandler, createFileErrorHandler)

			function createFileErrorHandler(error) {
				rej(error)
			}

			// Receives a File object
			function createFileSuccessHandler(file) {
				// create a FileReader object
				var reader = new FileReader()

				// asynchronously load file data into memory
				console.log(`Starting file read...\n`)
				reader.readAsText(file)

				// set handler for "done loading file data into memory" event
				reader.onloadend = function (event) {
					if (reader.result.trim() == "") res(reader.result)
					else res(JSON.parse(reader.result))
				}

				// set handler for a file reading error event
				reader.onerror = function (error) {
					rej(error)
				}
			}
		})
	}
}

function writeToFile(fileEntry, data) {
	const createWriterSuccessHandler = (fileWriter) => {
		fileWriter.onwriteend = (event) => {
			console.log(`Successful file write to ${fileEntry.name}`)
		}

		fileWriter.onerror = (error) => {
			throw error
		}

		fileWriter.write(data)
	}

	const createWriterErrorHandler = (error) => {
		throw error
	}

	fileEntry.createWriter(createWriterSuccessHandler, createWriterErrorHandler)
}
