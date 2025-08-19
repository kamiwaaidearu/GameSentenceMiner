import { useState, useEffect } from 'react';

const ipcRenderer = window.electron.ipcRenderer;

interface Scene {
    id: string;
    name: string;
}

interface Window {
    title: string;
    value: string;
}

interface GSMStatus {
    ready: boolean;
    status: string;
    websockets_connected: string[];
    obs_connected: boolean;
    anki_connected: boolean;
    last_line_received: string;
    words_being_processed: string[];
    clipboard_enabled: boolean;
}

export const HomePage: React.FC = () => {
    const [selectedScene, setSelectedScene] = useState<string>('');
    const [selectedWindow, setSelectedWindow] = useState<Window>({ title: '', value: '' });
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [windows, setWindows] = useState<Window[]>([]);
    const [gsmStatus, setGsmStatus] = useState<GSMStatus | null>(null);

    const openExternalLink = (url: string) => {
        ipcRenderer.invoke('open-external-link', url);
    };

    const handleSceneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedScene(value);
        ipcRenderer.invoke('obs.switchScene.id', value);
    };

    const handleOpenGSMSettings = async () => {
        console.log('Opening GSM Settings');
        await ipcRenderer.invoke('settings.openGSMSettings');
    };

    const handleRunOverlay = async () => {
        console.log('Running Overlay');
        await ipcRenderer.invoke('runOverlay');
    };

    const getScenes = async () => {
        try {
            const fetchedScenes = await ipcRenderer.invoke('obs.getScenes');
            const activeScene = await ipcRenderer.invoke('obs.getActiveScene');

            if (activeScene && !fetchedScenes.some((s: Scene) => s.id === activeScene.id)) {
                fetchedScenes.push(activeScene);
            }

            setScenes(fetchedScenes);
            if (activeScene) {
                setSelectedScene(activeScene.id);
            }
        } catch (error) {
            console.error('Error fetching scenes:', error);
        }
    };

    const getWindows = async () => {
        try {
            const fetchedWindows = await ipcRenderer.invoke('obs.getWindows');
            setWindows(fetchedWindows);
        } catch (error) {
            console.error('Error fetching windows:', error);
        }
    };

    const handleRefreshScenes = () => {
        getScenes();
    };

    const handleRemoveScene = async () => {
        if (selectedScene) {
            await ipcRenderer.invoke('obs.removeScene', selectedScene);
            getScenes();
        }
    };

    const handleWindowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = event.target.selectedOptions[0];
        setSelectedWindow({
            title: selectedOption.textContent || '',
            value: selectedOption.value,
        });
    };

    const handleRefreshWindows = () => {
        getWindows();
    };

    const handleCreateNewScene = async () => {
        if (selectedWindow.title && selectedWindow.value) {
            const windowData = {
                title: selectedWindow.title,
                value: selectedWindow.value,
                sceneName: selectedWindow.title,
            };
            console.log(windowData);
            await ipcRenderer.invoke('obs.createScene', windowData);
            getScenes();
        }
    };

    const handleCreateNewGameScene = async () => {
        if (selectedWindow.title && selectedWindow.value) {
            const windowData = {
                title: selectedWindow.title,
                value: selectedWindow.value,
                sceneName: selectedWindow.title,
            };
            console.log(windowData);
            await ipcRenderer.invoke('obs.createScene.Game', windowData);
            getScenes();
        }
    };

    const getRelativeTime = (timestamp: string) => {
        if (!timestamp) return 'Not received yet';

        const timeDifference = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

        if (isNaN(timeDifference)) return 'Not received yet';
        if (timeDifference < 60) return `${timeDifference} seconds ago`;
        if (timeDifference < 3600) return `${Math.floor(timeDifference / 60)} minutes ago`;
        if (timeDifference < 86400) return `${Math.floor(timeDifference / 3600)} hours ago`;
        return `${Math.floor(timeDifference / 86400)} days ago`;
    };

    const fetchGSMStatus = async () => {
        try {
            const status = await ipcRenderer.invoke('get_gsm_status');
            setGsmStatus(status);
        } catch (error) {
            console.error('Error fetching GSM status:', error);
            setGsmStatus(null);
        }
    };

    // init scenes and windows
    useEffect(() => {
        getScenes();
        getWindows();
    }, []);

    // poll for gsmStatus
    useEffect(() => {
        if (!!gsmStatus) return;
        const statusInterval = setInterval(fetchGSMStatus, 200);
        return () => clearInterval(statusInterval);
    }, [gsmStatus]);

    return (
        <>
            <div className="card">
                <h2>Game Capture (Required)</h2>
                <div className="input-group">
                    <label htmlFor="sceneSelect">Game:</label>
                    <select
                        id="sceneSelect"
                        value={selectedScene}
                        onChange={handleSceneChange}
                    >
                        {scenes.map((scene) => (
                            <option
                                key={scene.id}
                                value={scene.id}
                            >
                                {scene.name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleRefreshScenes}>&#x21bb;</button>
                    <button
                        onClick={handleRemoveScene}
                        className="danger"
                        disabled={selectedScene === 'GSM HELPER'}
                    >
                        Remove Game
                    </button>
                </div>
                <div className="input-group">
                    <label htmlFor="windowSelect">Setup New Game:</label>
                    <select
                        id="windowSelect"
                        value={selectedWindow.value}
                        onChange={handleWindowChange}
                    >
                        {windows.map((window) => (
                            <option
                                key={window.value}
                                value={window.value}
                            >
                                {window.title}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleRefreshWindows}>&#x21bb;</button>
                    <button
                        onClick={handleCreateNewScene}
                        style={{ width: 300 }}
                    >
                        New Window Capture
                    </button>
                    <button
                        onClick={handleCreateNewGameScene}
                        style={{ width: 300 }}
                    >
                        New Game Capture
                    </button>
                    <span className="tooltip tooltip-left">
                        ❓
                        <span className="tooltiptext">
                            Window Capture works for most applications
                            <br />
                            Game Capture is recommended for fullscreen games.
                        </span>
                    </span>
                </div>
            </div>
            <div className="card">
                <div className="grid-container">
                    <div className="grid-container">
                        <button onClick={handleOpenGSMSettings}>Open GSM Settings</button>
                        <button onClick={handleRunOverlay}>Run Overlay (WIP)</button>
                    </div>
                </div>
            </div>
            <div className="card">
                <h2>Status:</h2>
                <div className="grid-container">
                    <button
                        className={`status-button card ${gsmStatus?.ready ? 'green' : 'red'}`}
                        title={
                            gsmStatus?.ready
                                ? `Status: ${gsmStatus.status}\nWebSockets: ${gsmStatus.websockets_connected.length > 0 ? gsmStatus.websockets_connected.join(', ') : 'None'}\nOBS: ${gsmStatus.obs_connected ? 'Started' : 'Stopped'}\nAnki: ${gsmStatus.anki_connected ? 'Connected' : 'Disconnected'}\nLast Line Received: ${getRelativeTime(gsmStatus?.last_line_received)}`
                                : 'GSM is stopped.'
                        }
                    >
                        <span className="icon">⛏</span>
                        <span>GSM</span>
                        <span>
                            {!gsmStatus
                                ? 'Installing/Initializing'
                                : gsmStatus.words_being_processed.length > 0
                                  ? `Processing: ${gsmStatus.words_being_processed}`
                                  : gsmStatus.ready
                                    ? gsmStatus.status
                                    : 'GSM is not running'}
                        </span>
                    </button>

                    <button
                        className={`status-button card ${!gsmStatus ? 'red' : gsmStatus.clipboard_enabled ? 'green' : gsmStatus.websockets_connected.length > 0 ? 'neutral' : 'red'}`}
                        title={
                            !gsmStatus
                                ? 'Initializing...'
                                : gsmStatus.clipboard_enabled
                                  ? 'Clipboard monitoring is enabled.'
                                  : 'Clipboard monitoring is disabled.'
                        }
                    >
                        <span className="icon">📋</span>
                        <span>Clipboard</span>
                        <span>
                            {!gsmStatus
                                ? 'Initializing'
                                : gsmStatus.clipboard_enabled
                                  ? 'Enabled'
                                  : 'Disabled'}
                        </span>
                    </button>

                    <div className="grid-container">
                        {gsmStatus?.websockets_connected.map((ws) => (
                            <button
                                key={ws}
                                className="status-button card green"
                                title={`${ws} is connected.`}
                            >
                                <span className="icon">🔗</span>
                                <span>{ws}</span>
                                <span>Connected</span>
                            </button>
                        ))}
                    </div>

                    <button
                        className={`status-button card ${!gsmStatus ? 'red' : gsmStatus.obs_connected ? 'green' : 'red'}`}
                        title={
                            !gsmStatus
                                ? 'Initializing...'
                                : gsmStatus.obs_connected
                                  ? 'OBS is connected.'
                                  : 'OBS is disconnected.'
                        }
                    >
                        <span className="icon">📹</span>
                        <span>OBS</span>
                        <span>
                            {!gsmStatus
                                ? 'Initializing'
                                : gsmStatus.obs_connected
                                  ? 'Connected'
                                  : 'Disconnected'}
                        </span>
                    </button>

                    <button
                        className={`status-button card ${!gsmStatus ? 'red' : gsmStatus.anki_connected ? 'green' : 'red'}`}
                        title={
                            !gsmStatus
                                ? 'Initializing...'
                                : gsmStatus.anki_connected
                                  ? 'Anki is connected.'
                                  : 'Anki is disconnected.'
                        }
                    >
                        <span className="icon">📘</span>
                        <span>Anki</span>
                        <span>
                            {!gsmStatus
                                ? 'Initializing'
                                : gsmStatus.anki_connected
                                  ? 'Connected'
                                  : 'Disconnected'}
                        </span>
                    </button>
                </div>
            </div>
            <div className="card">
                <h2>Support GSM Development</h2>
                <p
                    style={{
                        marginBottom: '15px',
                        color: '#afacac',
                        fontSize: '14px',
                        textAlign: 'center',
                    }}
                >
                    GSM will always be free, but a lot of work goes into maintaining and improving
                    it. If you've found this project helpful in any way, please consider supporting
                    continued development:
                </p>
                <div
                    className="donation-links"
                    style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            openExternalLink('https://github.com/sponsors/bpwhelan');
                        }}
                        className="donation-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#24292e',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#1a1e22';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#24292e';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>💖</span>
                        <span>GitHub Sponsors</span>
                    </a>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            openExternalLink('https://ko-fi.com/beangate');
                        }}
                        className="donation-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#ff5722',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e64a19';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#ff5722';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>☕</span>
                        <span>Ko-fi</span>
                    </a>
                    {/* <a href="#" onclick="openExternalLink('https://www.patreon.com/GameSentenceMiner')" className="donation-link" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f96854; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#e5452f'" onmouseout="this.style.backgroundColor='#f96854'">
            <span style="font-size: 16px;">🎯</span>
            <span>Patreon</span>
        </a> */}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            openExternalLink('https://github.com/bpwhelan/GameSentenceMiner');
                        }}
                        className="donation-link"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#4078c0',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#365e9d';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#4078c0';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>⭐</span>
                        <span>Star on GitHub (Free)</span>
                    </a>
                </div>
            </div>
        </>
    );
};
