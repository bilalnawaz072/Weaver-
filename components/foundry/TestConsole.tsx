import React, { useState, useEffect, useMemo } from 'react';

interface TestConsoleProps {
    promptText: string;
    onRunPrompt: (promptText: string, variables: { [key: string]: string }) => Promise<string>;
}

export const TestConsole: React.FC<TestConsoleProps> = ({ promptText, onRunPrompt }) => {
    const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string>('');

    const variables = useMemo(() => {
        const found = promptText.match(/{{\s*(\w+)\s*}}/g) || [];
        return [...new Set(found.map(v => v.replace(/{{\s*|\s*}}/g, '')))];
    }, [promptText]);

    useEffect(() => {
        // Reset state when variables change
        setVariableValues({});
        setResponse('');
        setError(null);
    }, [variables.join(',')]); // Effect depends on the actual list of variables

    const handleVariableChange = (variable: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [variable]: value }));
    };

    const handleRun = async () => {
        setIsLoading(true);
        setError(null);
        setResponse('');
        try {
            const result = await onRunPrompt(promptText, variableValues);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const isRunDisabled = isLoading || variables.some(v => !variableValues[v]?.trim());

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Test Console</h3>
            
            {/* Variables Form */}
            <div className="space-y-4 mb-6">
                {variables.length > 0 ? (
                    variables.map(variable => (
                        <div key={variable}>
                            <label htmlFor={`var-${variable}`} className="block text-sm font-medium text-gray-300 mb-1 capitalize">{variable.replace(/_/g, ' ')}</label>
                            <textarea
                                id={`var-${variable}`}
                                value={variableValues[variable] || ''}
                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                rows={2}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No variables detected in the prompt.</p>
                )}
            </div>

            <button
                onClick={handleRun}
                disabled={isRunDisabled}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Running...' : 'Run'}
            </button>

            {/* Response Area */}
            <div className="mt-6 flex-grow flex flex-col">
                <h4 className="text-lg font-semibold text-gray-200 mb-2">Response</h4>
                <div className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto">
                    {isLoading && <p className="text-gray-400 animate-pulse">Waiting for response...</p>}
                    {error && <pre className="text-red-400 text-sm whitespace-pre-wrap">{error}</pre>}
                    {response && <pre className="text-gray-200 text-sm whitespace-pre-wrap">{response}</pre>}
                    {!isLoading && !error && !response && <p className="text-gray-500">The model's response will appear here.</p>}
                </div>
            </div>
        </div>
    );
};
