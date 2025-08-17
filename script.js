const { useState, useEffect } = React;

function App() {
    const [transcript, setTranscript] = useState('');
    const [prompt, setPrompt] = useState('');
    const [summary, setSummary] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [summaryTopic, setSummaryTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [api, setApi] = useState('groq');
    const [summaryLength, setSummaryLength] = useState('medium');
    const [actionItems, setActionItems] = useState('');
    const [followUpEmail, setFollowUpEmail] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setTranscript(e.target.result);
            reader.readAsText(file);
        }
    };

    const handleGenerateSummary = async () => {
        if (!transcript.trim()) {
            setMessage('Please upload a transcript first.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        setSummary('');
        setActionItems('');
        setFollowUpEmail('');

        const finalPrompt = `Instruction: ${prompt}\n\nSummarize the following transcript in a ${summaryLength} format.\n\nTranscript:\n${transcript}`;

        try {
            const response = await fetch('https://ai-meeting-summarizer-sah6.onrender.com/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: finalPrompt, api: api })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to generate summary.');
            }
            setSummary(result.summary);
        } catch (error) {
            console.error(`Error generating summary with ${api}:`, error);
            setMessage(`An error occurred: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareSummary = async () => {
        if (!summary.trim() || !recipientEmail.trim() || !summaryTopic.trim()) {
            setMessage('Please fill in the recipient email, summary topic, and generate a summary.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(recipientEmail)) {
            setMessage('Please enter a valid email address.');
            return;
        }
        setMessage('Sending email...');
        try {
            const response = await fetch('https://ai-meeting-summarizer-sah6.onrender.com/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipientEmail,
                    subject: summaryTopic,
                    summaryHtml: summary,
                }),
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(<span>Email sent! <a href={result.previewUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">Preview it here.</a></span>);
            } else {
                throw new Error(result.message || 'Failed to send email.');
            }
        } catch (error) {
            setMessage(`Error: ${error.message}. Is the backend server running?`);
        }
    };

    const formatText = (command) => {
        document.execCommand(command, false, null);
    };

    const handleGeminiFeature = async (type) => {
        if (!summary.trim()) {
            setMessage('Please generate a summary first.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        const featurePrompt = type === 'actionItems'
            ? `Based on the following meeting summary, please extract all action items and list them in a clear, concise format:\n\n${summary}`
            : `Based on the following meeting summary, please draft a professional follow-up email to the meeting attendees:\n\n${summary}`;
        try {
            const response = await fetch('https://ai-meeting-summarizer-sah6.onrender.com/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },    
                body: JSON.stringify({ prompt: featurePrompt, api: 'gemini' })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            if (type === 'actionItems') {
                setActionItems(result.summary);
            } else {
                setFollowUpEmail(result.summary);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animated-gradient min-h-screen font-sans antialiased text-gray-800">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="w-full max-w-4xl mx-auto bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden border border-white/20">
                    <header className="p-8 bg-black/10 text-white text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-shadow-lg">AI Meeting Summarizer</h1>
                        <p className="mt-3 text-lg text-white/80 text-shadow">Instantly distill your meeting notes into clear, concise summaries.</p>
                    </header>
                    <main className="p-8 space-y-8">
                        <div className="space-y-3">
                            <label className="block text-xl font-bold text-gray-900">1. Provide Transcript</label>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <input
                                    id="transcript-upload"
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileChange}
                                    className="relative block w-full text-sm text-slate-500 bg-white/80 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 cursor-pointer"
                                />
                            </div>
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Or paste your transcript here..."
                                className="w-full h-48 p-4 border-2 border-white/30 bg-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out placeholder-gray-500"
                            />
                        </div>
                        <hr className="border-white/20" />
                        <div className="space-y-3">
                            <label className="block text-xl font-bold text-gray-900">2. Configure Summary</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="api-select" className="block text-sm font-medium text-gray-700 mb-1">Select AI Model</label>
                                    <select id="api-select" value={api} onChange={(e) => setApi(e.target.value)} className="w-full p-3 border-2 border-white/30 bg-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500">
                                        <option value="groq">Groq (Fast)</option>
                                        <option value="openai">OpenAI (GPT-4o)</option>
                                        <option value="gemini">Gemini (Advanced)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="length-select" className="block text-sm font-medium text-gray-700 mb-1">Summary Length</label>
                                    <select id="length-select" value={summaryLength} onChange={(e) => setSummaryLength(e.target.value)} className="w-full p-3 border-2 border-white/30 bg-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500">
                                        <option value="short">Short</option>
                                        <option value="medium">Medium</option>
                                        <option value="long">Long</option>
                                    </select>
                                </div>
                            </div>
                            <input
                                id="custom-prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Add custom instructions (e.g., 'focus on action items')"
                                className="w-full p-4 border-2 border-white/30 bg-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out placeholder-gray-500 mt-4"
                            />
                        </div>
                        <div className="text-center pt-2">
                            <button
                                onClick={handleGenerateSummary}
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg py-4 px-12 rounded-full shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300"
                            >
                                {isLoading ? 'Generating...' : '✨ Generate Summary'}
                            </button>
                        </div>
                        <hr className="border-white/20" />
                        <div className="space-y-3">
                            <label className="block text-xl font-bold text-gray-900">3. Review & Edit Summary</label>
                            <div className="flex items-center space-x-2 p-2 bg-white/30 rounded-t-xl border-b-2 border-white/20">
                                <button onClick={() => formatText('bold')} className="p-2 rounded-md hover:bg-white/50 font-bold">B</button>
                                <button onClick={() => formatText('italic')} className="p-2 rounded-md hover:bg-white/50 italic">I</button>
                                <button onClick={() => formatText('underline')} className="p-2 rounded-md hover:bg-white/50 underline">U</button>
                            </div>
                            <div
                                id="summary-output"
                                contentEditable={true}
                                onInput={(e) => setSummary(e.currentTarget.innerHTML)}
                                className="summary-output w-full h-56 p-4 border-2 border-white/30 bg-white/30 rounded-b-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: summary }}
                            />
                        </div>
                        {summary && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => handleGeminiFeature('actionItems')} disabled={isLoading} className="flex-1 bg-white/50 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-white/75 transition-all duration-300">
                                        ✨ Suggest Action Items (Gemini)
                                    </button>
                                    <button onClick={() => handleGeminiFeature('draftEmail')} disabled={isLoading} className="flex-1 bg-white/50 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-white/75 transition-all duration-300">
                                        ✨ Draft Follow-up Email (Gemini)
                                    </button>
                                </div>
                                {actionItems && (
                                    <div className="p-4 bg-white/30 rounded-xl">
                                        <h3 className="font-bold text-lg mb-2">Suggested Action Items:</h3>
                                        <div className="whitespace-pre-wrap">{actionItems}</div>
                                    </div>
                                )}
                                {followUpEmail && (
                                    <div className="p-4 bg-white/30 rounded-xl">
                                        <h3 className="font-bold text-lg mb-2">Draft Follow-up Email:</h3>
                                        <div className="whitespace-pre-wrap">{followUpEmail}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        <hr className="border-white/20" />
                        <div className="space-y-3">
                            <label className="block text-xl font-bold text-gray-900">4. Share via Email</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={summaryTopic}
                                    onChange={(e) => setSummaryTopic(e.target.value)}
                                    placeholder="Enter Email Subject"
                                    className="p-4 border-2 border-white/30 bg-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out placeholder-gray-500"
                                />
                                <input
                                    id="recipient-email"
                                    type="email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="Enter recipient's email"
                                    className="p-4 border-2 border-white/30 bg-white/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 ease-in-out placeholder-gray-500"
                                />
                            </div>
                            <button
                                onClick={handleShareSummary}
                                className="w-full mt-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300"
                            >
                                Share Summary
                            </button>
                        </div>
                        {message && (
                            <div className="mt-6 p-4 text-center text-sm font-medium rounded-xl bg-white/50 text-gray-800 border border-white/30">
                                {message}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
        
    );
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
