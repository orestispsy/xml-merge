var path = require('path')
fs = require('fs')

const http = require('http')

let library = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'tools.json'), 'utf8')
)


const compression = require('compression')
var express = require('express')
var app = express()
app.set('port', process.env.PORT || 3001)
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(compression())

var parser = require('xml2json')
var json2xml = require('json2xml')

var parserOptions = {
    object: true,
    reversible: false,
    coerce: false,
    sanitize: true,
    trim: true,
    arrayNotation: false,
    alternateTextNode: false,
}

let file
let finalFileName
var json
let xmlFile
let fullXmlFile = []
let checker
let checkFilesDone
let checkFilesDone2
let checkDownloaded
let i

const fireFileRequest = (url) => {
    const request = http.get(url, function (response) {
        response.pipe(file)

        file.on('finish', () => {
            console.log(`Download FROM ${url} Completed`)

            xmlFile = fs.readFileSync(
                path.join(__dirname, 'uploads', 'master.xml'),
                'utf8'
            )

            file.close()

            json = parser.toJson(xmlFile, parserOptions)
            i = 0
            checker = 0

            checkFilesDone2()
        })
    })
}

const downloadFileRequest = () => {
    if (i <= json.cardealer.include.length - 1) {
        let url = json.cardealer.include[i]

        let fileName = url.split('/')

        if (url.startsWith('https') || url.startsWith('http')) {
            if (url.startsWith('https')) {
                url = handleAddress(url)

                console.log(
                    'Downloading File... ',
                    fileName[fileName.length - 1]
                )
                try {
                    file = fs.createWriteStream(
                        path.join(
                            __dirname,
                            
                            'uploads',
                            `file${i}.xml`
                        )
                    )
                } catch (err) {
                    console.log(err)
                } finally {
                    fileHTTPRequest(url)
                }
            }
        }
    }
}

const fileHTTPRequest = (url) => {
    const request = http.get(url, function (response) {
        response.pipe(file)

        file.on('finish', () => {
            file.close()
            console.log(`Download FROM ${url} Completed`)
            i = i + 1
            checker = checker + 1
            if (i !== 0 && !json.cardealer.include) {
                fullXmlFile = fullXmlFile.concat(json)
            }

            finalXMLMerger(i - 1)
        })
    })
}

const shortCarDealer = () => {
    let date = new Date(
        new Date().toString().split('GMT')[0] + ' UTC'
    ).toISOString()

    let test = [
        {
            cardealer: {
                classifieds: {
                    classified: [],
                },
                lastUpdate: date,
            },
        },
    ]
    let classified = []
    for (let x = 0; x <= fullXmlFile.length - 1; x++) {
        classified = classified.concat(
            fullXmlFile[x].cardealer.classifieds.classified
        )
    }
    let newJson
    newJson = classified.map((rec, index) => {
        return {
            classified: rec,
        }
    })
    test[0].cardealer.classifieds = newJson

    fullXmlFile = test
}

const finalXMLMerger = (x) => {
    if (x === json.cardealer.include.length) {
        checkFilesDone()
    } else {
        if (x === 0) {
            fullXmlFile = []
        }
        try {
            xmlFile = fs.readFileSync(
                path.join(__dirname, 'uploads', `file${x}.xml`)
            )
        } catch (err) {
            console.log(err)
        } finally {
            fullXmlFile = fullXmlFile.concat(
                parser.toJson(xmlFile, parserOptions)
            )
            checkDownloaded(checker)
        }
    }
}

const handleAddress = (address) => {
    let url

    if (address.startsWith('https://')) {
        url = address.replace(/^https:\/\//i, 'http://')
    } else {
        url = address
    }

    return url
}

const cleanDiskFiles = () => {
    json.cardealer.include.forEach((item, index) => {
        fs.unlink(
            path.join(__dirname, 'uploads', `file${index}.xml`),
            function (err) {
                if (err) {
                    console.log(err)
                }
            }
        )
    })
    fs.unlink(
        path.join(__dirname, 'uploads', `master.xml`),
        function (err) {
            if (err) {
                console.log(err)
            }
        }
    )
    console.log('--Remove Downloaded Files From Disk--')
}

app.post('/master-xml', (req, res) => {
    let url = handleAddress(req.body.url)
    console.log('url', url)
    finalFileName = req.body.name
    console.log(`Downloading Master File From ${url}...`)
    file = fs.createWriteStream(
        path.join(__dirname, 'uploads', 'master.xml')
    )

    checkFilesDone2 = () => {
        res.json({
            data: json.cardealer.include,
            steps: { step: 1 },
        })
        return
    }

    fireFileRequest(url)
})

app.post('/update-library', (req, res) => {
    library = library.concat({
        id: req.body.id,
        name: req.body.name,
        master: req.body.url,
    })
    fs.writeFileSync('./server/tools.json', JSON.stringify(library))
    res.json({
        library: library,
    })
})

app.post('/remove-from-library', (req, res) => {
    library = library.filter((item) => item.id !== req.body.id)
    fs.writeFileSync('./server/tools.json', JSON.stringify(library))
    res.json({
        library: library,
    })
})

app.get('/library', (req, res) => {
    res.json({
        library: library,
    })
})

app.get('/links-to-files', (req, res) => {
    checkDownloaded = (fileNumber) => {
        res.json({
            downloaded: fileNumber,
            fullXmlFile: fullXmlFile,
            steps: { step: 2 + fileNumber / 10 },
        })
        return
    }
    checkFilesDone = () => {
        res.json({
            steps: { step: 3 },
        })
        console.log('ALL FILES DOWNLOADED')
        console.log('Writing Final XML...')
        return
    }
    downloadFileRequest()
})

app.get('/get-final-xml', (req, res) => {
    shortCarDealer()
    let back2Xml = json2xml(fullXmlFile)

    file = fs.createWriteStream(`./client/public/uploads/${finalFileName}.xml`)
    try {
        fs.writeFileSync(`./client/public/uploads/${finalFileName}.xml`, back2Xml)
        cleanDiskFiles()
    } catch (err) {
        console.error(err)
    } finally {
        console.log('Job Done!')

        res.json({
            xml: fullXmlFile,
            link: `/uploads/${finalFileName}.xml`,
            steps: { step: 4 },
        })
    }
})

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'))
})

var server = app.listen(app.get('port'), function () {
    console.log('🟢 NEW Project Listening Port:', server.address().port)
})
