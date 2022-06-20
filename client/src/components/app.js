import React, { useEffect, useState, useRef } from 'react'

import axios from '../components/common/axios'

import Tools from './tools'

export default function App({}) {
    const [file, setFile] = useState('')
    const [name, setName] = useState('')
    const [links, setLinks] = useState('')
    const [finalLink, setFinalLink] = useState('')
    const [downloadFinished, setDownloadFinished] = useState(false)
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [steps, setSteps] = useState(0)
    const [error, setError] = useState(false)
    const [fileCount, setFileCount] = useState(0)
    const [library, setLibrary] = useState()
    const [jobRunning, setJobRunning] = useState()

    let length
    let finalLinks
    const screenRef = useRef()

    useEffect(() => {
        if (library && file) {
            setName(library.filter((item) => item.master === file)[0].name)
        }
    }, [file])

    useEffect(() => {
        getLibrary()
    }, [])

    useEffect(() => {
        setChatScrollBarPosition()
    }, [steps])

    useEffect(() => {
        if (fileCount !== 0) {
            setChatScrollBarPosition()
        }
    }, [fileCount])

    const resetApp = () => {
        setLinks('')
        setDownloadFinished(false)
        setDownloading(false)
        setFinalLink('')
        setLoadingFiles(false)
        setSteps(0)
        setFile('')
        setError(false)
        setFileCount(0)
        setName('')
    }

    const getLibrary = () => {
        axios
            .get('/library')
            .then(({ data }) => {
                setLibrary(data.library)
            })
            .catch((err) => {
                console.log('error', err)
                setJobRunning(false)
            })
    }

    const getXmLinks = (file2get, name2get) => {
        setJobRunning(true)
        axios
            .post('/master-xml', {
                url: (file2get && file2get.trim()) || file.trim(),
                name: (name2get && name2get) || name,
            })
            .then(({ data }) => {
                if (data) {
                    setLinks(data.data)
                    length = data.data.length
                    let objectShorter = []
                    data.data.forEach((url, index) => {
                        objectShorter[index] = { url: url, done: false }
                    })
                    setLinks(objectShorter)
                    finalLinks = objectShorter
                    setTimeout(() => {
                        links2files()
                        setSteps(data.steps.step)
                    }, 3000)
                }
                console.log(data)
            })
            .catch((err) => {
                console.log('error', err)
                setError('Error! Problem Reading URL')
                setJobRunning(false)
            })
    }

    const links2files = () => {
        setDownloading(true)

        axios
            .get('/links-to-files')
            .then(({ data }) => {
                setDownloading(false)
                finalLinks[data.downloaded - 1].done = true
                if (data.downloaded <= length - 1) {
                    links2files()
                    setFileCount(data.downloaded)

                    setSteps(data.steps.step)
                } else {
                    getFinalLink()
                    setDownloadFinished(true)
                    console.log('All Downloaded', data)
                    setDownloading(false)
                    setSteps(data.steps.step)
                }
            })
            .catch((err) => {
                console.log('error', err)
                setError('Error! Download Failed')
                setJobRunning(false)
            })
    }

    const getFinalLink = () => {
        axios
            .get('/get-final-xml')
            .then(({ data }) => {
                console.log('Job Done!', data)
                setFinalLink(data.link)
                setSteps(data.steps.step)
                setJobRunning(false)
            })
            .catch((err) => {
                console.log('error', err)
                setError('Error! Merging Files')
                setJobRunning(false)
            })
    }

    const setChatScrollBarPosition = () => {
        if (screenRef.current) {
            screenRef.current.scrollTop =
                screenRef.current.scrollHeight - screenRef.current.clientHeight
        }
    }

    const url2file = (url) => {
        let fileName = url.split('/')

        return fileName[fileName.length - 1]
    }

    return (
        <div
            className="container"
            style={{ justifyContent: !file && 'center' }}
        >
            {!links && (
                <div className="searchBar">
                    <select
                        onChange={(e) => {
                            setFile(e.target.value)
                            setError(false)
                        }}
                    >
                        <option>Select Dealer</option>
                        {library &&
                            library
                                .map((item, index) => (
                                    <option value={item.master} key={index}>
                                        {item.name}
                                        {` -> `}
                                        {item.master}
                                    </option>
                                ))
                                .reverse()}
                    </select>

                    <div
                        className="button"
                        onClick={() => {
                            if (file.trim().startsWith('http')) {
                                getXmLinks()
                                setLoadingFiles(true)
                            } else if (file) {
                                setError(
                                    `Error! Url must contain either 'http://' or 'https://'`
                                )
                            }
                        }}
                    >
                        Go
                    </div>
                </div>
            )}

            {!error && file !== '' && (
                <div className="linkFocused">
                    <div className="desc">
                        {'source: '}
                        <span>{file}</span>
                    </div>
                </div>
            )}

            {error && <div className="error">{error}</div>}
            {links && !error && (
                <div className="screen" ref={screenRef}>
                    <div className="links">
                        {links && <div className="desc">{'Linked Files'}</div>}

                        {!links && loadingFiles && (
                            <div className="loading"></div>
                        )}
                        {links &&
                            links.map((link, index) => {
                                return (
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        key={index}
                                    >
                                        {link.url}
                                        {link.done && ` ✔️`}
                                    </a>
                                )
                            })}
                    </div>
                    {!links && loadingFiles && (
                        <div className="progress">Loading Your Files</div>
                    )}
                    {downloading && (
                        <div className="download_progress">
                            <span>Downloading File </span>
                            <div>{url2file(links[fileCount].url)}</div>
                        </div>
                    )}
                    {downloadFinished && !finalLink && (
                        <div className="progress">Merging Files</div>
                    )}

                    {finalLink && <div className="descFinal">Job Done !</div>}
                    {finalLink && (
                        <a href={finalLink} className="finalLink">
                            {'DOWNLOAD FILE'}
                        </a>
                    )}
                </div>
            )}
            {file && (
                <div
                    className="led"
                    style={{
                        backgroundColor: error && 'crimson',
                        boxShadow: error && '0 0 20px crimson',
                        animation:
                            (!error &&
                                loadingFiles &&
                                !finalLink &&
                                'ledBlink 1s  infinite step-end') ||
                            (finalLink && 'unset') ||
                            (error && 'unset'),
                    }}
                ></div>
            )}
            {(finalLink || error) && (
                <div
                    className="restart"
                    onClick={(e) => {
                        resetApp()
                    }}
                >
                    Restart
                </div>
            )}
            <Tools
                getXmLinks={(file2get, name2get) =>
                    getXmLinks(file2get, name2get)
                }
                resetApp={(e) => resetApp(e)}
                library={library}
                setLibrary={(e) => setLibrary(e)}
                jobRunning={jobRunning}
            />
        </div>
    )
}
