import { resolve } from 'path'
import { Dirent, mkdir, promises, writeFile } from 'fs'

const PAGES_DIR = resolve(__dirname, 'src', 'pages')
const COMPONENTS_DIR = resolve(__dirname, 'src', 'components')
const UNITS_DIR = resolve(__dirname, 'tests', 'unit')
const TYPES_DIR = resolve(__dirname, 'tests', 'unit')

async function* readDirR (path: string): AsyncIterable<string> {
    const entries = await promises.readdir(path, { withFileTypes:true })

    for (const entry of entries) {
        const emptyDir = entries.filter((de: Dirent) => de.isDirectory()).length
        const fullPath = resolve(path, entry.name)

        if (entry.isDirectory() && emptyDir) {
            yield fullPath
            yield* readDirR(fullPath)
        } else if (entry.isDirectory() && !emptyDir) {
            yield fullPath
        }
    }
}

const showTree = async (path:string): Promise<string[]> => {
    const result = []

    for await (const file of readDirR(path)) {
        result.push(file.replace(`${path}/`, ''))
    }

    return result
}

export const treeCheck = async (): Promise<{ missingUnits: string[]; missingComp: string[] }> => {
    const pageContent: string[] = await showTree(PAGES_DIR)
    const compContent: string[] = await showTree(COMPONENTS_DIR)
    const unitContent: string[] = await showTree(UNITS_DIR)

    const missingComp = pageContent.filter((el:string) => !compContent.includes(el))
    const missingUnits = compContent.filter((el:string) => !unitContent.includes(el))

    return { missingComp, missingUnits }
}

export const treeSync = async () => {
    const { missingComp, missingUnits } = await treeCheck()

    missingComp.forEach(dir => {
        const path = `${COMPONENTS_DIR}/${dir}`

        mkdir(path, { recursive: true }, err => {
            if (err) throw err

            writeFile(`${path}/.gitkeep`, '', err => {
                if (err) throw err
            })
        })
    })

    missingUnits.forEach(dir => {
        const path = `${UNITS_DIR}/${dir}`

        mkdir(path, { recursive: true }, err => {
            if (err) throw err

            writeFile(`${path}/.gitkeep`, '', err => {
                if (err) throw err
            })
        })
    })

    return { missingComp, missingUnits }
}

for (let i = 0; i < process.argv.length; i++) {
    const item = process.argv[i]

    switch (item) {
        case 'check': {
            (async () => {
                const { missingComp, missingUnits } = await treeCheck()

                console.group('*** MISSING COMPONENTS FOLDERS ***')
                console.log(missingComp)
                console.groupEnd()
                console.log('*** END ***')

                console.log('-----------')

                console.group('*** MISSING UNITS FOLDERS ***')
                console.log(missingUnits)
                console.groupEnd()
                console.log('*** END ***')
            })()

            break
        }
        case 'sync':
            (async () => {
                const { missingComp, missingUnits } = await treeSync()

                console.group('*** CREATED COMPONENTS FOLDERS ***')
                console.log(missingComp)
                console.groupEnd()
                console.log('*** END ***')

                console.log('-----------')

                console.group('*** CREATED UNITS FOLDERS ***')
                console.log(missingUnits)
                console.groupEnd()
                console.log('*** END ***')

            })()
            break
    }
}

export default {
    treeCheck,
    treeSync
}
