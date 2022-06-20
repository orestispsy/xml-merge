import React, { useEffect, useState} from 'react'

import axios from '../components/common/axios'

export default function Tools({
    getXmLinks,
    resetApp,
    library,
    setLibrary,
    jobRunning,
}) {
    const [newFile, setNewFile] = useState(false)
    const [newUrl, setNewUrl] = useState(false)
    const [fileId, setFileId] = useState()
    const [name, setName] = useState(false)
    const [showContent, setShowContent] = useState(false)

    const removeFromLibrary = (url, name, id) => {
        axios
            .post('/remove-from-library', { url: url, name: name, id: id })
            .then(({ data }) => {
                setLibrary(data.library)
                setNewUrl(false)
            })
            .catch((err) => {
                console.log('error', err)
            })
    }

    const updateLibrary = () => {
        axios
            .post('/update-library', {
                url: newFile,
                name: name,
                id: library.length + 1,
            })
            .then(({ data }) => {
                setLibrary(data.library)
                setNewUrl(false)
            })
            .catch((err) => {
                console.log('error', err)
            })
    }

    useEffect(() => {}, [])

    return (
        <div className="tools_container">
            {jobRunning && showContent && (
                <div className="progress">Work In Progress</div>
            )}
            <div
                className="tools_toggler"
                onClick={(e) => {
                    setShowContent(!showContent)
                }}
            >
                {(!showContent && `tools`) || `close`}
            </div>
            {showContent &&
                !jobRunning &&
                library &&
                library.map((item, index) => {
                    return (
                        <div className="tools_link_container" key={index}>
                            <div
                                className="tools_link_refresh"
                                onClick={(e) => {
                                    setNewUrl(false)
                                    resetApp()
                                    getXmLinks(item.master, item.name)
                                }}
                            >
                                ↺
                            </div>
                            <div className="tools_link_name">{item.name}</div>
                            <div className="tools_link">{item.master}</div>
                            <div
                                className="tools_link_remove"
                                onClick={(e) => {
                                    setFileId(item.id)
                                    setNewUrl(false)
                                    removeFromLibrary(
                                        item.master,
                                        item.name,
                                        item.id
                                    )
                                }}
                            >
                                -
                            </div>
                        </div>
                    )
                })}
            {showContent && !jobRunning && (
                <div className="tools_link_add_container">
                    {newUrl && (
                        <div className="tools_link_add_label">Name:</div>
                    )}
                    {newUrl && (
                        <input
                            onChange={(e) => setName(e.target.value)}
                        ></input>
                    )}
                    {newUrl && <div className="tools_link_add_label">url:</div>}
                    {newUrl && (
                        <input
                            onChange={(e) => setNewFile(e.target.value)}
                        ></input>
                    )}
                    {newUrl && (
                        <div
                            className="button_tools"
                            onClick={(e) => {
                                updateLibrary()
                            }}
                        >
                            Go
                        </div>
                    )}
                    <div
                        className="tools_link_add"
                        onClick={(e) => {
                            setNewUrl(!newUrl)
                        }}
                    >
                        +
                    </div>
                </div>
            )}
        </div>
    )
}
